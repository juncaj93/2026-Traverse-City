import { useState } from "react";
import { CalendarClock, Backpack, ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

function Collapsible({ icon, title, children, defaultOpen = false }: {
  icon: ReactNode; title: string; children: ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="rounded-2xl bg-card shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="press tap-target relative w-full flex items-center gap-2 px-5 py-3.5 text-left"
      >
        <span className="text-muted-foreground">{icon}</span>
        <h3 className="font-sans text-sm font-semibold flex-1">{title}</h3>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform duration-[var(--dur-base)] ease-[var(--ease-premium)] ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div className="collapsible" data-open={open}>
        <div>
          <div className="px-5 pb-4 pt-0">{children}</div>
        </div>
      </div>
    </section>
  );
}

/** Secondary trip facts, tucked into collapsed cards to keep the bottom quiet. */
export function TripInfo() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-3">
      <h2 className="font-serif text-[1.35rem] text-foreground px-1 mb-1">Good to know</h2>

      <Collapsible icon={<CalendarClock className="w-4 h-4" />} title="Reservations">
        <div className="space-y-2 text-sm font-sans">
          <div className="flex items-start gap-2.5">
            <span className="chip-tinted flex-shrink-0 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full mt-0.5" style={{ ["--chip-accent" as string]: "#E39A3B" }}>Waitlisted</span>
            <span className="text-foreground/85">The Boathouse — Sat dinner, OpenTable notify alert set</span>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="chip-tinted flex-shrink-0 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full mt-0.5" style={{ ["--chip-accent" as string]: "hsl(165,42%,34%)" }}>Confirmed</span>
            <span className="text-foreground/85">Trattoria Stella — Sun 7:15 PM, 2 guests, via Resy</span>
          </div>
        </div>
        <p className="text-xs font-sans text-muted-foreground mt-3 leading-relaxed">
          Cancel Trattoria Stella by noon Sunday to avoid a $25/guest fee.
        </p>
      </Collapsible>

      <Collapsible icon={<Backpack className="w-4 h-4" />} title="Packing">
        <p className="text-sm font-sans text-muted-foreground leading-relaxed">
          Highs upper-60s–70s°F, lows ~50°F. Light layers, something warm for evenings on the water.
        </p>
      </Collapsible>
    </div>
  );
}
