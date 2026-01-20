import { Navigate, Outlet, useLocation } from "react-router-dom";
import { STORAGE_KEYS, storage } from "@/shared/lib/storage";

/**
 * Guard component that protects private routes.
 * Redirects to /sign-in if no authentication token is found.
 * Saves the attempted location to redirect back after login.
 */
export function RequireAuth() {
  const location = useLocation();
  const token = storage.get(STORAGE_KEYS.TOKEN);

  if (!token) {
    // Redirect to sign-in, but save the location they were trying to go to
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
