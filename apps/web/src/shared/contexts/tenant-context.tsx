import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";

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
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decoded = jwtDecode<JWTPayload>(token);
        setUserRole(decoded.role);

        // Se for InnAdmin, o inn_id vem do JWT
        if (decoded.role === "InnAdmin" && decoded.inn_id) {
          setInnIdState(decoded.inn_id);
        } else if (decoded.role === "SuperAdmin") {
          // Para SuperAdmin, tenta recuperar do localStorage
          const savedInnId = localStorage.getItem("selected_inn_id");
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

  const setInnId = (newInnId: string) => {
    setInnIdState(newInnId);
    if (userRole === "SuperAdmin") {
      localStorage.setItem("selected_inn_id", newInnId);
    }
  };

  return (
    <TenantContext.Provider
      value={{
        innId,
        setInnId,
        userRole,
        isLoading,
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
