import { MapPin, Hotel, Clock, CheckCircle2, Plus } from "lucide-react";
import type { ItineraryItem } from "../data/itinerary";
import { ClothingBadge } from "./ClothingBadge";
import { useWeather } from "../hooks/useWeather";
import { isDayPast, isDayToday, isEventPast } from "../hooks/useTripTime";
import { useAdminOverrides } from "../hooks/useAdminOverrides";

function WeatherBadge({ maxF, minF, precipPct }: { maxF: number; minF: number; precipPct: number }) {
  const showRain = precipPct > 15;
  return (
    <div
      title={`High ${maxF}°F · Low ${minF}°F · ${precipPct}% precipitation`}
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-sans font-medium cursor-default select-none"
      style={{ background: "hsl(200,60%,94%)", color: "hsl(200,60%,30%)", border: "1px solid hsl(200,40%,82%)" }}
    >
      <span>{maxF}°F/{minF}°F</span>
      {showRain && <span>· 🌧 {precipPct}%</span>}
      <span className="flex items-center gap-0.5 ml-0.5 opacity-70">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[9px] font-sans text-emerald-700 dark:text-emerald-400">Live</span>
      </span>
    </div>
  );
}

interface DayRowProps {
  item: ItineraryItem;
  isNext: boolean;
}

export function DayRow({ item, isNext }: DayRowProps) {
  const { overrides } = useAdminOverrides();
  const weather = useWeather(item.lat, item.lng, item.isoDate);

  const past  = isDayPast(item.isoDate);
  const today = isDayToday(item.isoDate);

  const showWeather  = !past && (today || isNext) && !!weather;
  const showClothing = !past && today;

  const cancelledSet = new Set(
    overrides.cancelled.filter((c) => c.dayId === item.id).map((c) => c.restaurantName),
  );
  const timeOverrides = Object.fromEntries(
    overrides.timeChanges.filter((t) => t.dayId === item.id).map((t) => [t.restaurantName, t.newTime]),
  );
  const additions = overrides.additions.filter((a) => a.dayId === item.id);

  const allRestaurants = item.restaurants ?? [];
  const hasContent = allRestaurants.length > 0 || additions.length > 0;

  const firstFutureRestaurantIdx = allRestaurants.findIndex((r) => {
    const isCancelled = cancelledSet.has(r.name);
    const isRPast = !isCancelled && (past || (today && isEventPast(item.isoDate, r.time)));
    return !isCancelled && !isRPast;
  });

  return (
    <div
      id={item.id}
      className={`
        flex items-start gap-4 py-3.5 px-4 border-b border-border last:border-0 transition-colors duration-100
        ${past ? "opacity-45" : "hover:bg-black/[0.025]"}
        ${today ? "bg-amber-50/60 dark:bg-amber-900/10" : ""}
      `}
    >
      <div className="flex-shrink-0 w-20 pt-0.5">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="inline-block text-[10px] font-sans font-bold tracking-[0.12em] uppercase px-1.5 py-0.5 rounded bg-accent text-accent-foreground">
            {item.day}
          </span>
          {past  && <CheckCircle2 className="w-3 h-3 text-muted-foreground/40" />}
          {today && (
            <span className="inline-block text-[9px] font-sans font-bold tracking-[0.1em] uppercase px-1 py-0.5 rounded bg-amber-400 text-black">
              Today
            </span>
          )}
        </div>
        <p className={`text-xs font-sans leading-tight ${past ? "text-muted-foreground/60" : "text-muted-foreground"}`}>
          {item.date}
        </p>
      </div>

      <div className="flex-1 min-w-0">
        <p className={`font-serif font-semibold text-base leading-snug mb-1 ${past ? "text-foreground/50 line-through decoration-foreground/25" : "text-foreground"}`}>
          {item.title}
        </p>

        {item.description && (
          <p className="text-xs font-sans text-muted-foreground mb-1.5">{item.description}</p>
        )}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1.5">
          <a
            href={item.mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-sans font-medium text-accent-foreground hover:opacity-70"
          >
            <MapPin className="w-3 h-3 flex-shrink-0" />
            {item.location}
          </a>

          {item.hotelNote && (
            item.hotel?.mapsUrl ? (
              <a
                href={item.hotel.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-sans text-muted-foreground hover:underline"
              >
                <Hotel className="w-3 h-3 flex-shrink-0" />
                {item.hotelNote}
              </a>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-sans text-muted-foreground">
                <Hotel className="w-3 h-3 flex-shrink-0" />
                {item.hotelNote}
              </span>
            )
          )}

          {item.mealNote && !hasContent && (
            <span className="text-xs font-sans text-muted-foreground italic">{item.mealNote}</span>
          )}

          {showWeather && weather && (
            <WeatherBadge maxF={weather.maxF} minF={weather.minF} precipPct={weather.precipPct} />
          )}

          {showClothing && item.clothing && firstFutureRestaurantIdx < 0 && (
            <ClothingBadge hint={item.clothing} weather={weather ?? null} />
          )}
        </div>

        {allRestaurants.map((r, i) => {
          const cancelled = cancelledSet.has(r.name);
          const displayTime = timeOverrides[r.name] ?? r.time;
          const rPast = !cancelled && (past || (today && isEventPast(item.isoDate, r.time)));
          return (
            <div
              key={i}
              className={`flex items-start gap-1.5 text-xs font-sans mb-0.5 ${(rPast || cancelled) ? "opacity-50" : ""}`}
            >
              <span className="flex-shrink-0 mt-[3px]">
                {cancelled
                  ? <span className="text-red-400 font-bold text-[10px]">✕</span>
                  : rPast
                    ? <CheckCircle2 className="w-3 h-3 text-muted-foreground/40" />
                    : <Clock className="w-3 h-3 text-muted-foreground/50" />
                }
              </span>
              <div className="min-w-0">
                {r.mapsUrl ? (
                  <a
                    href={r.mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={`font-medium ${
                      cancelled
                        ? "text-red-400 line-through"
                        : rPast
                          ? "text-foreground/50 line-through"
                          : "text-foreground/80 hover:underline"
                    }`}
                  >
                    {r.name}
                  </a>
                ) : (
                  <span className={`font-medium ${cancelled ? "text-red-400 line-through" : rPast ? "text-foreground/50 line-through" : "text-foreground/80"}`}>
                    {r.name}
                  </span>
                )}
                {" "}
                <span className={`${(rPast || cancelled) ? "text-muted-foreground/50" : "text-muted-foreground"} ${timeOverrides[r.name] ? "font-semibold text-[#7a5c00]" : ""}`}>
                  {displayTime}
                </span>
                {r.note && !cancelled && (
                  <span className="text-muted-foreground/55 italic"> · {r.note}</span>
                )}
                {cancelled && (
                  <span className="text-red-400/70 text-[10px] italic"> cancelled</span>
                )}
                {showClothing && r.clothing && !cancelled && !rPast && (
                  <ClothingBadge hint={r.clothing} weather={weather ?? null} />
                )}
                {showClothing && item.clothing && i === firstFutureRestaurantIdx && (
                  <ClothingBadge hint={item.clothing} weather={weather ?? null} />
                )}
              </div>
            </div>
          );
        })}

        {additions.map((a) => (
          <div key={a.id} className="flex items-start gap-1.5 text-xs font-sans mb-0.5">
            <Plus className="w-3 h-3 flex-shrink-0 mt-[3px] text-amber-500" />
            <div className="min-w-0">
              <span className="font-medium text-foreground/80">{a.name}</span>
              {" "}
              <span className="text-muted-foreground">{a.time}</span>
              {a.description && <span className="text-muted-foreground/55 italic"> · {a.description}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
