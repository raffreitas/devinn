import { AuthProvider, useAuth } from "./auth-context";

export const TenantProvider = AuthProvider;

export function useTenant() {
  return useAuth();
}
