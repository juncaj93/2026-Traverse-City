// ── Trip events (derived) ───────────────────────────────────────────────────
// The itinerary's `restaurants` array is really a general list of timed events
// (meals, tastings, parks and beaches all live there). This module reads that
// existing data and classifies each into a typed event so the rest of the app
// can reason about "what matters next" — without changing the trip data.

import { itinerary } from "./itinerary";
import type { ItineraryItem } from "./itinerary";
import { toTripDate, parseTime12 } from "../hooks/useTripTime";
import type { DayWeather } from "../hooks/useWeather";

export type EventType = "dining" | "tasting" | "outdoors" | "activity";

export type TripEvent = {
  id: string;
  itemId: string;
  isoDate: string;
  time: string;
  name: string;
  label: string;
  type: EventType;
  note?: string;
  location: string;
  lat?: number;
  lng?: number;
};

export function classifyEvent(name: string): EventType {
  const n = name.toLowerCase();
  if (/vineyard|winery|cellar|tasting/.test(n)) return "tasting";
  if (/beach|park|lighthouse|trail|overlook/.test(n)) return "outdoors";
  if (/restaurant|trattoria|pumpkin|boathouse|store|café|cafe|grill|kitchen/.test(n)) return "dining";
  return "activity";
}

export const EVENT_EMOJI: Record<EventType, string> = {
  dining: "🍽",
  tasting: "🍷",
  outdoors: "🌲",
  activity: "📍",
};

/** All events across the trip, sorted chronologically. */
export function allEvents(): TripEvent[] {
  const events: TripEvent[] = [];
  for (const item of itinerary as ItineraryItem[]) {
    if (!item.isoDate) continue;
    for (let i = 0; i < (item.restaurants?.length ?? 0); i++) {
      const r = item.restaurants![i];
      const type = classifyEvent(r.name);
      events.push({
        id: `${item.id}-ev${i}`,
        itemId: item.id,
        isoDate: item.isoDate,
        time: r.time,
        name: r.name,
        label: r.name,
        type,
        note: r.note,
        location: item.location,
        lat: item.lat,
        lng: item.lng,
      });
    }
  }
  return events.sort(
    (a, b) => toTripDate(a.isoDate, a.time).getTime() - toTripDate(b.isoDate, b.time).getTime(),
  );
}

/** Meal label from a dining event's time. */
export function mealLabel(time: string): string {
  const t = parseTime12(time);
  const h = t?.h ?? 19;
  if (h < 11) return "Breakfast";
  if (h < 15) return "Lunch";
  if (h < 17) return "Afternoon";
  return "Dinner";
}

// ── Today's Essentials ──────────────────────────────────────────────────────
// A short, smart "bring this" list derived from the day's activities + weather.
// Capped at four so it reads as a hint, never a checklist.
export type Essential = { icon: string; label: string };

export function todaysEssentials(dayEvents: TripEvent[], wx: DayWeather | null): Essential[] {
  const types = new Set(dayEvents.map((e) => e.type));
  const cold = wx != null && wx.minF < 55;
  const rain = wx != null && wx.precipPct >= 40;
  const out: Essential[] = [];
  const add = (icon: string, label: string) => {
    if (!out.some((e) => e.label === label)) out.push({ icon, label });
  };

  if (cold) add("🧥", "Light jacket");
  if (types.has("outdoors")) add("👟", "Walking shoes");
  if (types.has("tasting")) add("🍷", "Designated driver");
  add("🕶️", "Sunglasses");
  if (!rain) add("🧴", "Sunscreen");
  if (rain) add("☔️", "Rain layer");
  add("📷", "Camera");

  return out.slice(0, 4);
}
