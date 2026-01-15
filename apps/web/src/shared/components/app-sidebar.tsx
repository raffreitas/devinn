import {
  Home,
  Package,
  Calendar,
  DollarSign,
  Layers,
  Receipt,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/shared/components/ui/sidebar";

const navigation = [
  { title: "Dashboard", href: "/", icon: Home },
  { title: "Categorias", href: "/inventory/categories", icon: Layers },
  { title: "Quartos", href: "/inventory/rooms", icon: Package },
  { title: "Reservas", href: "/bookings", icon: Calendar },
  { title: "Financeiro", href: "/financial", icon: DollarSign },
  { title: "Despesas", href: "/financial/expenses", icon: Receipt },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
