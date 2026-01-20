import { ChevronDownIcon, EraserIcon } from "lucide-react";
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
  const { innId, setInn, clearInn } = useAuth();
  const { data, isLoading } = useInns();

  const selectedInn = data?.find((inn) => inn.id === innId);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton>
              {selectedInn?.name || "Selecione uma pousada"}
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
