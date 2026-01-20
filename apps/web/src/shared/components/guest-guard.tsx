import { Navigate, Outlet } from "react-router";
import { STORAGE_KEYS, storage } from "../lib/storage";

export function RequireGuest() {
  const token = storage.get(STORAGE_KEYS.TOKEN);

  if (token) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
