import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import {
  getNow, todayIsoDate, toTripDate, fmtCountdown, isDayToday, isTomorrow, parseTime12,
} from "../hooks/useTripTime";
import { itinerary } from "../data/itinerary";
import { allEvents, EVENT_EMOJI, mealLabel, todaysEssentials, type TripEvent } from "../data/tripEvents";
import { useCurrentWeather, useWeather } from "../hooks/useWeather";
import { GOLD } from "../lib/theme";

const ITEMS = itinerary;
const FIRST = ITEMS[0];
const LAST = ITEMS[ITEMS.length - 1];

/** Smooth-scroll to an itinerary item, clearing the sticky nav. */
export function scrollToItemId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const navH = document.querySelector("nav")?.offsetHeight ?? 50;
  const top = el.getBoundingClientRect().top + window.scrollY - navH - 8;
  window.scrollTo({ top, behavior: "smooth" });
}

type Focus =
  | { kind: "event"; event: TripEvent }
  | { kind: "sunset"; date: Date; itemId: string }
  | null;

function smartLine(focus: Focus, now: Date): { emoji: string; title: string; phrase: string } {
  if (!focus) return { emoji: "🚗", title: "Safe travels home", phrase: "Until the next trip" };

  if (focus.kind === "sunset") {
    return { emoji: "🌅", title: "Sunset over the bay", phrase: `Sunset in ${fmtCountdown(focus.date.getTime() - now.getTime())}` };
  }

  const ev = focus.event;
  const evDate = toTripDate(ev.isoDate, ev.time);
  const ms = evDate.getTime() - now.getTime();
  const cd = fmtCountdown(ms);
  const emoji = EVENT_EMOJI[ev.type];

  if (!isDayToday(ev.isoDate)) {
    const when = isTomorrow(ev.isoDate) ? `Tomorrow at ${ev.time}` : ev.time;
    return { emoji, title: ev.label, phrase: when };
  }

  switch (ev.type) {
    case "dining":
      return { emoji, title: ev.label, phrase: `${mealLabel(ev.time)} in ${cd}` };
    case "tasting":
      return { emoji, title: ev.label, phrase: `Tasting in ${cd}` };
    default:
      return { emoji, title: ev.label, phrase: `In ${cd}` };
  }
}

export function SmartToday() {
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const now = getNow();
  const todayIso = todayIsoDate();
  const phase: "pre" | "during" | "post" =
    todayIso < FIRST.isoDate ? "pre" : todayIso > LAST.isoDate ? "post" : "during";

  const todayItem = ITEMS.find((i) => isDayToday(i.isoDate));
  const locItem = todayItem ?? FIRST;

  const currentTemp = useCurrentWeather(locItem.lat, locItem.lng);
  const todayWx = useWeather(locItem.lat, locItem.lng, todayIso);

  const events = allEvents();
  const nextEvent = events.find((e) => toTripDate(e.isoDate, e.time).getTime() > now.getTime());

  let focus: Focus = nextEvent ? { kind: "event", event: nextEvent } : null;

  const nextIsToday = nextEvent != null && isDayToday(nextEvent.isoDate);
  if (phase === "during" && !nextIsToday && todayWx?.sunset) {
    const s = todayWx.sunset;
    const hasTz = /[+\-]\d\d:?\d\d$|Z$/.test(s);
    const hasSecs = /T\d\d:\d\d:\d\d/.test(s);
    const sunsetDate = new Date(hasTz ? s : `${s}${hasSecs ? "" : ":00"}-04:00`);
    if (sunsetDate.getTime() > now.getTime()) {
      focus = { kind: "sunset", date: sunsetDate, itemId: locItem.id };
    }
  }

  const goThere = () => {
    const id = focus?.kind === "event" ? focus.event.itemId : (focus?.kind === "sunset" ? focus.itemId : locItem.id);
    scrollToItemId(id);
  };

  // ── PRE-TRIP: countdown to arrival ────────────────────────────────────────
  if (phase === "pre") {
    const arrival = toTripDate(FIRST.isoDate, "1:00 pm");
    const cd = fmtCountdown(arrival.getTime() - now.getTime());
    return (
      <div id="smart-today" className="max-w-3xl mx-auto px-4 pt-3 pb-2">
        <div className="rise-in rounded-2xl bg-card px-5 py-5 shadow-sm">
          <p className="font-sans text-[11.5px] uppercase tracking-[0.16em] text-muted-foreground">
            Your getaway begins in
          </p>
          <p className="font-sans font-semibold text-4xl text-foreground leading-none tracking-tight tabular-nums mt-2">{cd}</p>
          <p className="font-sans text-[0.95rem] text-muted-foreground mt-2.5">
            First stop · <span className="text-foreground font-medium">Old Mission Peninsula</span> 🌊
            {currentTemp != null && <span className="text-muted-foreground"> · {currentTemp}° now</span>}
          </p>
        </div>
      </div>
    );
  }

  // ── POST-TRIP ─────────────────────────────────────────────────────────────
  if (phase === "post") {
    return (
      <div id="smart-today" className="max-w-3xl mx-auto px-4 pt-3 pb-2">
        <div className="rise-in rounded-2xl bg-card px-6 py-8 shadow-sm text-center">
          <p className="font-serif text-2xl text-foreground">Welcome home 🚗</p>
          <p className="font-sans text-sm text-muted-foreground mt-2">A weekend on the bay.</p>
        </div>
      </div>
    );
  }

  // ── DURING TRIP ───────────────────────────────────────────────────────────
  const line = smartLine(focus, now);
  const dayLabel = todayItem?.day ?? "";
  const essentials = todaysEssentials(events.filter((e) => e.isoDate === todayIso), todayWx);

  return (
    <div id="smart-today" className="max-w-3xl mx-auto px-4 pt-3 pb-2">
      <div className="rise-in rounded-2xl bg-card overflow-hidden shadow-sm">
        <div className="px-5 pt-4 pb-3.5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-sans text-[11.5px] uppercase tracking-[0.16em] text-muted-foreground">
              Today{dayLabel ? ` · ${dayLabel}` : ""}
            </p>
            <p className="font-serif text-[1.4rem] sm:text-[1.75rem] text-foreground leading-tight mt-2 text-balance">
              {locItem.location} <span className="align-middle">🌊</span>
            </p>
          </div>
          {currentTemp != null && (
            <div className="text-right flex-shrink-0">
              <p className="font-serif text-[1.75rem] text-foreground leading-none tabular-nums">{currentTemp}°</p>
              {todayWx && (
                <p className="font-sans text-[10px] text-muted-foreground mt-1 tabular-nums">
                  {todayWx.maxF}° / {todayWx.minF}°
                </p>
              )}
            </div>
          )}
        </div>

        <div className="mx-5 border-t border-border/70" />

        <button
          onClick={goThere}
          className="press w-full px-5 py-3.5 flex items-center gap-3.5 text-left hover:bg-muted/40 active:bg-muted/50 transition-colors"
        >
          <span className="text-[1.4rem] leading-none flex-shrink-0">{line.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="font-sans text-[11.5px] uppercase tracking-[0.14em] text-muted-foreground">Next up</p>
            <p className="font-sans text-[0.95rem] font-semibold text-foreground leading-snug mt-1">{line.title}</p>
            <p className="font-sans text-xs text-muted-foreground mt-1">{line.phrase}</p>
          </div>
          <span
            className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[11px] font-sans font-semibold text-black"
            style={{ background: GOLD }}
          >
            Go There <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </button>

        {essentials.length > 0 && (
          <>
            <div className="mx-5 border-t border-border/70" />
            <div className="px-5 py-3.5">
              <p className="font-sans text-[11.5px] uppercase tracking-[0.14em] text-muted-foreground mb-2">
                Bring today
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                {essentials.map((e, i) => (
                  <span key={i} className="font-sans text-xs text-foreground/80 whitespace-nowrap">
                    <span className="mr-1">{e.icon}</span>{e.label}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
