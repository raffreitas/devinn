import { useQuery } from "@tanstack/react-query";
import { Building2 } from "lucide-react";
import { env } from "@/env";
import { tenantService } from "@/features/tenants/services/tenant-service";
import { Badge } from "@/shared/components/ui/badge";
import { SidebarTrigger } from "@/shared/components/ui/sidebar";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useTenant } from "@/shared/contexts/tenant-context";

export function AppHeader() {
  const { innId, userRole, isLoading: isTenantContextLoading } = useTenant();

  const {
    data: inn,
    isLoading: isInnLoading,
  } = useQuery({
    queryKey: ["inn", innId],
    enabled: !!innId,
    queryFn: () => {
      if (!innId) throw new Error("No inn ID");
      return tenantService.getInnById(innId);
    },
  });

  const roleLabel =
    userRole === "SuperAdmin"
      ? "Super Admin"
      : userRole === "InnAdmin"
        ? "Admin da Pousada"
        : null;

  const showLoading = isTenantContextLoading || (innId ? isInnLoading : false);

  return (
    <header className="sticky top-0 z-10 flex h-12 sm:h-14 items-center gap-3 border-b bg-background/80 px-3 sm:px-4 backdrop-blur supports-backdrop-filter:bg-background/60">
      <SidebarTrigger />

      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex size-8 items-center justify-center rounded-md bg-muted">
          <Building2 className="size-4 text-muted-foreground" />
        </div>

        <div className="min-w-0">
          <div className="truncate text-sm font-medium">
            {showLoading ? (
              <Skeleton className="h-4 w-32 sm:w-52" />
            ) : inn?.name ? (
              <>{inn.name}</>
            ) : innId ? (
              <>(ID: {innId})</>
            ) : userRole === "SuperAdmin" ? (
              "Selecione uma pousada"
            ) : (
              "Pousada não identificada"
            )}
          </div>
        </div>
      </div>

      {env.MODE === "development" && (
        <div className="hidden sm:flex items-center gap-2">
          {roleLabel && <Badge variant="secondary">{roleLabel}</Badge>}
          {innId ? (
            <Badge variant="outline">Tenant ID: {innId}</Badge>
          ) : (
            <Badge variant="destructive">Nenhuma pousada selecionada</Badge>
          )}
        </div>
      )}

    </header>
  );
}
