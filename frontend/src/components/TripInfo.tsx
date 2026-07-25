import { CalendarClock, BedDouble, Backpack, Phone } from "lucide-react";

/** Static trip facts: reservations, lodging, packing, who-to-call. */
export function TripInfo() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-3">
      <h2 className="font-serif text-[1.35rem] text-foreground px-1 mb-1">Good to know</h2>

      <section className="rounded-2xl bg-card shadow-sm p-5">
        <div className="flex items-center gap-2 mb-3">
          <CalendarClock className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-sans text-sm font-semibold">Reservations</h3>
        </div>
        <div className="space-y-2 text-sm font-sans">
          <div className="flex items-start gap-2.5">
            <span className="chip-tinted flex-shrink-0 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full mt-0.5" style={{ ["--chip-accent" as string]: "#E0952B" }}>Waitlisted</span>
            <span className="text-foreground/85">The Boathouse — Sat dinner, OpenTable notify alert set</span>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="chip-tinted flex-shrink-0 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full mt-0.5" style={{ ["--chip-accent" as string]: "hsl(158,40%,34%)" }}>Confirmed</span>
            <span className="text-foreground/85">Trattoria Stella — Sun 7:15 PM, 2 guests, via Resy</span>
          </div>
        </div>
        <p className="text-xs font-sans text-muted-foreground mt-3 leading-relaxed">
          Cancel Trattoria Stella by noon Sunday to avoid a $25/guest fee.
        </p>
      </section>

      <div className="grid sm:grid-cols-2 gap-3">
        <section className="rounded-2xl bg-card shadow-sm p-5">
          <div className="flex items-center gap-2 mb-2.5">
            <BedDouble className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-sans text-sm font-semibold">Staying at</h3>
          </div>
          <p className="text-sm font-sans text-foreground/85 leading-relaxed">
            <a
              href="https://maps.apple.com/?q=1709+Alpine+Road%2C+Traverse+City%2C+MI+49686"
              target="_blank"
              rel="noopener noreferrer"
              className="accent-text font-medium hover:opacity-70"
              style={{ ["--chip-accent" as string]: "hsl(199,64%,38%)" }}
            >
              North of Ordinary
            </a>{" "}
            — guest suite, hosted by Jo. Check in Sat 4 PM · Checkout Mon 11 AM.
          </p>
        </section>

        <section className="rounded-2xl bg-card shadow-sm p-5">
          <div className="flex items-center gap-2 mb-2.5">
            <Backpack className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-sans text-sm font-semibold">Packing</h3>
          </div>
          <p className="text-sm font-sans text-muted-foreground leading-relaxed">
            Highs upper-60s–70s°F, lows ~50°F. Light layers, something warm for evenings.
          </p>
        </section>
      </div>

      <section className="rounded-2xl bg-card shadow-sm p-5">
        <div className="flex items-center gap-2 mb-2">
          <Phone className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-sans text-sm font-semibold">Who to call</h3>
        </div>
        <p className="text-sm font-sans text-muted-foreground">911 for any emergency.</p>
      </section>
    </div>
  );
}
