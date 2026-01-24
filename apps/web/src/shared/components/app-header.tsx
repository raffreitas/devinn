import { Building2Icon } from "lucide-react";
import { Link } from "react-router";
import { env } from "@/env";
import { useAuth } from "@/features/auth/contexts/auth-context";
import { useInn } from "@/features/inns/hooks/use-inns";
import { ThemeToggle } from "./theme-toggle";
import { SidebarTrigger } from "./ui/sidebar";
import { Skeleton } from "./ui/skeleton";

export function AppHeader() {
  const { user, innId } = useAuth();

  const { data, isLoading } = useInn(innId || "");
  return (
    <header className="sticky top-0 z-20 flex h-12 sm:h-14 items-center gap-3 border-b bg-background/80 px-3 sm:px-4 backdrop-blur supports-backdrop-filter:bg-background/60">
      <SidebarTrigger />

      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Link to="/">
          <div className="flex size-8 items-center justify-center rounded-md bg-muted">
            <Building2Icon className="size-4 text-muted-foreground" />
          </div>
        </Link>
        <div className="min-w-0">
          <div className="truncate text-sm font-medium">
            {isLoading ? (
              <Skeleton className="h-4 w-32 sm:w-52" />
            ) : data?.name ? (
              data.name
            ) : innId ? (
              <>(ID: {innId})</>
            ) : user?.role === "SuperAdmin" ? (
              "Selecione uma pousada"
            ) : (
              "Pousada não identificada"
            )}
          </div>
        </div>
      </div>

      <ThemeToggle />

      {env.MODE === "development" && (
        <div className="hidden sm:flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm text-muted-foreground">Development</span>
        </div>
      )}
    </header>
  );
}
