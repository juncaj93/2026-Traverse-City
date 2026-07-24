import { Router } from "express";
import type { Request, Response } from "express";
import { readJson, writeJson, storageMode } from "../lib/store";

// COST NOTE — DO NOT REINTRODUCE SSE.
// Clients refetch GET /admin/overrides when the page is opened or refocused
// (see useRefreshOnFocus.ts on the frontend), and every mutation below
// returns the full updated object so the person making the change sees it
// immediately. Do not add SSE, WebSockets, long-polling, or a setInterval
// poll here.

const KEY = "admin-overrides";

// PIN — simple deterrent for family/couple use, not real auth.
const ADMIN_PIN = process.env["ADMIN_PIN"] ?? "1526";

type AdminOverrides = {
  cancelled:   { dayId: string; restaurantName: string }[];
  timeChanges: { dayId: string; restaurantName: string; newTime: string }[];
  additions:   { id: string; dayId: string; name: string; time: string; description: string }[];
};

const EMPTY: AdminOverrides = { cancelled: [], timeChanges: [], additions: [] };

async function read(): Promise<AdminOverrides> {
  const o = await readJson<Partial<AdminOverrides>>(KEY, EMPTY);
  // Defensive: never let a malformed blob crash a route.
  return {
    cancelled:   Array.isArray(o?.cancelled)   ? o.cancelled   : [],
    timeChanges: Array.isArray(o?.timeChanges) ? o.timeChanges : [],
    additions:   Array.isArray(o?.additions)   ? o.additions   : [],
  };
}

async function write(o: AdminOverrides): Promise<void> {
  await writeJson(KEY, o);
}

const router = Router();

// Diagnostic: tells you whether persistent storage is actually working.
// Expected: {"storage":"replit-kv"}. If it says "local-disk", overrides
// reset whenever the process restarts.
router.get("/storage-status", async (_req, res: Response) => {
  res.setHeader("Cache-Control", "no-store");
  res.json({ storage: await storageMode() });
});

router.get("/admin/overrides", async (_req, res: Response) => {
  res.setHeader("Cache-Control", "no-store");
  res.json(await read());
});

router.post("/admin/ping", (req: Request, res: Response) => {
  const { pin } = req.body as { pin?: string };
  if (pin !== ADMIN_PIN) { res.status(401).json({ error: "Wrong PIN" }); return; }
  res.json({ ok: true });
});

router.post("/admin/cancel", async (req: Request, res: Response) => {
  const { pin, dayId, restaurantName } = req.body as { pin?: string; dayId?: string; restaurantName?: string };
  if (pin !== ADMIN_PIN) { res.status(401).json({ error: "Wrong PIN" }); return; }
  if (!dayId || !restaurantName) { res.status(400).json({ error: "dayId and restaurantName required" }); return; }
  const o = await read();
  const already = o.cancelled.some(c => c.dayId === dayId && c.restaurantName === restaurantName);
  if (!already) o.cancelled.push({ dayId, restaurantName });
  await write(o);
  res.json(o);
});

router.post("/admin/restore", async (req: Request, res: Response) => {
  const { pin, dayId, restaurantName } = req.body as { pin?: string; dayId?: string; restaurantName?: string };
  if (pin !== ADMIN_PIN) { res.status(401).json({ error: "Wrong PIN" }); return; }
  if (!dayId || !restaurantName) { res.status(400).json({ error: "dayId and restaurantName required" }); return; }
  const o = await read();
  o.cancelled = o.cancelled.filter(c => !(c.dayId === dayId && c.restaurantName === restaurantName));
  await write(o);
  res.json(o);
});

router.post("/admin/update-time", async (req: Request, res: Response) => {
  const { pin, dayId, restaurantName, newTime } = req.body as { pin?: string; dayId?: string; restaurantName?: string; newTime?: string };
  if (pin !== ADMIN_PIN) { res.status(401).json({ error: "Wrong PIN" }); return; }
  if (!dayId || !restaurantName || !newTime) { res.status(400).json({ error: "dayId, restaurantName, newTime required" }); return; }
  const o = await read();
  o.timeChanges = o.timeChanges.filter(t => !(t.dayId === dayId && t.restaurantName === restaurantName));
  o.timeChanges.push({ dayId, restaurantName, newTime });
  await write(o);
  res.json(o);
});

router.post("/admin/add", async (req: Request, res: Response) => {
  const { pin, dayId, name, time, description } = req.body as { pin?: string; dayId?: string; name?: string; time?: string; description?: string };
  if (pin !== ADMIN_PIN) { res.status(401).json({ error: "Wrong PIN" }); return; }
  if (!dayId || !name || !time) { res.status(400).json({ error: "dayId, name, time required" }); return; }
  const o = await read();
  const id = `add-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  o.additions.push({ id, dayId, name, time, description: description ?? "" });
  await write(o);
  res.json(o);
});

router.delete("/admin/addition/:id", async (req: Request, res: Response) => {
  const { pin } = req.body as { pin?: string };
  if (pin !== ADMIN_PIN) { res.status(401).json({ error: "Wrong PIN" }); return; }
  const o = await read();
  o.additions = o.additions.filter(a => a.id !== req.params.id);
  await write(o);
  res.json(o);
});

export default router;
