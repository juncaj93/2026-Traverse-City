import { useState, useEffect } from "react";

export type DayWeather = {
  maxF: number;
  minF: number;
  precipPct: number;
};

const cache: Record<string, DayWeather | null> = {};

function addDays(isoDate: string, n: number): string {
  const d = new Date(`${isoDate}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// Real today in the trip's timezone (not the demo date) — used to gate forecast availability
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
    // If the requested date is beyond day 15, the API returns 400 — skip it.
    const maxForecastDate = addDays(realTodayISO(), 15);
    if (isoDate > maxForecastDate) {
      cache[key] = null;
      return;
    }

    // Use start_date/end_date so we request exactly the date we need
    // without scanning a 16-day array. end_date = same day (single-day request).
    const url = [
      `https://api.open-meteo.com/v1/forecast`,
      `?latitude=${lat}&longitude=${lng}`,
      `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max`,
      `&temperature_unit=fahrenheit`,
      `&timezone=America%2FDetroit`,
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
        };
        cache[key] = w;
        setWeather(w);
      })
      .catch(() => { cache[key] = null; setWeather(null); });
  }, [key, lat, lng, isoDate]);

  return weather;
}
