import { useState } from "react";
import { Moon, Sun, Phone, Car, Clock3 } from "lucide-react";
import { itinerary } from "./data/itinerary";
import { DayRow } from "./components/DayRow";
import { NextUpBanner } from "./components/NextUpBanner";
import { WeatherSummary } from "./components/WeatherSummary";
import { AdminProvider } from "./components/AdminProvider";
import { AdminPanel } from "./components/AdminPanel";
import { useDarkMode } from "./hooks/useDarkMode";
import { isDayPast } from "./hooks/useTripTime";

function defaultExpanded(): Record<string, boolean> {
  const open = itinerary.find((d) => !isDayPast(d.isoDate)) ?? itinerary[itinerary.length - 1];
  return open ? { [open.id]: true } : {};
}

function AppContent() {
  const { dark, toggle } = useDarkMode();
  const [expanded, setExpanded] = useState<Record<string, boolean>>(defaultExpanded);

  const toggleDay = (id: string) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

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

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        <header>
          <h1 className="font-serif font-bold text-2xl" style={{ textWrap: "balance" }}>Traverse City Getaway</h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-sans text-muted-foreground mt-1.5">
            <span>Sep 5–7, 2026</span>
            <span>·</span>
            <span>Old Mission Peninsula, MI</span>
            <span>·</span>
            <span>You + Maura</span>
            <span className="inline-flex items-center gap-1"><Car className="w-3.5 h-3.5" /> 234 mi / 4 hrs</span>
            <span className="inline-flex items-center gap-1"><Clock3 className="w-3.5 h-3.5" /> Eastern</span>
          </div>
        </header>

        <WeatherSummary itinerary={itinerary} />

        <div className="rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 shadow-sm px-4 py-2.5 text-xs font-sans">
          ⚠️ Checkout day (Mon, Sep 7) is Labor Day — expect heavier wine-trail traffic and call ahead for reservations.
        </div>

        <section className="tc-card px-4 py-3">
          <h2 className="font-serif font-semibold text-sm mb-1.5">Reservations</h2>
          <div className="space-y-1 text-sm font-sans">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-sans font-bold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 flex-shrink-0">Waitlisted</span>
              <span>The Boathouse — Sat dinner, OpenTable notify alert set</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-sans font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 flex-shrink-0">Confirmed</span>
              <span>Trattoria Stella — Sun 7:15 PM, 2 guests, via Resy</span>
            </div>
          </div>
          <p className="text-xs font-sans text-muted-foreground mt-1.5">
            Cancel Trattoria Stella by noon Sun to avoid a $25/guest fee.
          </p>
        </section>

        <section className="tc-card px-4 py-3">
          <h2 className="font-serif font-semibold text-sm mb-1">Staying at</h2>
          <p className="text-sm font-sans">
            <a href="https://www.google.com/maps/search/?api=1&query=1709+Alpine+Road%2C+Traverse+City%2C+MI+49686" target="_blank" rel="noreferrer" className="text-accent-foreground hover:underline font-medium">
              North of Ordinary
            </a>
            {" "}— guest suite, hosted by Jo. Check in Sat 4 PM · Checkout Mon 11 AM.
          </p>
        </section>

        <section className="tc-card px-4 py-3">
          <h2 className="font-serif font-semibold text-sm mb-1">Packing</h2>
          <p className="text-sm font-sans text-muted-foreground">
            Highs upper-60s–70s°F, lows ~50°F. Light layers, something warm for evenings.
          </p>
        </section>

        <section className="tc-card overflow-hidden">
          <h2 className="font-serif font-semibold text-sm px-4 pt-3 pb-1">Day by day</h2>
          {itinerary.map((item) => (
            <DayRow
              key={item.id}
              item={item}
              expanded={!!expanded[item.id]}
              onToggle={() => toggleDay(item.id)}
            />
          ))}
        </section>

        <section className="tc-card px-4 py-3">
          <h2 className="font-serif font-semibold text-sm inline-flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5" /> Who to call
          </h2>
          <p className="text-sm font-sans text-muted-foreground mt-0.5">911 for any emergency.</p>
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
