import { Navigate, Outlet } from "react-router-dom";
import { STORAGE_KEYS, storage } from "@/shared/lib/storage";

/**
 * Guard component that protects guest-only routes (like login page).
 * Redirects to home (/) if user is already authenticated.
 */
export function RequireGuest() {
  const token = storage.get(STORAGE_KEYS.TOKEN);

  if (token) {
    // User is already authenticated, redirect to home
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
