import { Link } from "react-router";
import { useAuth } from "@/features/auth/contexts/auth-context";
import { InnSelector } from "@/features/inns/components/inn-selector";
import { SidebarHeader, SidebarMenuButton } from "./ui/sidebar";

export function AppSidebarHeader() {
  const { user } = useAuth();

  return (
    <SidebarHeader>
      {user?.role === "SuperAdmin" ? (
        <InnSelector />
      ) : (
        <SidebarMenuButton asChild>
          <Link to="/">
            <h1 className="text-xl font-bold truncate">
              <span className="text-primary">Dev</span>Inn
            </h1>
          </Link>
        </SidebarMenuButton>
      )}
    </SidebarHeader>
  );
}
