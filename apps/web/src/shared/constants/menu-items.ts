import {
  BedDoubleIcon,
  CalendarIcon,
  HomeIcon,
  LayoutGridIcon,
  Link2Icon,
  WalletIcon,
} from "lucide-react";

export const menuItems = [
  { title: "Dashboard", href: "/", icon: HomeIcon },
  { title: "Categorias", href: "/inventory/categories", icon: LayoutGridIcon },
  { title: "Quartos", href: "/inventory/rooms", icon: BedDoubleIcon },
  { title: "Reservas", href: "/bookings", icon: CalendarIcon },
  { title: "Financeiro", href: "/financial", icon: WalletIcon },
  { title: "Integrações", href: "/integrations", icon: Link2Icon },
  // { title: "Configurações", href: "/settings", icon: Settings },
];
