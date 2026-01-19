import {
  BedDouble,
  Calendar,
  CreditCard,
  Home,
  LayoutGrid,
  Receipt,
  Settings,
} from "lucide-react";
import { TenantSelector } from "@/features/tenants/components/tenant-selector";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/components/ui/sidebar";

const navigation = [
  { title: "Dashboard", href: "/", icon: Home },
  { title: "Categorias", href: "/inventory/categories", icon: LayoutGrid },
  { title: "Quartos", href: "/inventory/rooms", icon: BedDouble },
  { title: "Reservas", href: "/bookings", icon: Calendar },
  { title: "Financeiro", href: "/financial", icon: CreditCard },
  { title: "Despesas", href: "/financial/expenses", icon: Receipt },
  { title: "Configurações", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <TenantSelector />
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
