import {
  BedDoubleIcon,
  CalendarIcon,
  HomeIcon,
  LayoutGridIcon,
  TrendingDownIcon,
  WalletIcon,
} from "lucide-react";

export const menuItems = [
  { title: "Dashboard", href: "/", icon: HomeIcon },
  { title: "Categorias", href: "/inventory/categories", icon: LayoutGridIcon },
  { title: "Quartos", href: "/inventory/rooms", icon: BedDoubleIcon },
  { title: "Reservas", href: "/bookings", icon: CalendarIcon },
  { title: "Financeiro", href: "/financial", icon: WalletIcon },
  { title: "Despesas", href: "/financial/expenses", icon: TrendingDownIcon },
  // { title: "Configurações", href: "/settings", icon: Settings },
];
