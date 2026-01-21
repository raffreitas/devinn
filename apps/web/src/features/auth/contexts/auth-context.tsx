import { useQueryClient } from "@tanstack/react-query";
import { jwtDecode } from "jwt-decode";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router";
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
  innId?: string;
  isLoading: boolean;
  isAuthenticated: boolean;
  setInn: (innId: string) => void;
  clearInn: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

function coerceRole(raw: unknown): UserRole {
  if (raw === "SuperAdmin" || raw === "InnAdmin") return raw;
  return "InnAdmin";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | undefined>();
  const [innId, setInnId] = useState<string | undefined>();
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
    if (payload.inn_id) setInnId(payload.inn_id);

    if (role === "SuperAdmin") {
      const storedInnId = storage.get(STORAGE_KEYS.TENANT_ID);
      if (storedInnId && typeof storedInnId === "string") {
        setInnId(storedInnId);
      }
    }
    setIsLoading(false);

    // Ouve evento global de unauthorized emitido pelo http-client
    const onUnauthorized = () => {
      // usa o logout local para garantir limpeza e navegação via react-router
      logout().catch(() => {});
    };

    window.addEventListener("auth:unauthorized", onUnauthorized as EventListener);

    return () => {
      window.removeEventListener("auth:unauthorized", onUnauthorized as EventListener);
    };
  }, []);

  const isAuthenticated = Boolean(user);

  const setInn = (innId: string) => {
    if (typeof window === "undefined") return;
    storage.set(STORAGE_KEYS.TENANT_ID, innId);
    setInnId(innId);
    queryClient.invalidateQueries();
  };

  const clearInn = () => {
    if (typeof window === "undefined") return;
    storage.remove(STORAGE_KEYS.TENANT_ID);
    setInnId(undefined);
    queryClient.invalidateQueries();
  };

  const logout = async () => {
    storage.remove(STORAGE_KEYS.TOKEN);
    storage.remove(STORAGE_KEYS.TENANT_ID);
    setUser(undefined);
    setInnId(undefined);
    queryClient.clear();
    navigate("/login", { replace: true });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        innId,
        setInn,
        clearInn,
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
