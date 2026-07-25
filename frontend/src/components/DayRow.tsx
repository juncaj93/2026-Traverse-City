import { MapPin, Hotel, Clock, CheckCircle2, Plus } from "lucide-react";
import type { ItineraryItem } from "../data/itinerary";
import { ClothingBadge } from "./ClothingBadge";
import { useWeather } from "../hooks/useWeather";
import { isDayPast, isDayToday, isEventPast } from "../hooks/useTripTime";
import { useAdminOverrides } from "../hooks/useAdminOverrides";
import { DAY_THEME, type DayId } from "../lib/theme";

interface DayRowProps {
  item: ItineraryItem;
  isNext: boolean;
}

function WeatherBadge({ maxF, minF, precipPct }: { maxF: number; minF: number; precipPct: number }) {
  const showRain = precipPct > 15;
  return (
    <div
      title={`High ${maxF}°F · Low ${minF}°F · ${precipPct}% precipitation · live forecast`}
      className="chip-tinted inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-sans font-medium cursor-default select-none tabular-nums"
      style={{ ["--chip-accent" as string]: "hsl(199,70%,42%)" }}
    >
      <span>{maxF}° / {minF}°</span>
      {showRain && <span className="opacity-80">· 🌧 {precipPct}%</span>}
    </div>
  );
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

  const accentColor = DAY_THEME[item.id as DayId]?.accent ?? "hsl(199,64%,38%)";

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
        flex items-start gap-4 py-4 px-4 border-b border-border/60 last:border-0
        transition-colors duration-[var(--dur-fast)]
        ${past ? "opacity-45" : "hover:bg-muted/40"}
        ${today ? "bg-[color-mix(in_srgb,#E0952B_8%,transparent)]" : ""}
      `}
    >
      <div className="flex-shrink-0 w-20 pt-0.5">
        <div className="flex items-center gap-1.5 mb-1">
          <span
            className="chip-tinted inline-block text-[10px] font-sans font-bold tracking-[0.1em] uppercase px-2 py-0.5 rounded-full"
            style={{ ["--chip-accent" as string]: accentColor }}
          >
            {item.day}
          </span>
          {past  && <CheckCircle2 className="w-3 h-3 text-muted-foreground/40" />}
          {today && (
            <span
              className="chip-tinted inline-block text-[9px] font-sans font-bold tracking-[0.1em] uppercase px-1.5 py-0.5 rounded-full"
              style={{ ["--chip-accent" as string]: "#E0952B" }}
            >
              Today
            </span>
          )}
        </div>
        <p className={`text-xs font-sans leading-tight ${past ? "text-muted-foreground/60" : "text-muted-foreground"}`}>
          {item.date}
        </p>
      </div>

      <div className="flex-1 min-w-0">
        <p className={`font-sans font-semibold text-base leading-snug mb-1.5 ${past ? "text-foreground/50 line-through decoration-foreground/25" : "text-foreground"}`}>
          {item.title}
        </p>

        {item.description && (
          <p className="text-xs font-sans text-muted-foreground mb-1.5">{item.description}</p>
        )}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1.5">
          <a
            href={item.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="accent-text press inline-flex items-center gap-1 text-xs font-sans font-medium transition-opacity hover:opacity-70"
            style={{ ["--chip-accent" as string]: accentColor }}
          >
            <MapPin className="w-3 h-3 flex-shrink-0" />
            {item.location}
          </a>

          {item.hotelNote && (
            item.hotel?.mapsUrl ? (
              <a
                href={item.hotel.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
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
              className={`flex items-start gap-1.5 text-xs font-sans leading-relaxed mb-1 ${(rPast || cancelled) ? "opacity-50" : ""}`}
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
                    rel="noopener noreferrer"
                    className={`font-medium inline ${
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
                <span className={`tabular-nums ${(rPast || cancelled) ? "text-muted-foreground/50" : "text-muted-foreground"} ${timeOverrides[r.name] ? "font-semibold text-amber-700 dark:text-amber-400" : ""}`}>
                  {displayTime}
                </span>
                {r.status === "waitlisted" && !cancelled && (
                  <span className="chip-tinted ml-1.5 text-[9px] font-sans font-bold uppercase px-1.5 py-0.5 rounded-full" style={{ ["--chip-accent" as string]: "#E0952B" }}>Waitlisted</span>
                )}
                {r.status === "confirmed" && !cancelled && (
                  <span className="chip-tinted ml-1.5 text-[9px] font-sans font-bold uppercase px-1.5 py-0.5 rounded-full" style={{ ["--chip-accent" as string]: "hsl(158,40%,34%)" }}>Confirmed</span>
                )}
                {r.description && !cancelled && (
                  <span className="text-muted-foreground/70"> · {r.description}</span>
                )}
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
          <div key={a.id} className="flex items-start gap-1.5 text-xs font-sans leading-relaxed mb-1">
            <Plus className="w-3 h-3 flex-shrink-0 mt-[3px] text-[#E0952B]" />
            <div className="min-w-0">
              <span className="font-medium text-foreground/80">{a.name}</span>
              {" "}
              <span className="text-muted-foreground tabular-nums">{a.time}</span>
              {a.description && <span className="text-muted-foreground/55 italic"> · {a.description}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
