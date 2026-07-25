import { STRIPE_BANDS } from "../lib/theme";

/** A thin multi-band accent — bay, vines, cherry, sunset, sand. */
export function ThemeStripe({ height = 4 }: { height?: number }) {
  return (
    <div className="flex w-full" style={{ height }} aria-hidden="true">
      {STRIPE_BANDS.map((c, i) => (
        <div key={i} className="flex-1" style={{ background: c }} />
      ))}
    </div>
  );
}
