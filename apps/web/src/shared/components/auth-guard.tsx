import { Navigate, Outlet, useLocation } from "react-router";
import { STORAGE_KEYS, storage } from "../lib/storage";

export function RequireAuth() {
  const location = useLocation();
  const token = storage.get(STORAGE_KEYS.TOKEN);

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
