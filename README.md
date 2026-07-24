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

- `frontend/` — Vite + React + TypeScript + Tailwind v4. Day-by-day
  itinerary (`src/data/itinerary.ts`), live weather + "what to wear" badges,
  dark mode, and a sticky "next up" countdown banner.
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
