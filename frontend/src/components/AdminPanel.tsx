import { useState } from "react";
import { ChevronDown, ChevronUp, Lock, Unlock, X } from "lucide-react";
import type { ItineraryItem } from "../data/itinerary";
import { useAdminOverrides } from "../hooks/useAdminOverrides";

export function AdminPanel({ itinerary }: { itinerary: ItineraryItem[] }) {
  const { overrides, cancelBooking, restoreBooking, updateTime, addEntry, removeAddition, verifyPin } = useAdminOverrides();
  const [open, setOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState("");
  const [timeEdits, setTimeEdits] = useState<Record<string, string>>({});
  const [newEntry, setNewEntry] = useState({ dayId: itinerary[0]?.id ?? "", name: "", time: "", description: "" });

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await verifyPin(pin);
    if (ok) { setUnlocked(true); setError(""); } else setError("Wrong PIN");
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntry.name || !newEntry.time) return;
    const ok = await addEntry(pin, newEntry.dayId, newEntry.name, newEntry.time, newEntry.description);
    if (ok) setNewEntry({ dayId: newEntry.dayId, name: "", time: "", description: "" });
  };

  return (
    <section className="max-w-3xl mx-auto px-4 py-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-border bg-card text-sm font-sans font-medium text-muted-foreground hover:text-foreground"
      >
        <span className="inline-flex items-center gap-1.5">
          {unlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
          Admin — edit the plan
        </span>
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {open && !unlocked && (
        <form onSubmit={handleUnlock} className="mt-2 flex items-center gap-2 px-3 py-3 rounded-lg border border-border bg-card">
          <input
            type="password"
            inputMode="numeric"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="PIN"
            className="w-24 px-2 py-1 rounded border border-border bg-background text-sm font-sans"
          />
          <button type="submit" className="px-3 py-1 rounded bg-accent text-accent-foreground text-sm font-sans font-medium">
            Unlock
          </button>
          {error && <span className="text-xs font-sans text-red-500">{error}</span>}
        </form>
      )}

      {open && unlocked && (
        <div className="mt-2 px-3 py-3 rounded-lg border border-border bg-card space-y-4">
          {itinerary.map((day) => {
            const additions = overrides.additions.filter((a) => a.dayId === day.id);
            return (
              <div key={day.id}>
                <h4 className="text-xs font-sans font-bold uppercase tracking-wide text-muted-foreground mb-1.5">
                  {day.day} — {day.date}
                </h4>
                <div className="space-y-1">
                  {(day.restaurants ?? []).map((r) => {
                    const cancelled = overrides.cancelled.some((c) => c.dayId === day.id && c.restaurantName === r.name);
                    const editKey = `${day.id}::${r.name}`;
                    return (
                      <div key={r.name} className="flex flex-wrap items-center gap-2 text-xs font-sans">
                        <span className={cancelled ? "line-through text-red-400 min-w-0" : "text-foreground/80 min-w-0"}>
                          {r.name}
                        </span>
                        {cancelled ? (
                          <button onClick={() => restoreBooking(pin, day.id, r.name)} className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                            Restore
                          </button>
                        ) : (
                          <button onClick={() => cancelBooking(pin, day.id, r.name)} className="px-2 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                            Cancel
                          </button>
                        )}
                        <input
                          type="text"
                          placeholder="new time"
                          value={timeEdits[editKey] ?? ""}
                          onChange={(e) => setTimeEdits((prev) => ({ ...prev, [editKey]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              const val = timeEdits[editKey];
                              if (val) void updateTime(pin, day.id, r.name, val);
                            }
                          }}
                          className="w-24 px-1.5 py-0.5 rounded border border-border bg-background"
                        />
                      </div>
                    );
                  })}
                  {additions.map((a) => (
                    <div key={a.id} className="flex items-center gap-2 text-xs font-sans">
                      <span className="text-foreground/80">{a.name} — {a.time}</span>
                      <button onClick={() => removeAddition(pin, a.id)} className="text-muted-foreground hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <form onSubmit={handleAdd} className="pt-2 border-t border-border space-y-1.5">
            <h4 className="text-xs font-sans font-bold uppercase tracking-wide text-muted-foreground">Add an item</h4>
            <div className="flex flex-wrap gap-1.5">
              <select
                value={newEntry.dayId}
                onChange={(e) => setNewEntry((prev) => ({ ...prev, dayId: e.target.value }))}
                className="px-1.5 py-0.5 rounded border border-border bg-background text-xs font-sans"
              >
                {itinerary.map((d) => (
                  <option key={d.id} value={d.id}>{d.day}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Name"
                value={newEntry.name}
                onChange={(e) => setNewEntry((prev) => ({ ...prev, name: e.target.value }))}
                className="px-1.5 py-0.5 rounded border border-border bg-background text-xs font-sans flex-1 min-w-[8rem]"
              />
              <input
                type="text"
                placeholder="Time (e.g. 3:00 pm)"
                value={newEntry.time}
                onChange={(e) => setNewEntry((prev) => ({ ...prev, time: e.target.value }))}
                className="px-1.5 py-0.5 rounded border border-border bg-background text-xs font-sans w-32"
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={newEntry.description}
                onChange={(e) => setNewEntry((prev) => ({ ...prev, description: e.target.value }))}
                className="px-1.5 py-0.5 rounded border border-border bg-background text-xs font-sans flex-1 min-w-[10rem]"
              />
              <button type="submit" className="px-3 py-0.5 rounded bg-accent text-accent-foreground text-xs font-sans font-medium">
                Add
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
