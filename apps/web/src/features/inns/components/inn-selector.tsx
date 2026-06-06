import { ChevronDownIcon, EraserIcon } from "lucide-react";
import { useEffect } from "react";
import { useAuth } from "@/features/auth/contexts/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/components/ui/sidebar";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useInns } from "../hooks/use-inns";

export function InnSelector() {
  const { innId, isLoading: isAuthLoading, setInn, clearInn } = useAuth();
  const { data, isLoading } = useInns();

  const selectedInn = data?.find((inn) => inn.id === innId);
  const isResolvingSelection = isAuthLoading || isLoading;
  const hasInvalidSelection = Boolean(
    innId && !isResolvingSelection && data && !selectedInn,
  );

  useEffect(() => {
    if (hasInvalidSelection) {
      clearInn();
    }
  }, [clearInn, hasInvalidSelection]);

  const triggerLabel = (() => {
    if (isResolvingSelection) return null;
    if (selectedInn) return selectedInn.name;
    if (hasInvalidSelection) return "Pousada não encontrada";
    return "Selecione uma pousada";
  })();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton>
              {triggerLabel ?? <Skeleton className="h-4 w-36" />}
              <ChevronDownIcon className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-(--radix-popper-anchor-width)">
            {isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              data?.map((inn) => (
                <DropdownMenuItem key={inn.id} onClick={() => setInn(inn.id)}>
                  <span>{inn.name}</span>
                </DropdownMenuItem>
              ))
            )}

            <DropdownMenuSeparator />

            <DropdownMenuItem
              disabled={!innId}
              onClick={() => clearInn()}
              className="gap-2 p-2"
            >
              <EraserIcon className="size-4" />
              Limpar seleção
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
