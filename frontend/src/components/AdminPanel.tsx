import { useState, useEffect, useRef, useCallback } from "react";
import type { CSSProperties } from "react";
import { createPortal } from "react-dom";
import { Lock, X, Trash2, Edit2, Plus, Check, RotateCcw, Delete, ArrowLeft } from "lucide-react";
import { useAdminOverrides } from "../hooks/useAdminOverrides";
import { itinerary } from "../data/itinerary";
import { GOLD } from "../lib/theme";

const ALL_DAYS = itinerary;
type Tab = "bookings" | "add";

export function AdminButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Admin"
        aria-label="Admin"
        className="p-1.5 rounded text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted transition-colors"
      >
        <Lock className="w-3.5 h-3.5" />
      </button>
      {open && <AdminModal onClose={() => setOpen(false)} />}
    </>
  );
}

// ── PIN Numpad ──────────────────────────────────────────────────────────────
function PinNumpad({ onSuccess }: { onSuccess: (pin: string) => void }) {
  const [entered, setEntered] = useState("");
  const [shake, setShake] = useState(false);
  const [checking, setCheck] = useState(false);
  const { verifyPin } = useAdminOverrides();
  const CORRECT_LEN = 4;

  const press = async (digit: string) => {
    if (checking) return;
    const next = entered + digit;
    setEntered(next);
    if (next.length < CORRECT_LEN) return;
    setCheck(true);
    const ok = await verifyPin(next);
    setCheck(false);
    if (ok) { onSuccess(next); }
    else {
      setShake(true);
      setTimeout(() => { setShake(false); setEntered(""); }, 500);
    }
  };

  const backspace = () => { if (!checking) setEntered((p) => p.slice(0, -1)); };
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];

  return (
    <div className="flex flex-col items-center p-5 w-full">
      <div className="flex items-center gap-2 mb-5">
        <Lock className="w-4 h-4 text-muted-foreground" />
        <span className="font-serif text-base text-foreground">Admin Access</span>
      </div>
      <div className={`flex justify-center gap-4 mb-5 ${shake ? "animate-[shake_0.4s_ease]" : ""}`}>
        {Array.from({ length: CORRECT_LEN }).map((_, i) => (
          <div key={i} className="w-4 h-4 rounded-full border-2 transition-all duration-150"
            style={{
              borderColor: entered.length > i ? GOLD : "var(--color-border)",
              background: entered.length > i ? GOLD : "transparent",
              transform: entered.length > i ? "scale(1.2)" : "scale(1)",
            }}
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-1.5 w-full max-w-[220px]">
        {keys.map((k, i) => {
          if (k === "") return <div key={i} />;
          if (k === "⌫") return (
            <button key={i} onClick={backspace} disabled={!entered || checking}
              className="h-11 rounded-xl font-sans font-medium text-sm border border-border bg-muted/50 flex items-center justify-center text-muted-foreground hover:bg-muted disabled:opacity-30 transition-colors"
            >
              <Delete className="w-4 h-4" />
            </button>
          );
          return (
            <button key={i} onClick={() => press(k)}
              disabled={checking || entered.length >= CORRECT_LEN}
              className="h-11 rounded-xl font-sans font-semibold text-base border border-border bg-card hover:bg-muted active:scale-95 disabled:opacity-40 transition-all"
            >
              {checking && entered.length >= CORRECT_LEN ? "…" : k}
            </button>
          );
        })}
      </div>
      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0);}20%{transform:translateX(-8px);}
          40%{transform:translateX(8px);}60%{transform:translateX(-6px);}80%{transform:translateX(6px);}
        }
      `}</style>
    </div>
  );
}

// ── Full-screen admin panel ─────────────────────────────────────────────────
function AdminScreen({ onClose, pin }: { onClose: () => void; pin: string }) {
  const { overrides, cancelBooking, restoreBooking, updateTime, addEntry, removeAddition } = useAdminOverrides();

  const [tab, setTab] = useState<Tab>("bookings");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");

  const [addDayId, setAddDayId] = useState(ALL_DAYS[0].id);
  const [addName, setAddName] = useState("");
  const [addTime, setAddTime] = useState("");
  const [addDesc, setAddDesc] = useState("");

  const [editKey, setEditKey] = useState<string | null>(null);
  const [editVal, setEditVal] = useState("");

  const headerRef = useRef<HTMLDivElement>(null);
  const [headerH, setHeaderH] = useState(0);

  useEffect(() => {
    if (headerRef.current) setHeaderH(headerRef.current.getBoundingClientRect().height);
  }, []);

  const flash = useCallback((msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(""), 2500);
  }, []);

  const act = useCallback(async (fn: () => Promise<boolean>, msg: string) => {
    setBusy(true);
    const ok = await fn();
    setBusy(false);
    if (ok) flash(msg); else flash("⚠️ Error — check connection");
  }, [flash]);

  const isCancelled = (dayId: string, name: string) =>
    overrides.cancelled.some((c) => c.dayId === dayId && c.restaurantName === name);
  const effectiveTime = (dayId: string, name: string, orig: string) =>
    overrides.timeChanges.find((t) => t.dayId === dayId && t.restaurantName === name)?.newTime ?? orig;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 500, background: "var(--color-background)" }}>
      <div
        ref={headerRef}
        style={{
          position: "absolute", top: 0, left: 0, right: 0,
          paddingTop: "max(env(safe-area-inset-top),12px)",
          paddingBottom: 12,
          background: "var(--color-background)",
          borderBottom: "1px solid var(--color-border)",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, paddingLeft: 16, paddingRight: 16 }}>
          <button
            onClick={onClose}
            style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--color-muted-foreground)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            <ArrowLeft size={16} />
            <span style={{ fontFamily: "var(--app-font-sans)", fontSize: 14 }}>Done</span>
          </button>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
            <Lock size={14} color={GOLD} />
            <span style={{ fontFamily: "var(--app-font-sans)", fontWeight: 600, fontSize: 14 }}>Admin Panel</span>
          </div>
          {feedback && (
            <span style={{ fontFamily: "var(--app-font-sans)", fontSize: 12, color: "hsl(158,45%,40%)" }}>
              {feedback}
            </span>
          )}
        </div>

        <div style={{ display: "flex", marginTop: 8 }}>
          {(["bookings", "add"] as Tab[]).map((id) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                flex: 1, paddingTop: 10, paddingBottom: 10, border: "none", cursor: "pointer",
                fontFamily: "var(--app-font-sans)", fontWeight: 600, fontSize: 14,
                background: "none",
                borderBottom: tab === id ? `2px solid ${GOLD}` : "2px solid transparent",
                color: tab === id ? GOLD : "var(--color-muted-foreground)",
              }}
            >
              {id === "bookings" ? "📋 Bookings" : "➕ Add Entry"}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: headerH || 100,
          bottom: 0, left: 0, right: 0,
          overflowY: "scroll",
          WebkitOverflowScrolling: "touch" as CSSProperties["WebkitOverflowScrolling"],
          paddingBottom: "env(safe-area-inset-bottom, 24px)",
        } as CSSProperties}
      >
        {tab === "bookings" && (
          <div style={{ borderTop: "1px solid var(--color-border)" }}>
            {ALL_DAYS.map((day) => {
              const dayRestaurants = day.restaurants ?? [];
              const dayAdditions = overrides.additions.filter((a) => a.dayId === day.id);
              if (!dayRestaurants.length && !dayAdditions.length) return null;
              return (
                <div key={day.id} style={{ padding: "16px", borderBottom: "1px solid var(--color-border)" }}>
                  <p style={{ fontFamily: "var(--app-font-sans)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--color-muted-foreground)", marginBottom: 10 }}>
                    {day.day} · {day.date} · {day.title}
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {dayRestaurants.map((r) => {
                      const cancelled = isCancelled(day.id, r.name);
                      const curTime = effectiveTime(day.id, r.name, r.time);
                      const isEditing = editKey === `${day.id}::${r.name}`;
                      const timeChanged = overrides.timeChanges.some((t) => t.dayId === day.id && t.restaurantName === r.name);
                      return (
                        <div key={r.name} style={{
                          display: "flex", alignItems: "center", gap: 8,
                          borderRadius: 12, padding: "10px 12px",
                          border: `1px solid ${cancelled ? "hsl(0,70%,88%)" : "var(--color-border)"}`,
                          background: cancelled ? "hsl(0,70%,97%)" : "var(--color-card)",
                        }}>
                          <span style={{
                            flex: 1, fontFamily: "var(--app-font-sans)", fontWeight: 500, fontSize: 14,
                            color: cancelled ? "var(--color-muted-foreground)" : "var(--color-foreground)",
                            textDecoration: cancelled ? "line-through" : "none",
                          }}>{r.name}</span>

                          {isEditing ? (
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <input
                                type="text" value={editVal} onChange={(e) => setEditVal(e.target.value)}
                                autoFocus placeholder="e.g. 4:00 pm"
                                style={{
                                  width: 96, border: "1px solid var(--color-border)", borderRadius: 8,
                                  padding: "4px 10px", fontSize: 14, fontFamily: "var(--app-font-sans)",
                                  background: "var(--color-background)", color: "var(--color-foreground)", outline: "none",
                                }}
                              />
                              <button onClick={() => {
                                if (editVal.trim()) act(() => updateTime(pin, day.id, r.name, editVal.trim()), "⏰ Updated");
                                setEditKey(null);
                              }} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "hsl(158,45%,40%)" }}>
                                <Check size={16} />
                              </button>
                              <button onClick={() => setEditKey(null)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "var(--color-muted-foreground)" }}>
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <span style={{
                              fontFamily: "var(--app-font-sans)", fontSize: 13, marginRight: 4,
                              color: timeChanged ? GOLD : "var(--color-muted-foreground)",
                              fontWeight: timeChanged ? 600 : 400,
                            }}>{curTime}</span>
                          )}

                          {!isEditing && !cancelled && (
                            <button
                              onClick={() => { setEditKey(`${day.id}::${r.name}`); setEditVal(curTime); }}
                              disabled={busy}
                              style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "var(--color-muted-foreground)" }}
                            ><Edit2 size={14} /></button>
                          )}
                          <button
                            onClick={() => act(
                              () => cancelled ? restoreBooking(pin, day.id, r.name) : cancelBooking(pin, day.id, r.name),
                              cancelled ? "✅ Restored" : "❌ Cancelled",
                            )}
                            disabled={busy}
                            style={{
                              background: "none", border: "none", cursor: "pointer", padding: 4,
                              color: cancelled ? "hsl(158,45%,40%)" : "hsl(0,65%,55%)",
                            }}
                          >
                            {cancelled ? <RotateCcw size={14} /> : <Trash2 size={14} />}
                          </button>
                        </div>
                      );
                    })}
                    {dayAdditions.map((a) => (
                      <div key={a.id} style={{
                        display: "flex", alignItems: "center", gap: 8,
                        borderRadius: 12, padding: "10px 12px",
                        border: `1px solid ${GOLD}55`,
                        background: `${GOLD}14`,
                      }}>
                        <Plus size={14} color={GOLD} style={{ flexShrink: 0 }} />
                        <span style={{ flex: 1, fontFamily: "var(--app-font-sans)", fontWeight: 500, fontSize: 14, color: "var(--color-foreground)" }}>{a.name}</span>
                        <span style={{ fontFamily: "var(--app-font-sans)", fontSize: 13, color: "var(--color-muted-foreground)", marginRight: 4 }}>{a.time}</span>
                        <button
                          onClick={() => act(() => removeAddition(pin, a.id), "🗑️ Removed")}
                          disabled={busy}
                          style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "hsl(0,65%,55%)" }}
                        ><Trash2 size={14} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === "add" && (
          <div style={{ padding: "20px 20px 40px" }}>
            <label style={labelStyle}>Day</label>
            <select value={addDayId} onChange={(e) => setAddDayId(e.target.value)} style={inputStyle}>
              {ALL_DAYS.map((d) => (
                <option key={d.id} value={d.id}>{d.day} · {d.date} · {d.title}</option>
              ))}
            </select>

            <label style={labelStyle}>Place / Name</label>
            <input type="text" value={addName} onChange={(e) => setAddName(e.target.value)}
              placeholder="e.g. Chateau Chantal" style={inputStyle} />

            <label style={labelStyle}>Time</label>
            <input type="text" value={addTime} onChange={(e) => setAddTime(e.target.value)}
              placeholder="e.g. 12:30 pm" style={inputStyle} />

            <label style={labelStyle}>Short description</label>
            <input type="text" value={addDesc} onChange={(e) => setAddDesc(e.target.value)}
              placeholder="e.g. Hilltop winery with bay views" style={inputStyle} />

            <button
              onClick={() => {
                if (!addName.trim() || !addTime.trim()) return;
                act(() => addEntry(pin, addDayId, addName.trim(), addTime.trim(), addDesc.trim()), "✅ Added!");
                setAddName(""); setAddTime(""); setAddDesc("");
              }}
              disabled={!addName.trim() || !addTime.trim() || busy}
              style={{
                width: "100%", marginTop: 8, padding: "14px 0", borderRadius: 12,
                border: "none", cursor: "pointer",
                fontFamily: "var(--app-font-sans)", fontWeight: 600, fontSize: 14,
                background: GOLD, color: "#000",
                opacity: (!addName.trim() || !addTime.trim() || busy) ? 0.5 : 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              <Plus size={16} /> Add to Itinerary
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const labelStyle: CSSProperties = {
  display: "block", marginBottom: 6, marginTop: 16,
  fontFamily: "var(--app-font-sans)", fontSize: 11,
  textTransform: "uppercase", letterSpacing: "0.1em",
  color: "var(--color-muted-foreground)",
};

const inputStyle: CSSProperties = {
  width: "100%", boxSizing: "border-box",
  border: "1px solid var(--color-border)", borderRadius: 12,
  padding: "12px 14px", fontSize: 14, fontFamily: "var(--app-font-sans)",
  background: "var(--color-background)", color: "var(--color-foreground)",
  outline: "none", appearance: "none", WebkitAppearance: "none",
};

// ── Modal wrapper ───────────────────────────────────────────────────────────
function AdminModal({ onClose }: { onClose: () => void }) {
  const [authed, setAuthed] = useState(false);
  const [pin, setPin] = useState("");

  if (!authed) {
    return createPortal(
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 500,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 24, background: "rgba(0,0,0,0.6)",
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "var(--color-background)",
            border: "1px solid var(--color-border)",
            borderRadius: 16, boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            width: "100%", maxWidth: 300,
          }}
        >
          <PinNumpad onSuccess={(verifiedPin) => { setPin(verifiedPin); setAuthed(true); }} />
        </div>
      </div>,
      document.body,
    );
  }

  return createPortal(<AdminScreen onClose={onClose} pin={pin} />, document.body);
}
