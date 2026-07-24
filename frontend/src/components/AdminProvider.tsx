import type { ReactNode } from "react";
import { AdminOverridesContext, useAdminOverridesProvider } from "../hooks/useAdminOverrides";

export function AdminProvider({ children }: { children: ReactNode }) {
  const value = useAdminOverridesProvider();
  return <AdminOverridesContext.Provider value={value}>{children}</AdminOverridesContext.Provider>;
}
