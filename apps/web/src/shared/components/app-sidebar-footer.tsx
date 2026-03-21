import { ChevronUpIcon, LogOutIcon, User2Icon } from "lucide-react";
import { Link } from "react-router";
import { useAuth } from "@/features/auth/contexts/auth-context";
import { useProfile } from "@/features/auth/hooks/use-profile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";

export function AppSidebarFooter() {
  const { logout } = useAuth();
  const { data } = useProfile();

  return (
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton className="w-full justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <User2Icon className="size-4" />
                  <span>{data?.name || "Usuário"}</span>
                </div>
                <ChevronUpIcon className="size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            >
              <DropdownMenuItem asChild>
                <Link
                  to="/profile"
                  className="cursor-pointer flex items-center gap-2"
                >
                  <User2Icon className="size-4" />
                  <span>Meu Perfil</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={logout}
                className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive flex items-center gap-2"
              >
                <LogOutIcon className="size-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
}
