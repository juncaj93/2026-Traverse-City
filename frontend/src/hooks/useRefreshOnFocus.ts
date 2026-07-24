import { useEffect, useRef } from "react";

/**
 * Cheapest possible way to keep admin overrides fresh across devices.
 *
 * WHY NO TIMER
 * There is deliberately no interval here — no SSE, no WebSockets, no
 * setInterval poll. Data is refetched only when the component first mounts,
 * and when the tab becomes visible again or the window regains focus.
 * Mutations (cancelling, rescheduling, adding an item) return the updated
 * state directly in the POST response, so the person making the change sees
 * it instantly. Everyone else picks it up next time they open or return to
 * the page.
 */
export function useRefreshOnFocus(
  fetcher: () => void | Promise<void>,
  minGapMs = 15_000,
) {
  // Keep the latest fetcher without re-running the effect every render.
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    let lastRun = 0;
    let cancelled = false;

    const run = async (force = false) => {
      if (cancelled) return;
      const now = Date.now();
      // visibilitychange and focus often fire together — debounce them.
      if (!force && now - lastRun < minGapMs) return;
      lastRun = now;
      try {
        await fetcherRef.current();
      } catch {
        /* ignore */
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") void run();
    };
    const onFocus = () => void run();

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", onFocus);

    void run(true); // initial load

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", onFocus);
    };
  }, [minGapMs]);
}
