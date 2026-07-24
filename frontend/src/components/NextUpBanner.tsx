import { useState, useEffect } from "react";
import { ChevronRight, Clock } from "lucide-react";
import { getNow, toTripDate, fmtCountdown, isDayPast, isDayToday } from "../hooks/useTripTime";
import type { ItineraryItem } from "../data/itinerary";

type Event = {
  name: string;
  time: string;
  isoDate: string;
  itemId: string;
};

function buildEvents(itinerary: ItineraryItem[]): Event[] {
  const events: Event[] = [];
  for (const item of itinerary) {
    if (isDayPast(item.isoDate)) continue;
    for (const r of item.restaurants ?? []) {
      events.push({ name: r.name, time: r.time, isoDate: item.isoDate, itemId: item.id });
    }
    if (!item.restaurants?.length) {
      events.push({ name: item.title, time: "8:00 am", isoDate: item.isoDate, itemId: item.id });
    }
  }
  return events;
}

export function NextUpBanner({ itinerary }: { itinerary: ItineraryItem[] }) {
  const [, tick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => tick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const now = getNow();
  const events = buildEvents(itinerary);
  const next = events.find((e) => toTripDate(e.isoDate, e.time) > now);

  if (!next) {
    return (
      <div id="next-up-banner" className="sticky top-0 z-40 w-full border-b border-black/10" style={{ background: "#0b3d2e" }}>
        <div className="max-w-3xl mx-auto px-4 py-2 flex items-center gap-2">
          <span className="text-base">🚗</span>
          <span className="font-sans text-xs font-semibold text-white/90">Safe travels home to Wixom!</span>
        </div>
      </div>
    );
  }

  const eventDate = toTripDate(next.isoDate, next.time);
  const msUntil = eventDate.getTime() - now.getTime();
  const countdown = fmtCountdown(msUntil);
  const isToday = isDayToday(next.isoDate);
  const isSoon = msUntil < 3 * 60 * 60 * 1000;

  const scrollToItem = () => {
    const el = document.getElementById(next.itemId);
    if (!el) return;
    const bannerEl = document.getElementById("next-up-banner");
    const bannerH = bannerEl?.offsetHeight ?? 0;
    const top = el.getBoundingClientRect().top + window.scrollY - bannerH - 8;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <div
      id="next-up-banner"
      className="sticky top-0 z-40 w-full border-b border-black/10"
      style={{ background: isSoon ? "#8b0000" : "#0a3d62" }}
    >
      <div className="max-w-3xl mx-auto px-4 py-2 flex items-center gap-3">
        <Clock className="w-3.5 h-3.5 flex-shrink-0 text-white/75" />
        <div className="flex-1 min-w-0 flex items-baseline gap-1.5 overflow-hidden">
          <span className="font-sans text-[11px] text-white/80 whitespace-nowrap flex-shrink-0">
            {isToday ? "Next up" : "Coming up"}
          </span>
          <span className="font-sans text-xs font-semibold text-white truncate">{next.name}</span>
          <span className="font-sans text-[11px] text-white/80 whitespace-nowrap flex-shrink-0">· {next.time}</span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <span
            className="font-sans text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: isSoon ? "#FFB612" : "rgba(255,255,255,0.15)", color: isSoon ? "#000" : "rgba(255,255,255,0.9)" }}
          >
            {countdown}
          </span>
          <button onClick={scrollToItem} className="text-white/50 hover:text-white transition-colors ml-1" title="Jump to event">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
