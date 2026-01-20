import {
  BedDoubleIcon,
  CalendarIcon,
  HomeIcon,
  LayoutGridIcon,
} from "lucide-react";

export const menuItems = [
  { title: "Dashboard", href: "/", icon: HomeIcon },
  { title: "Categorias", href: "/inventory/categories", icon: LayoutGridIcon },
  { title: "Quartos", href: "/inventory/rooms", icon: BedDoubleIcon },
  { title: "Reservas", href: "/bookings", icon: CalendarIcon },
  // { title: "Financeiro", href: "/financial", icon: CreditCardIcon },
  // { title: "Despesas", href: "/financial/expenses", icon: ReceiptIcon },
  // { title: "Configurações", href: "/settings", icon: Settings },
];
