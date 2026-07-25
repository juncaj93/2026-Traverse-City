import { useState, useEffect } from "react";

export type DayWeather = {
  maxF: number;
  minF: number;
  precipPct: number;
  sunrise?: string;
  sunset?: string;
};

const TRIP_TZ = "America%2FDetroit";
const cache: Record<string, DayWeather | null> = {};

function addDays(isoDate: string, n: number): string {
  const d = new Date(`${isoDate}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function realTodayISO(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Detroit" });
}

export function useWeather(
  lat: number | undefined,
  lng: number | undefined,
  isoDate: string,
): DayWeather | null {
  const key = `${lat},${lng},${isoDate}`;
  const [weather, setWeather] = useState<DayWeather | null>(cache[key] ?? null);

  useEffect(() => {
    if (!lat || !lng) return;
    if (cache[key] !== undefined) { setWeather(cache[key]); return; }

    // Open-Meteo free tier: 16 days of forecast (indices 0-15 from real today).
    // Beyond day 15 the API returns 400 — skip it.
    const maxForecastDate = addDays(realTodayISO(), 15);
    if (isoDate > maxForecastDate) {
      cache[key] = null;
      return;
    }

    const url = [
      `https://api.open-meteo.com/v1/forecast`,
      `?latitude=${lat}&longitude=${lng}`,
      `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset`,
      `&temperature_unit=fahrenheit`,
      `&timezone=${TRIP_TZ}`,
      `&start_date=${isoDate}`,
      `&end_date=${isoDate}`,
    ].join("");

    fetch(url)
      .then((r) => {
        if (!r.ok) { cache[key] = null; setWeather(null); return null; }
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        const times: string[] = data?.daily?.time ?? [];
        const idx = times.indexOf(isoDate);
        if (idx < 0) { cache[key] = null; return; }
        const w: DayWeather = {
          maxF: Math.round(data.daily.temperature_2m_max[idx]),
          minF: Math.round(data.daily.temperature_2m_min[idx]),
          precipPct: data.daily.precipitation_probability_max[idx] ?? 0,
          sunrise: data.daily.sunrise?.[idx],
          sunset: data.daily.sunset?.[idx],
        };
        cache[key] = w;
        setWeather(w);
      })
      .catch(() => { cache[key] = null; setWeather(null); });
  }, [key, lat, lng, isoDate]);

  return weather;
}

// ── Current conditions ──────────────────────────────────────────────────────
// Live temperature right now at a location, for the Today card. Refreshes when
// the location changes and every 15 minutes while mounted. Free, no API key.
const currentCache: Record<string, number | null> = {};

export function useCurrentWeather(
  lat: number | undefined,
  lng: number | undefined,
): number | null {
  const key = `${lat},${lng}`;
  const [tempF, setTempF] = useState<number | null>(currentCache[key] ?? null);

  useEffect(() => {
    if (!lat || !lng) return;
    let cancelled = false;

    const load = () => {
      const url = [
        `https://api.open-meteo.com/v1/forecast`,
        `?latitude=${lat}&longitude=${lng}`,
        `&current=temperature_2m`,
        `&temperature_unit=fahrenheit`,
        `&timezone=${TRIP_TZ}`,
      ].join("");
      fetch(url)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (cancelled || !data?.current) return;
          const t = Math.round(data.current.temperature_2m);
          currentCache[key] = t;
          setTempF(t);
        })
        .catch(() => { /* keep last known */ });
    };

    if (currentCache[key] != null) setTempF(currentCache[key]);
    load();
    const id = setInterval(load, 15 * 60 * 1000);
    return () => { cancelled = true; clearInterval(id); };
  }, [key, lat, lng]);

  return tempF;
}
