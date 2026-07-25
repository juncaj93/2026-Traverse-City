// Trip visual system — Traverse City, Great Lakes edition.
// Deep Lake Michigan blue is the structural primary; each day carries one of
// the three lakeshore hues (deep water / turquoise shallows / lake sunset). A
// single warm dune-gold carries every interactive highlight (Today chip,
// "Go There", admin) so accents feel of a piece rather than competing with the
// section colours.

export const GOLD = "#E39A3B";

export type DayId = "day-1" | "day-2" | "day-3";

/** Per-day section colours: deep banner background, tinted pill, row accent. */
export const DAY_THEME: Record<DayId, { bg: string; pill: string; accent: string; label: string }> = {
  "day-1": { bg: "#155e82", pill: "hsl(202,72%,26%)", accent: "hsl(202,70%,37%)", label: "Deep water" },
  "day-2": { bg: "#178a8a", pill: "hsl(181,68%,23%)", accent: "hsl(182,60%,33%)", label: "Shallows" },
  "day-3": { bg: "#c05a2c", pill: "hsl(18,62%,33%)",  accent: "hsl(18,64%,44%)",  label: "Lake sunset" },
};

/** Thin accent stripe echoing the shoreline: deep water, turquoise, pine, dune gold, sand. */
export const STRIPE_BANDS = ["#155e82", "#178a8a", "#2f6b53", GOLD, "#e6dabf"];
