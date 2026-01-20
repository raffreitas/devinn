import { ChevronDownIcon } from "lucide-react";
import { Link } from "react-router";
import { useAuth } from "@/features/auth/contexts/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";

export function AppSidebarHeader() {
  const { user } = useAuth();

  return (
    <SidebarHeader>
      {user?.role === "SuperAdmin" ? (
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  Select Workspace
                  <ChevronDownIcon className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[--radix-popper-anchor-width]">
                <DropdownMenuItem>
                  <span>Acme Inc</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Acme Corp.</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      ) : (
        <SidebarMenuButton asChild>
          <Link to="/">
            <h1 className="text-xl font-bold truncate">
              <span className="text-primary">Dev</span>Inn</h1>
          </Link>
        </SidebarMenuButton>
      )}
    </SidebarHeader>
  );
}
