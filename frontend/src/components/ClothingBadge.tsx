import { useState, useRef } from "react";
import type { CSSProperties } from "react";
import { createPortal } from "react-dom";
import { Shirt, X } from "lucide-react";
import type { DayWeather } from "../hooks/useWeather";

interface ClothingBadgeProps {
  hint: string;
  weather?: DayWeather | null;
}

function weatherAddendum(w: DayWeather): string {
  const { maxF, minF, precipPct } = w;
  const tempNote =
    maxF >= 72 ? `${maxF}°F high — light layers work fine.`
    : maxF >= 62 ? `${maxF}°F high / ${minF}°F low — bring a jacket or fleece for evenings.`
    : `${maxF}°F high / ${minF}°F low — warm layers essential throughout.`;
  const rainNote =
    precipPct > 50 ? `🌧 ${precipPct}% chance of rain — pack an umbrella or waterproof layer.`
    : precipPct > 25 ? `⛅ ${precipPct}% chance of showers — a packable rain jacket is smart.`
    : "";
  return [tempNote, rainNote].filter(Boolean).join(" ");
}

export function ClothingBadge({ hint, weather }: ClothingBadgeProps) {
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState<CSSProperties>({});
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleToggle = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const w = 256; // popover width px
      const spaceBelow = window.innerHeight - rect.bottom;
      const above = spaceBelow < 240;

      let left = rect.left;
      if (left + w > window.innerWidth - 8) left = window.innerWidth - w - 8;
      if (left < 8) left = 8;

      setStyle(above ? {
        position: "fixed",
        left,
        bottom: window.innerHeight - rect.top + 6,
        width: w,
        zIndex: 9999,
      } : {
        position: "fixed",
        left,
        top: rect.bottom + 6,
        width: w,
        zIndex: 9999,
      });
    }
    setOpen((o) => !o);
  };

  const popover = open ? createPortal(
    <>
      <div className="fixed inset-0" style={{ zIndex: 9998 }} onClick={() => setOpen(false)} />
      <div style={style} className="bg-card border border-border rounded-xl shadow-2xl p-3">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <span className="font-sans text-[11px] font-bold text-foreground uppercase tracking-wider">
            What to Wear
          </span>
          <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground flex-shrink-0 -mt-0.5">
            <X className="w-3 h-3" />
          </button>
        </div>
        <p className="font-sans text-xs text-foreground/80 leading-relaxed">{hint}</p>
        {weather && (
          <div className="mt-2 pt-2 border-t border-border font-sans text-xs text-muted-foreground leading-relaxed">
            {weatherAddendum(weather)}
          </div>
        )}
      </div>
    </>,
    document.body,
  ) : null;

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleToggle}
        title="What to wear"
        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-sans font-medium transition-colors"
        style={{ background: "#FFF8E1", color: "#7a5c00", border: "1px solid #FFB612" }}
      >
        <Shirt className="w-3 h-3" />
        <span className="hidden sm:inline">Wear</span>
      </button>
      {popover}
    </>
  );
}
