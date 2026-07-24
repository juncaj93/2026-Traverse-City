import { Sun, CalendarClock } from "lucide-react";
import type { ItineraryItem } from "../data/itinerary";
import { useWeather } from "../hooks/useWeather";
import { isDayPast, isDayToday } from "../hooks/useTripTime";
import { weatherAddendum } from "./ClothingBadge";

function addDays(isoDate: string, n: number): string {
  const d = new Date(`${isoDate}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function realTodayISO(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Detroit" });
}

function WeatherCard({ item, label }: { item: ItineraryItem; label: string }) {
  const weather = useWeather(item.lat, item.lng, item.isoDate);
  const tooFarOut = item.isoDate > addDays(realTodayISO(), 15);

  return (
    <div className="tc-card flex-1 min-w-[9.5rem] px-4 py-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className="text-[10px] font-sans text-muted-foreground">{item.date}</span>
      </div>
      {weather ? (
        <>
          <div className="flex items-baseline gap-1.5 mt-1">
            <Sun className="w-4 h-4 text-accent-foreground flex-shrink-0" />
            <span className="font-serif text-2xl font-semibold tabular-nums">{weather.maxF}°</span>
            <span className="text-sm font-sans text-muted-foreground tabular-nums">/{weather.minF}°F</span>
            <span className="ml-auto inline-flex items-center gap-1 text-[9px] font-sans text-emerald-700 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
            </span>
          </div>
          <p className="text-xs font-sans text-muted-foreground mt-1 leading-snug">{weatherAddendum(weather)}</p>
        </>
      ) : (
        <p className="text-xs font-sans text-muted-foreground inline-flex items-center gap-1.5 mt-2">
          <CalendarClock className="w-3.5 h-3.5 flex-shrink-0" />
          {tooFarOut ? "Forecast opens 15 days out" : "No forecast available"}
        </p>
      )}
    </div>
  );
}

export function WeatherSummary({ itinerary }: { itinerary: ItineraryItem[] }) {
  const primary = itinerary.find((d) => isDayToday(d.isoDate)) ?? itinerary.find((d) => !isDayPast(d.isoDate));
  if (!primary) return null;

  const idx = itinerary.findIndex((d) => d.id === primary.id);
  const secondary = itinerary[idx + 1];

  return (
    <div className="flex gap-3">
      <WeatherCard item={primary} label={isDayToday(primary.isoDate) ? "Today" : "Next up"} />
      {secondary && <WeatherCard item={secondary} label="Then" />}
    </div>
  );
}
