import { useState, useEffect } from "react";

const DARK_QUERY = "(prefers-color-scheme: dark)";

/**
 * Dark mode follows the device's system appearance automatically and is NOT
 * persisted. The toggle flips it for the current session only — reloading the
 * page returns to whatever the phone/OS is set to.
 */
export function useDarkMode() {
  const [dark, setDark] = useState<boolean>(() => {
    try { return window.matchMedia(DARK_QUERY).matches; } catch { return false; }
  });

  // Live-follow the system setting (e.g. iOS switching to night automatically).
  useEffect(() => {
    let mq: MediaQueryList;
    try { mq = window.matchMedia(DARK_QUERY); } catch { return; }
    const onChange = (e: MediaQueryListEvent) => setDark(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return { dark, toggle: () => setDark((d) => !d) };
}
