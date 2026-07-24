import { MapPin, Hotel, Clock, CheckCircle2, Plus, ChevronDown, ChevronUp } from "lucide-react";
import type { ItineraryItem } from "../data/itinerary";
import { ClothingBadge } from "./ClothingBadge";
import { useWeather } from "../hooks/useWeather";
import { isDayPast, isDayToday, isEventPast } from "../hooks/useTripTime";
import { useAdminOverrides } from "../hooks/useAdminOverrides";

interface DayRowProps {
  item: ItineraryItem;
  expanded: boolean;
  onToggle: () => void;
}

export function DayRow({ item, expanded, onToggle }: DayRowProps) {
  const { overrides } = useAdminOverrides();
  const weather = useWeather(item.lat, item.lng, item.isoDate);

  const past  = isDayPast(item.isoDate);
  const today = isDayToday(item.isoDate);
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

  const preview = allRestaurants.find((r, i) => !cancelledSet.has(r.name) && (past || i >= firstFutureRestaurantIdx));

  return (
    <div id={item.id} className={`border-b border-border last:border-0 ${past ? "opacity-50" : ""}`}>
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggle(); } }}
        className={`flex items-center gap-3 py-3 px-4 cursor-pointer select-none ${today ? "bg-amber-50/60 dark:bg-amber-900/10" : "hover:bg-black/[0.02]"}`}
      >
        <span className="flex-shrink-0 text-[10px] font-sans font-bold tracking-[0.1em] uppercase px-1.5 py-0.5 rounded bg-accent text-accent-foreground">
          {item.day}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={`font-serif font-semibold text-[15px] leading-tight ${past ? "text-foreground/50 line-through" : "text-foreground"}`}>
              {item.title}
            </span>
            {past && <CheckCircle2 className="w-3 h-3 text-muted-foreground/40 flex-shrink-0" />}
            {today && (
              <span className="text-[9px] font-sans font-bold uppercase px-1 py-0.5 rounded bg-amber-400 text-black flex-shrink-0">
                Today
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-sans text-muted-foreground mt-0.5 overflow-hidden">
            <span className="flex-shrink-0">{item.date}</span>
            <span className="flex-shrink-0">·</span>
            <a
              href={item.mapsUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-0.5 flex-shrink-0 text-accent-foreground hover:opacity-70"
            >
              <MapPin className="w-3 h-3" />
              {item.location}
            </a>
            {!expanded && preview && (
              <span className="truncate">· {preview.name} {timeOverrides[preview.name] ?? preview.time}</span>
            )}
          </div>
        </div>

        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
      </div>

      {expanded && (
        <div className="px-4 pb-4 pl-[3.6rem]">
          {item.description && (
            <p className="text-xs font-sans text-muted-foreground mb-1.5">{item.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1.5">
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
                  {r.status === "waitlisted" && !cancelled && (
                    <span className="ml-1 text-[9px] font-sans font-bold uppercase px-1 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">Waitlisted</span>
                  )}
                  {r.status === "confirmed" && !cancelled && (
                    <span className="ml-1 text-[9px] font-sans font-bold uppercase px-1 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">Confirmed</span>
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
      )}
    </div>
  );
}
