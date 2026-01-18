import { useQuery } from "@tanstack/react-query";
import { Building2, Check, ChevronsUpDown, Eraser } from "lucide-react";
import { tenantService } from "@/features/tenants/services/tenant-service";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/components/ui/sidebar";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useTenant } from "@/shared/contexts/tenant-context";

export function TenantSelector() {
  const {
    innId,
    setInnId,
    clearTenant,
    userRole,
    isLoading: isContextLoading,
  } = useTenant();

  const { data: inns, isLoading: isInnsLoading } = useQuery({
    queryKey: ["inns"],
    queryFn: tenantService.listInns,
    enabled: userRole === "SuperAdmin",
  });

  const selectedInn = inns?.find((inn) => inn.id === innId);

  if (isContextLoading) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>Pousada</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <Skeleton className="h-10 w-full" />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    );
  }

  // Não mostra nada para InnAdmin
  if (userRole !== "SuperAdmin") {
    return null;
  }

  if (isInnsLoading) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>Pousada</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <Skeleton className="h-10 w-full" />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    );
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Pousada</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Building2 className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {selectedInn?.name || "Selecione uma pousada"}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              align="start"
              side="bottom"
              sideOffset={4}
            >
              {inns && inns.length > 0 ? (
                inns.map((inn) => (
                  <DropdownMenuItem
                    key={inn.id}
                    onClick={() => setInnId(inn.id)}
                    className="gap-2 p-2"
                  >
                    <div className="flex size-6 items-center justify-center rounded-sm border">
                      <Building2 className="size-4 shrink-0" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{inn.name}</div>
                      {/* <div className="truncate text-xs text-muted-foreground">
                        ID: {inn.id}
                      </div> */}
                    </div>
                    {inn.id === innId && <Check className="size-4" />}
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled className="p-2">
                  Nenhuma pousada encontrada
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              <DropdownMenuItem
                disabled={!innId}
                onClick={() => clearTenant()}
                className="gap-2 p-2"
              >
                <Eraser className="size-4" />
                Limpar seleção
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
