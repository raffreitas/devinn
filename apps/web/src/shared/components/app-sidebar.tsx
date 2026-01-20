import {
  BedDoubleIcon,
  CalendarIcon,
  CreditCardIcon,
  Home,
  LayoutGridIcon,
  ReceiptIcon,
  Settings,
} from "lucide-react";
import { AppSidebarFooter } from "./app-sidebar-footer";
import { AppSidebarHeader } from "./app-sidebar-header";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";

// Menu items.
const navigation = [
  { title: "Dashboard", href: "/", icon: Home },
  { title: "Categorias", href: "/inventory/categories", icon: LayoutGridIcon },
  { title: "Quartos", href: "/inventory/rooms", icon: BedDoubleIcon },
  { title: "Reservas", href: "/bookings", icon: CalendarIcon },
  { title: "Financeiro", href: "/financial", icon: CreditCardIcon },
  { title: "Despesas", href: "/financial/expenses", icon: ReceiptIcon },
  { title: "Configurações", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <AppSidebarHeader />
      <SidebarContent>
        <SidebarGroup>
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
      <AppSidebarFooter />
    </Sidebar>
  );
}
