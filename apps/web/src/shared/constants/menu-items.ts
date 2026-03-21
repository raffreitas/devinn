import {
  BedDoubleIcon,
  CalendarDaysIcon,
  CalendarIcon,
  LayoutGridIcon,
  // SettingsIcon,
  TrendingDownIcon,
  WalletIcon,
} from "lucide-react";

export const menuItems = [
  { title: "Calendário", href: "/", icon: CalendarDaysIcon },
  { title: "Reservas", href: "/bookings", icon: CalendarIcon },
  { title: "Categorias", href: "/inventory/categories", icon: LayoutGridIcon },
  { title: "Quartos", href: "/inventory/rooms", icon: BedDoubleIcon },
  { title: "Financeiro", href: "/financial", icon: WalletIcon },
  { title: "Despesas", href: "/financial/expenses", icon: TrendingDownIcon },
  // { title: "Configurações", href: "/settings", icon: SettingsIcon },
];
