import { LogOutIcon, User2Icon } from "lucide-react";
import { useAuth } from "@/features/auth/contexts/auth-context";
import { Button } from "./ui/button";
import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";

export function AppSidebarFooter() {
  const { logout } = useAuth();
  return (
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton>
            <User2Icon /> Username
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
