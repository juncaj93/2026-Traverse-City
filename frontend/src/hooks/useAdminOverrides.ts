import { createContext, useContext, useState, useCallback } from "react";
import { useRefreshOnFocus } from "./useRefreshOnFocus";

export type AdminOverrides = {
  cancelled:   { dayId: string; restaurantName: string }[];
  timeChanges: { dayId: string; restaurantName: string; newTime: string }[];
  additions:   { id: string; dayId: string; name: string; time: string; description: string }[];
};

const EMPTY: AdminOverrides = { cancelled: [], timeChanges: [], additions: [] };

type AdminCtx = {
  overrides: AdminOverrides;
  loading: boolean;
  refresh:        () => Promise<void>;
  cancelBooking:  (pin: string, dayId: string, restaurantName: string) => Promise<boolean>;
  restoreBooking: (pin: string, dayId: string, restaurantName: string) => Promise<boolean>;
  updateTime:     (pin: string, dayId: string, restaurantName: string, newTime: string) => Promise<boolean>;
  addEntry:       (pin: string, dayId: string, name: string, time: string, description: string) => Promise<boolean>;
  removeAddition: (pin: string, id: string) => Promise<boolean>;
  verifyPin:      (pin: string) => Promise<boolean>;
};

export const AdminOverridesContext = createContext<AdminCtx>({
  overrides: EMPTY,
  loading: false,
  refresh:        async () => {},
  cancelBooking:  async () => false,
  restoreBooking: async () => false,
  updateTime:     async () => false,
  addEntry:       async () => false,
  removeAddition: async () => false,
  verifyPin:      async () => false,
});

export const useAdminOverrides = () => useContext(AdminOverridesContext);

async function apiPost<T>(url: string, body: object): Promise<T | null> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    return await res.json() as T;
  } catch { return null; }
}

export function useAdminOverridesProvider() {
  const [overrides, setOverrides] = useState<AdminOverrides>(EMPTY);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/overrides", { cache: "no-store" });
      if (!res.ok) return;
      setOverrides(await res.json() as AdminOverrides);
      setLoading(false);
    } catch { /* keep current state */ }
  }, []);

  useRefreshOnFocus(refresh);

  // Every mutation returns the full updated object, so whoever made the change
  // sees it immediately without another request.
  const apply = (result: AdminOverrides | null) => {
    if (result) setOverrides(result);
    return !!result;
  };

  const verifyPin = async (pin: string) => {
    const r = await apiPost<{ ok: boolean }>("/api/admin/ping", { pin });
    return r?.ok === true;
  };

  const cancelBooking = (pin: string, dayId: string, restaurantName: string) =>
    apiPost<AdminOverrides>("/api/admin/cancel", { pin, dayId, restaurantName }).then(apply);

  const restoreBooking = (pin: string, dayId: string, restaurantName: string) =>
    apiPost<AdminOverrides>("/api/admin/restore", { pin, dayId, restaurantName }).then(apply);

  const updateTime = (pin: string, dayId: string, restaurantName: string, newTime: string) =>
    apiPost<AdminOverrides>("/api/admin/update-time", { pin, dayId, restaurantName, newTime }).then(apply);

  const addEntry = (pin: string, dayId: string, name: string, time: string, description: string) =>
    apiPost<AdminOverrides>("/api/admin/add", { pin, dayId, name, time, description }).then(apply);

  const removeAddition = async (pin: string, id: string) => {
    try {
      const res = await fetch(`/api/admin/addition/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      if (!res.ok) return false;
      setOverrides(await res.json() as AdminOverrides);
      return true;
    } catch { return false; }
  };

  return { overrides, loading, refresh, cancelBooking, restoreBooking, updateTime, addEntry, removeAddition, verifyPin };
}
