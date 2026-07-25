import { useEffect } from "react";

const KEY = "scrollY";

/**
 * Remembers how far the user had scrolled and restores it when they return to
 * the app in the same session (e.g. switching away and back). First-ever
 * visits start at the top.
 */
export function useScrollMemory() {
  useEffect(() => {
    const prevRestoration = history.scrollRestoration;
    try { history.scrollRestoration = "manual"; } catch { /* ignore */ }

    let lateTimer: ReturnType<typeof setTimeout> | undefined;
    const saved = parseInt(sessionStorage.getItem(KEY) ?? "0", 10);
    if (saved > 0) {
      const restore = () => window.scrollTo(0, saved);
      requestAnimationFrame(() => requestAnimationFrame(restore));
      lateTimer = setTimeout(restore, 350);
    }

    let raf = 0;
    const save = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        try { sessionStorage.setItem(KEY, String(Math.round(window.scrollY))); } catch { /* ignore */ }
      });
    };
    window.addEventListener("scroll", save, { passive: true });
    window.addEventListener("pagehide", save);
    document.addEventListener("visibilitychange", save);

    return () => {
      window.removeEventListener("scroll", save);
      window.removeEventListener("pagehide", save);
      document.removeEventListener("visibilitychange", save);
      cancelAnimationFrame(raf);
      if (lateTimer) clearTimeout(lateTimer);
      try { history.scrollRestoration = prevRestoration; } catch { /* ignore */ }
    };
  }, []);
}
