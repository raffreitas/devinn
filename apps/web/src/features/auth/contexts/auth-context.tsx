import { useQueryClient } from "@tanstack/react-query";
import { jwtDecode } from "jwt-decode";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { STORAGE_KEYS, storage } from "@/shared/lib/storage";
import type { User, UserRole } from "../types";

interface JWTPayload {
  sub: string;
  email: string;
  role: "SuperAdmin" | "InnAdmin";
  inn_id?: string;
  exp: number;
}

interface AuthContextData {
  user?: User;
  isLoading: boolean;
  isAuthenticated: boolean;
  setInnId: (innId: string) => void;
  clearInnId: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

function coerceRole(raw: unknown): UserRole {
  if (raw === "SuperAdmin" || raw === "InnAdmin") return raw;
  return "InnAdmin";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Hydrate auth state from storage/token on mount
    const token = storage.get(STORAGE_KEYS.TOKEN);
    if (!token) {
      setIsLoading(false);
      return;
    }

    const payload = jwtDecode<JWTPayload>(token);
    if (!payload) {
      // invalid token: clear it to avoid repeated failures
      storage.remove(STORAGE_KEYS.TOKEN);
      setIsLoading(false);
      return;
    }

    const id = payload.sub;

    const role = coerceRole(payload.role);

    if (id) setUser({ id, role });
    setIsLoading(false);
  }, []);

  const isAuthenticated = Boolean(user);

  const setInnId = async (innId: string) => {
    if (typeof window === "undefined") return;
    queryClient.invalidateQueries();
    storage.set(STORAGE_KEYS.TENANT_ID, innId);
  };

  const clearInnId = async () => {
    if (typeof window === "undefined") return;
    queryClient.invalidateQueries();
    storage.remove(STORAGE_KEYS.TENANT_ID);
  };

  const logout = async () => {
    storage.remove(STORAGE_KEYS.TOKEN);
    storage.remove(STORAGE_KEYS.TENANT_ID);
    setUser(undefined);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        setInnId,
        clearInnId,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
