import { useState, useEffect } from "react";

export function useDarkMode() {
  const [dark, setDark] = useState<boolean>(() => {
    try { return localStorage.getItem("darkMode") === "true"; } catch { return false; }
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    try { localStorage.setItem("darkMode", String(dark)); } catch { /* noop */ }
  }, [dark]);

  return { dark, toggle: () => setDark((d) => !d) };
}
