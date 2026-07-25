// Trip visual system — Traverse City.
// Bay blue is the structural primary; each day carries one of the three trip
// hues (bay / vineyard / cherry). A single warm "sunset gold" carries every
// interactive highlight (Today chip, "Go There", admin) so accents feel of a
// piece rather than competing with the section colours.

export const GOLD = "#E0952B";

export type DayId = "day-1" | "day-2" | "day-3";

/** Per-day section colours: deep banner background, tinted pill, row accent. */
export const DAY_THEME: Record<DayId, { bg: string; pill: string; accent: string; label: string }> = {
  "day-1": { bg: "#1b5f7e", pill: "hsl(199,64%,28%)", accent: "hsl(199,64%,38%)", label: "Bay" },
  "day-2": { bg: "#2f5d4a", pill: "hsl(158,34%,24%)", accent: "hsl(158,34%,32%)", label: "Vines" },
  "day-3": { bg: "#8f2c40", pill: "hsl(348,52%,34%)", accent: "hsl(348,58%,44%)", label: "Cherry" },
};

/** Thin accent stripe echoing the trip's world: bay, vines, cherry, sunset, sand. */
export const STRIPE_BANDS = ["#1b5f7e", "#2f5d4a", "#a8324a", GOLD, "#e4d7be"];
