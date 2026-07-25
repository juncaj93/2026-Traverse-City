import { BedDouble, MapPin, LogIn, LogOut, KeyRound, Car } from "lucide-react";

const ADDRESS = "1709 Alpine Road, Traverse City, MI 49686";
const ADDRESS_MAPS = "https://maps.apple.com/?q=1709+Alpine+Road%2C+Traverse+City%2C+MI+49686";

/** Where we're staying — surfaced near the top with the arrival essentials. */
export function Lodging() {
  return (
    <div className="max-w-3xl mx-auto px-4 pt-2 pb-1">
      <div className="rounded-2xl bg-card shadow-sm overflow-hidden">
        <div className="px-5 pt-4 pb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-sans text-[11.5px] uppercase tracking-[0.16em] text-muted-foreground">
              Where we're staying
            </p>
            <p className="font-serif text-[1.35rem] text-foreground leading-tight mt-1.5 text-balance">
              North of Ordinary
            </p>
            <p className="font-sans text-xs text-muted-foreground mt-1">
              Guest suite hosted by Jo · private entrance, hot tub, peekaboo West Bay views
            </p>
          </div>
          <BedDouble className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
        </div>

        <a
          href={ADDRESS_MAPS}
          target="_blank"
          rel="noopener noreferrer"
          className="press flex items-center gap-2 px-5 py-2.5 border-t border-border/70 accent-text hover:bg-muted/40 transition-colors"
          style={{ ["--chip-accent" as string]: "hsl(199,70%,37%)" }}
        >
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="font-sans text-sm font-medium">{ADDRESS}</span>
        </a>

        <div className="grid grid-cols-2 border-t border-border/70">
          <div className="px-5 py-3 border-r border-border/70">
            <p className="font-sans text-[10px] uppercase tracking-[0.14em] text-muted-foreground inline-flex items-center gap-1.5">
              <LogIn className="w-3 h-3" /> Check-in
            </p>
            <p className="font-sans text-sm font-semibold text-foreground mt-1">Sat Sep 5 · 4:00 PM</p>
          </div>
          <div className="px-5 py-3">
            <p className="font-sans text-[10px] uppercase tracking-[0.14em] text-muted-foreground inline-flex items-center gap-1.5">
              <LogOut className="w-3 h-3" /> Checkout
            </p>
            <p className="font-sans text-sm font-semibold text-foreground mt-1">Mon Sep 7 · 11:00 AM</p>
          </div>
        </div>

        <div className="grid grid-cols-2 border-t border-border/70">
          <div className="px-5 py-3 border-r border-border/70">
            <p className="font-sans text-[10px] uppercase tracking-[0.14em] text-muted-foreground inline-flex items-center gap-1.5">
              <KeyRound className="w-3 h-3" /> Door code
            </p>
            <p className="font-sans text-sm text-muted-foreground mt-1">Jo sends before arrival</p>
          </div>
          <div className="px-5 py-3">
            <p className="font-sans text-[10px] uppercase tracking-[0.14em] text-muted-foreground inline-flex items-center gap-1.5">
              <Car className="w-3 h-3" /> Parking
            </p>
            <p className="font-sans text-sm text-muted-foreground mt-1">On-site — confirm w/ Jo</p>
          </div>
        </div>
      </div>
    </div>
  );
}
