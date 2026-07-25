import { useState, useEffect, useRef } from "react";
import { MapPin, Moon, Sun, LayoutList, AlignJustify, CalendarDays } from "lucide-react";
import { itinerary } from "./data/itinerary";
import type { ItineraryItem } from "./data/itinerary";
import { DayRow } from "./components/DayRow";
import { SmartToday } from "./components/SmartToday";
import { TransportStrip } from "./components/TransportStrip";
import { TripInfo } from "./components/TripInfo";
import { AdminButton } from "./components/AdminPanel";
import { ThemeStripe } from "./components/ThemeStripe";
import { AdminOverridesContext, useAdminOverridesProvider } from "./hooks/useAdminOverrides";
import { useDarkMode } from "./hooks/useDarkMode";
import { useScrollMemory } from "./hooks/useScrollMemory";
import { getNow, isDayPast, todayIsoDate, isTomorrow, DEMO_MODE } from "./hooks/useTripTime";
import { DAY_THEME, type DayId } from "./lib/theme";

const DAY_IDS = itinerary.map((d) => d.id as DayId);

function nextUpcomingIso(): string | null {
  const today = todayIsoDate();
  const dates = itinerary.map((d) => d.isoDate).filter((iso) => iso > today).sort();
  return dates[0] ?? null;
}

// ── Section banner ──────────────────────────────────────────────────────────
function SectionBanner({
  id, label, date, mapsUrl, bg,
}: {
  id: string; label: string; date: string; mapsUrl: string; bg: string;
}) {
  return (
    <div
      id={id}
      className="flex items-center gap-3.5 pl-4 pr-5 py-3.5"
      style={{
        background: `linear-gradient(135deg,
          color-mix(in srgb, ${bg} 82%, #0a1622) 0%,
          color-mix(in srgb, ${bg} 64%, #0a1622) 100%)`,
      }}
    >
      <div className="w-[3px] h-10 rounded-full flex-shrink-0" style={{ background: "#E0952B" }} />
      <div className="min-w-0">
        <p className="font-sans text-[11.5px] tracking-[0.16em] uppercase text-white/60 mb-1">{date}</p>
        <h2 className="font-serif text-[1.45rem] text-white leading-none tracking-[-0.01em]">{label}</h2>
      </div>
      <div className="ml-auto flex-shrink-0">
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="press inline-flex items-center gap-1.5 text-[13px] font-sans text-white/75 hover:text-white rounded-full bg-white/[0.10] px-3.5 py-2"
        >
          <MapPin className="w-3.5 h-3.5" />
          Maps
        </a>
      </div>
    </div>
  );
}

// ── Overview (compact) card ─────────────────────────────────────────────────
function OverviewCard({
  item, bg, onExpand,
}: {
  item: ItineraryItem; bg: string; onExpand: () => void;
}) {
  const past = isDayPast(item.isoDate);
  const theme = DAY_THEME[item.id as DayId];
  const restaurants = item.restaurants ?? [];
  const highlights = restaurants.slice(0, 3).map((r) => `${r.name} · ${r.time}`);
  const extra = restaurants.length - highlights.length;

  return (
    <div
      className={`mx-4 mb-5 rounded-2xl overflow-hidden bg-card shadow-sm transition-opacity duration-300 ${past ? "opacity-50" : ""}`}
      style={{ ["--ov-accent" as string]: theme.pill }}
    >
      <div className="h-[3px]" style={{ background: bg, opacity: past ? 0.28 : 1 }} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-3.5">
          <div className="min-w-0">
            <p className="ov-accent-text font-sans text-[10px] uppercase tracking-[0.2em] mb-1.5">{item.date}</p>
            <p className={`font-sans text-sm font-semibold leading-snug ${past ? "text-foreground/60 line-through decoration-foreground/25" : "text-foreground"}`}>
              {item.title}{item.locationBlurb ? ` · ${item.locationBlurb}` : ""}
            </p>
          </div>
          <button
            onClick={onExpand}
            className="ov-accent-outline press flex-shrink-0 inline-flex items-center gap-1.5 text-[11px] font-sans font-semibold px-3.5 py-2 rounded-full border"
          >
            <AlignJustify className="w-3 h-3" />
            Details
          </button>
        </div>
        {highlights.length > 0 ? (
          <div className="space-y-1.5">
            {highlights.map((h, i) => (
              <p key={i} className="font-sans text-xs text-foreground/65 leading-relaxed">
                <span className="text-muted-foreground/60 mr-0.5">·</span> {h}
              </p>
            ))}
            {extra > 0 && <p className="font-sans text-xs text-muted-foreground/70">+{extra} more</p>}
          </div>
        ) : (
          item.description && <p className="font-sans text-xs text-foreground/65 leading-relaxed">{item.description}</p>
        )}
      </div>
    </div>
  );
}

// ── Single local clock (Eastern) ────────────────────────────────────────────
function TZClock() {
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);
  const t = getNow().toLocaleTimeString("en-US", { timeZone: "America/Detroit", hour: "2-digit", minute: "2-digit", hour12: true });
  return (
    <div className="hidden md:flex items-center gap-2 text-[10px] font-sans text-muted-foreground whitespace-nowrap select-none">
      <span title="Traverse City (Eastern)">🍒 {t}</span>
      {DEMO_MODE && (
        <span className="px-1 py-0.5 rounded text-[9px] font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700 ml-0.5">demo</span>
      )}
    </div>
  );
}

function AppContent() {
  useScrollMemory();
  const { dark, toggle: toggleDark } = useDarkMode();
  const [activeSection, setActiveSection] = useState<DayId>(DAY_IDS[0]);

  const [detail, setDetail] = useState<Record<DayId, boolean>>(() => {
    const out = {} as Record<DayId, boolean>;
    for (const item of itinerary) {
      const today = todayIsoDate();
      out[item.id as DayId] = item.isoDate === today || isTomorrow(item.isoDate);
    }
    // Nothing current/imminent (e.g. pre-trip) → open the first day so the page
    // never lands entirely collapsed.
    if (!Object.values(out).some(Boolean)) out[DAY_IDS[0]] = true;
    return out;
  });
  const allDetailOn = DAY_IDS.every((id) => detail[id]);

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (!visible.length) return;
        const best = visible.reduce((a, b) => (a.intersectionRatio >= b.intersectionRatio ? a : b));
        const id = best.target.getAttribute("data-section") as DayId | null;
        if (id) setActiveSection(id);
      },
      { threshold: 0, rootMargin: "-40% 0px -40% 0px" },
    );
    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const navH = document.querySelector("nav")?.offsetHeight ?? 50;
    const top = el.getBoundingClientRect().top + window.scrollY - navH - 8;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  };

  const scrollToToday = () => {
    const hero = document.getElementById("smart-today");
    const navH = document.querySelector("nav")?.offsetHeight ?? 50;
    if (hero) {
      const top = hero.getBoundingClientRect().top + window.scrollY - navH - 8;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const nextIso = nextUpcomingIso();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── HERO ── */}
      <header
        className="relative text-center px-6 pt-5 pb-5 overflow-hidden"
        style={{ background: "radial-gradient(120% 100% at 50% 118%, #2b6580 0%, #17475e 42%, #0a2634 100%)" }}
      >
        <div className="absolute top-0 left-0 right-0"><ThemeStripe height={3} /></div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <p className="font-sans text-[12px] uppercase tracking-[0.26em] text-white/45 mb-1.5">Old Mission Peninsula</p>
          <h1 className="font-serif text-white leading-[1.05] mb-1.5" style={{ fontSize: "clamp(2.1rem, 5.5vw, 3rem)", letterSpacing: "-0.015em" }}>
            Traverse City Getaway
          </h1>
          <p className="font-sans font-normal text-white/60 mb-3" style={{ fontSize: "clamp(0.92rem, 2vw, 1rem)", letterSpacing: "0.01em" }}>
            September 5 – 7, 2026 · You + Maura
          </p>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/[0.07] px-4 py-1.5 text-[13px] font-sans text-white/55">
            <span>🚗 234 mi from Wixom</span>
            <span className="text-white/20">·</span>
            <span>🍷 Old Mission wine trail</span>
          </div>
        </div>
      </header>

      {/* ── STICKY NAV ── */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/70" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <ThemeStripe height={2} />
        <div className="max-w-3xl mx-auto px-1.5 sm:px-3 flex items-center h-12">
          <TZClock />
          <div className="flex flex-1 justify-center sm:justify-start sm:ml-3">
            {itinerary.map((item) => {
              const id = item.id as DayId;
              const isActive = activeSection === id;
              return (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className="press px-2 sm:px-3 h-12 text-[13.5px] sm:text-[15px] font-sans transition-colors relative whitespace-nowrap"
                  style={isActive ? { color: "var(--color-foreground)", fontWeight: 600 } : { color: "var(--color-muted-foreground)", fontWeight: 500 }}
                >
                  {item.day}
                  <span
                    className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full transition-all duration-200"
                    style={{ background: DAY_THEME[id].accent, opacity: isActive ? 1 : 0, transform: isActive ? "scaleX(1)" : "scaleX(0.4)" }}
                  />
                </button>
              );
            })}
          </div>
          <div className="flex items-center ml-auto">
            <button
              onClick={() => { const on = !allDetailOn; const next = {} as Record<DayId, boolean>; DAY_IDS.forEach((id) => (next[id] = on)); setDetail(next); }}
              title={allDetailOn ? "Overview mode" : "Show full detail"}
              aria-label={allDetailOn ? "Collapse all days" : "Expand all days"}
              className="press tap-target relative p-1.5 sm:p-2.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              {allDetailOn ? <LayoutList className="w-[1.05rem] h-[1.05rem]" /> : <AlignJustify className="w-[1.05rem] h-[1.05rem]" />}
            </button>
            <button
              onClick={toggleDark}
              title={dark ? "Light mode" : "Dark mode"}
              aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
              className="press tap-target relative p-1.5 sm:p-2.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              {dark ? <Sun className="w-[1.05rem] h-[1.05rem]" /> : <Moon className="w-[1.05rem] h-[1.05rem]" />}
            </button>
            <button
              onClick={scrollToToday}
              title="Today"
              aria-label="Jump to today"
              className="press tap-target relative p-1.5 sm:p-2.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <CalendarDays className="w-[1.05rem] h-[1.05rem]" />
            </button>
          </div>
        </div>
      </nav>

      <SmartToday />

      {/* ── DAY SECTIONS ── */}
      {itinerary.map((item, idx) => {
        const id = item.id as DayId;
        const theme = DAY_THEME[id];
        return (
          <section key={id} ref={(el) => { sectionRefs.current[id] = el; }} data-section={id}>
            <SectionBanner id={id} label={`${item.day} · ${item.title}`} date={item.date} mapsUrl={item.mapsUrl} bg={theme.bg} />
            <div className="max-w-3xl mx-auto">
              {idx === 0 && (
                <TransportStrip
                  stripId="getting-there"
                  label="Getting There"
                  accentColor={theme.accent}
                  autoCollapseAfterIso="2026-09-05"
                  lines={[
                    "🚗 Wixom → Traverse City · Sat 9/5 · leave ~8:00 am · ~234 mi, ~4 hrs via US-23 N",
                    "🅿️ Park at North of Ordinary · check-in 4:00 pm",
                  ]}
                />
              )}
              {detail[id] ? (
                <div className="rise-in bg-card rounded-2xl shadow-sm overflow-hidden mx-4 mb-5">
                  <div className="flex justify-end px-3 pt-2.5 pb-1">
                    <button
                      onClick={() => setDetail((d) => ({ ...d, [id]: false }))}
                      className="press inline-flex items-center gap-1.5 text-[11px] font-sans font-medium px-3 py-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
                    >
                      <LayoutList className="w-3 h-3" /> Collapse
                    </button>
                  </div>
                  <DayRow item={item} isNext={item.isoDate === nextIso} />
                </div>
              ) : (
                <OverviewCard item={item} bg={theme.bg} onExpand={() => setDetail((d) => ({ ...d, [id]: true }))} />
              )}
              {idx === itinerary.length - 1 && (
                <TransportStrip
                  stripId="heading-home"
                  label="Heading Home"
                  accentColor={theme.accent}
                  autoCollapseAfterIso="2026-09-08"
                  lines={[
                    "🚗 Traverse City → Wixom · Mon 9/7 · after 11:00 am checkout · ~234 mi, ~4 hrs",
                    "⚠️ Labor Day — expect heavier holiday traffic than usual",
                  ]}
                />
              )}
            </div>
            {idx < itinerary.length - 1 && <div className="h-6" />}
          </section>
        );
      })}

      <TripInfo />

      {/* ── FOOTER ── */}
      <footer className="bg-background mt-4">
        <ThemeStripe height={4} />
        <div className="max-w-3xl mx-auto px-4 py-7 flex items-center justify-center font-sans text-xs relative">
          <p className="text-foreground/35 tracking-[0.08em]">Traverse City Getaway · September 2026</p>
          <div className="absolute right-3 top-1/2 -translate-y-1/2"><AdminButton /></div>
        </div>
      </footer>
    </div>
  );
}

export function App() {
  const adminCtx = useAdminOverridesProvider();
  return (
    <AdminOverridesContext.Provider value={adminCtx}>
      <AppContent />
    </AdminOverridesContext.Provider>
  );
}
