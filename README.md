# Traverse City Getaway — Sep 5–7, 2026

Planning doc and (eventually) itinerary site for this trip.

- **`TRIP_TEMPLATE-traverse-city-2026.md`** — the filled-in trip content:
  reservations, lodging, day-by-day plan, addresses/phone numbers/Maps
  links. Source of truth for the trip.
- **The site is built** — scaffolded from
  [`juncaj93/Itinerary-Template`](https://github.com/juncaj93/Itinerary-Template)
  with this repo's planning doc as the content. See `backend/` and
  `frontend/` below.

## Running the site

```
pnpm install
pnpm dev        # backend on :3001, frontend (Vite, proxying /api) on :5173
```

- `frontend/` — Vite + React + TypeScript + Tailwind v4, styled to match the
  `2026-South-Africa` build's polish with a fresh Traverse City palette (bay
  blue / vineyard green / cherry, warm sunset-gold accents; light + dark).
  Features: a **SmartToday** hero (pre-trip countdown → live "next up" +
  today's essentials during the trip), per-day section banners with an
  overview↔detail toggle, collapsible **transport strips** (drive there /
  home), live weather + "what to wear" badges, system-following dark mode, and
  Apple Maps location links. Trip content lives in `src/data/itinerary.ts`;
  the theme/section colors in `src/lib/theme.ts`.
- `backend/api-server/` — Express API with a PIN-gated admin panel
  (cancel/reschedule/add itinerary items without a redeploy). Default PIN is
  `1526` — override with the `ADMIN_PIN` env var. Falls back to local-disk
  storage for overrides unless `REPLIT_DB_URL` is set.
- `pnpm build` builds both; in production the API server also serves the
  built frontend as static files (see `backend/api-server/src/app.ts`), so
  the whole site can run as one deployed service.

When the trip is over, see `WHEN-A-TRIP-ENDS.md` in `Itinerary-Template` for
how to archive things — the archived code and offline snapshot both end up
living here, in this repo.
