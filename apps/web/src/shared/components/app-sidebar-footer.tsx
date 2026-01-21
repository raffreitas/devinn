import { LogOutIcon, User2Icon } from "lucide-react";
import { useAuth } from "@/features/auth/contexts/auth-context";
import { useProfile } from "@/features/auth/hooks/use-profile";
import { Button } from "./ui/button";
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
          <SidebarMenuButton>
            <User2Icon /> {data?.name || "Usuário"}
            <Button
              variant="ghost"
              className="p-0 ml-auto cursor-pointer hover:text-primary"
              title="Sair"
              asChild
              onClick={logout}
            >
              <LogOutIcon />
            </Button>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
}
