import fs from "node:fs";
import path from "node:path";

/**
 * Tiny persistence layer for a handful of small JSON blobs.
 *
 * WHY THIS EXISTS
 * On Replit Autoscale the container's filesystem is ephemeral: when the
 * container goes idle and shuts down, anything written to disk is lost and the
 * next container starts from the deployed image. This writes to Replit's
 * built-in key-value database (REPLIT_DB_URL) when available, which persists
 * across restarts and costs effectively nothing for a few kilobytes.
 *
 * If the key-value database is unavailable (e.g. not running on Replit),
 * this falls back to local-disk behaviour instead of crashing — the app
 * still works, it just loses state whenever the process restarts. Check
 * GET /api/storage-status to see which backend is live.
 */

type KvClient = {
  get(key: string): Promise<{ ok?: boolean; value?: unknown } | unknown>;
  set(key: string, value: unknown): Promise<unknown>;
};

const DATA_DIR = path.resolve(process.cwd(), "data");
try {
  fs.mkdirSync(DATA_DIR, { recursive: true });
} catch {
  /* ignore */
}

let kv: KvClient | null = null;
let mode: "replit-kv" | "local-disk" | "unknown" = "unknown";
let initPromise: Promise<void> | null = null;

async function init(): Promise<void> {
  try {
    if (!process.env["REPLIT_DB_URL"]) {
      throw new Error("REPLIT_DB_URL is not set");
    }
    const mod: Record<string, unknown> = await import("@replit/database");
    const Ctor = (mod["default"] ?? mod["Client"] ?? mod) as new () => KvClient;
    const client = new Ctor();
    // Prove the connection actually works before committing to it.
    await client.get("__startup_probe__");
    kv = client;
    mode = "replit-kv";
  } catch {
    kv = null;
    mode = "local-disk";
  }
}

async function ready(): Promise<void> {
  if (!initPromise) initPromise = init();
  await initPromise;
}

export async function storageMode(): Promise<string> {
  await ready();
  return mode;
}

function diskPath(key: string): string {
  return path.join(DATA_DIR, `${key}.json`);
}

export async function readJson<T>(key: string, fallback: T): Promise<T> {
  await ready();

  if (kv) {
    try {
      const res = (await kv.get(key)) as { ok?: boolean; value?: unknown } | null;
      // Replit KV returns { ok: false, error: {...} } for missing keys — treat as not found.
      if (res && typeof res === "object" && "ok" in res && res.ok === false) {
        return fallback;
      }
      if (res && typeof res === "object" && "value" in res) {
        if (res.value !== null && res.value !== undefined) return res.value as T;
        return fallback;
      }
      if (res !== null && res !== undefined) return res as unknown as T;
      return fallback;
    } catch {
      /* fall through to disk */
    }
  }

  try {
    return JSON.parse(fs.readFileSync(diskPath(key), "utf8")) as T;
  } catch {
    return fallback;
  }
}

export async function writeJson(key: string, value: unknown): Promise<void> {
  await ready();

  if (kv) {
    try {
      await kv.set(key, value);
      return;
    } catch {
      /* fall through to disk */
    }
  }

  try {
    fs.writeFileSync(diskPath(key), JSON.stringify(value));
  } catch {
    /* ignore — nothing more we can do */
  }
}
