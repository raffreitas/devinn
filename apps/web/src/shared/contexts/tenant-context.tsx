import { jwtDecode } from "jwt-decode";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { STORAGE_KEYS, storage } from "@/shared/lib/storage";

interface JWTPayload {
  sub: string;
  email: string;
  role: "SuperAdmin" | "InnAdmin";
  inn_id?: string;
  exp: number;
}

interface TenantContextData {
  innId: string | null;
  setInnId: (innId: string) => void;
  userRole: "SuperAdmin" | "InnAdmin" | null;
  isLoading: boolean;
  clearTenant: () => void;
}

const TenantContext = createContext<TenantContextData | undefined>(undefined);

interface TenantProviderProps {
  children: ReactNode;
}

export function TenantProvider({ children }: TenantProviderProps) {
  const [innId, setInnIdState] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<"SuperAdmin" | "InnAdmin" | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = storage.get(STORAGE_KEYS.TOKEN);

    if (token) {
      try {
        const decoded = jwtDecode<JWTPayload>(token);
        setUserRole(decoded.role);

        // Se for InnAdmin, o inn_id vem do JWT
        if (decoded.role === "InnAdmin" && decoded.inn_id) {
          setInnIdState(decoded.inn_id);
          storage.set(STORAGE_KEYS.TENANT_ID, decoded.inn_id);
        } else if (decoded.role === "SuperAdmin") {
          // Para SuperAdmin, tenta recuperar do localStorage
          const savedInnId = storage.get(STORAGE_KEYS.TENANT_ID);
          if (savedInnId) {
            setInnIdState(savedInnId);
          }
        }
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }

    setIsLoading(false);
  }, []);

  const setInnId = useCallback((newInnId: string) => {
    setInnIdState(newInnId);
    storage.set(STORAGE_KEYS.TENANT_ID, newInnId);
  }, []);

  const clearTenant = useCallback(() => {
    setInnIdState(null);
    storage.remove(STORAGE_KEYS.TENANT_ID);
  }, []);

  return (
    <TenantContext.Provider
      value={{
        innId,
        setInnId,
        userRole,
        isLoading,
        clearTenant,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);

  if (context === undefined) {
    throw new Error("useTenant must be used within a TenantProvider");
  }

  return context;
}
