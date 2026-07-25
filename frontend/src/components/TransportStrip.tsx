import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { todayIsoDate } from "../hooks/useTripTime";

/**
 * Collapsible transport-info strip ("Getting There" / "Heading Home").
 *
 * Default: collapsed on first visit. Once expanded, stays expanded for the rest
 * of the session (sessionStorage); refreshing resets to collapsed. When today
 * is past `autoCollapseAfterIso` the lines gray out to signal a completed leg.
 */
export function TransportStrip({
  stripId,
  label,
  accentColor,
  lines,
  autoCollapseAfterIso,
}: {
  stripId: string;
  label: string;
  accentColor: string;
  lines: string[];
  autoCollapseAfterIso?: string;
}) {
  const storageKey = `strip-open-${stripId}`;
  const isPast = autoCollapseAfterIso ? todayIsoDate() > autoCollapseAfterIso : false;

  const [open, setOpen] = useState<boolean>(() => {
    try { return sessionStorage.getItem(storageKey) === "true"; } catch { return false; }
  });

  const toggle = () => {
    const next = !open;
    setOpen(next);
    try {
      if (next) sessionStorage.setItem(storageKey, "true");
      else sessionStorage.removeItem(storageKey);
    } catch { /* ignore */ }
  };

  return (
    <div
      className="strip-accent-border strip-tinted rounded-r-xl mx-4 mt-2 mb-2.5 overflow-hidden"
      style={{ ["--strip-accent" as string]: accentColor }}
    >
      <button
        onClick={toggle}
        aria-expanded={open}
        className="press tap-target relative w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <span className="strip-accent-text font-sans text-xs font-medium">{label}</span>
        <ChevronDown
          className={`strip-accent-text w-3.5 h-3.5 flex-shrink-0 transition-transform duration-[var(--dur-base)] ease-[var(--ease-premium)] ${open ? "rotate-180" : ""}`}
        />
      </button>

      <div className="collapsible" data-open={open}>
        <div>
          <div className={`px-4 pb-3.5 space-y-1.5 ${isPast ? "opacity-50" : ""}`}>
            {lines.map((line, i) => (
              <p key={i} className="font-sans text-xs text-foreground/70 leading-relaxed">{line}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
