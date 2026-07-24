import { Moon, Sun, Phone } from "lucide-react";
import { itinerary } from "./data/itinerary";
import { DayRow } from "./components/DayRow";
import { NextUpBanner } from "./components/NextUpBanner";
import { AdminProvider } from "./components/AdminProvider";
import { AdminPanel } from "./components/AdminPanel";
import { useDarkMode } from "./hooks/useDarkMode";
import { todayIsoDate } from "./hooks/useTripTime";

function nextUpcomingIso(): string | null {
  const today = todayIsoDate();
  const dates = itinerary.map((d) => d.isoDate).filter((iso) => iso > today).sort();
  return dates[0] ?? null;
}

function AppContent() {
  const { dark, toggle } = useDarkMode();
  const nextIso = nextUpcomingIso();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur">
        <div className="max-w-3xl mx-auto px-4 h-10 flex items-center justify-between">
          <span className="font-serif font-semibold text-sm">Traverse City Getaway</span>
          <button onClick={toggle} title="Toggle dark mode" className="text-muted-foreground hover:text-foreground">
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </nav>

      <NextUpBanner itinerary={itinerary} />

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <header>
          <h1 className="font-serif font-bold text-2xl">Traverse City Getaway</h1>
          <p className="text-sm font-sans text-muted-foreground mt-1">
            Sat, Sep 5 – Mon, Sep 7, 2026 · Old Mission Peninsula / Traverse City, MI · You + Maura
          </p>
          <p className="text-sm font-sans text-muted-foreground mt-1">
            Driving from Wixom, MI — ~234 mi, ~4 hrs via US-23 N. Timezone: America/Detroit (Eastern).
          </p>
        </header>

        <div className="rounded-lg border border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20 px-4 py-3 text-sm font-sans">
          ⚠️ <strong>Checkout day (Mon, Sep 7, 2026) is Labor Day</strong> — the Old Mission wine trail sees
          its heaviest traffic of the year that weekend. Call ahead for dinner reservations; expect
          wineries busier than a typical weekend even at the quieter ones on the itinerary.
        </div>

        <section className="rounded-lg border border-border bg-card px-4 py-3">
          <h2 className="font-serif font-semibold text-sm mb-2">Reservations status</h2>
          <ul className="text-sm font-sans space-y-1">
            <li>⏳ <strong>The Boathouse</strong> (Sat dinner) — waitlisted, notify alert set via OpenTable, no table yet</li>
            <li>✅ <strong>Trattoria Stella</strong> (Sun dinner) — confirmed, Sun Sep 6, 7:15 PM, 2 guests, via Resy</li>
          </ul>
          <p className="text-xs font-sans text-muted-foreground mt-2">
            Trattoria Stella cancellation deadline: Sunday, Sep 6 by 12:00 PM (noon), same day. Cancel
            after, or no-show, and it's a $25/guest fee ($50 total), charged to the card on file.
          </p>
        </section>

        <section className="rounded-lg border border-border bg-card px-4 py-3">
          <h2 className="font-serif font-semibold text-sm mb-2">Where you're staying</h2>
          <p className="text-sm font-sans">
            <a href="https://www.google.com/maps/search/?api=1&query=1709+Alpine+Road%2C+Traverse+City%2C+MI+49686" target="_blank" rel="noreferrer" className="text-accent-foreground hover:underline font-medium">
              North of Ordinary
            </a>
            {" "}— entire guest suite, hosted by Jo (Superhost, 9 years). 1709 Alpine Road, Traverse City, MI 49686.
          </p>
          <p className="text-xs font-sans text-muted-foreground mt-1">
            Check-in Sat Sep 5 · 4:00 PM — Checkout Mon Sep 7 · 11:00 AM. Private entrance, hot tub,
            peekaboo West Bay views. Well-behaved house-trained dogs only.
          </p>
        </section>

        <section className="rounded-lg border border-border bg-card px-4 py-3">
          <h2 className="font-serif font-semibold text-sm mb-2">Packing / weather note</h2>
          <p className="text-sm font-sans text-muted-foreground">
            No real forecast exists this far out (forecasts only go out ~2 weeks), but typical
            early-September Traverse City weather is mild: highs upper-60s to low-70s°F, lows around
            50°F. Light layers, something warm for evenings outdoors.
          </p>
        </section>

        <section className="rounded-lg border border-border bg-card overflow-hidden">
          <h2 className="font-serif font-semibold text-sm px-4 pt-3 pb-1">Day-by-day plan</h2>
          {itinerary.map((item) => (
            <DayRow key={item.id} item={item} isNext={item.isoDate === nextIso} />
          ))}
        </section>

        <section className="rounded-lg border border-border bg-card px-4 py-3">
          <h2 className="font-serif font-semibold text-sm mb-1 inline-flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5" /> Who to call
          </h2>
          <p className="text-sm font-sans text-muted-foreground">
            Local trip in Michigan — just 911 for any emergency, no separate contact list needed.
          </p>
        </section>
      </main>

      <AdminPanel itinerary={itinerary} />
    </div>
  );
}

export function App() {
  return (
    <AdminProvider>
      <AppContent />
    </AdminProvider>
  );
}
