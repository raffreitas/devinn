import { Badge } from "@/shared/components/ui/badge";
import { Globe, Home, User } from "lucide-react";
import type { BookingSource } from "../types";
import { getBookingSourceLabel } from "../utils/booking-helpers";

interface BookingSourceBadgeProps {
  source: BookingSource;
  className?: string;
}

export function BookingSourceBadge({
  source,
  className,
}: BookingSourceBadgeProps) {
  const getIcon = () => {
    switch (source) {
      case "Manual":
        return <User className="h-3 w-3" />;
      case "BookingApi":
      case "BookingIcal":
        return <Globe className="h-3 w-3" />;
      case "AirbnbIcal":
        return <Home className="h-3 w-3" />;
      case "DirectWebsite":
        return <Globe className="h-3 w-3" />;
    }
  };

  const getStyle = () => {
    switch (source) {
      case "BookingApi":
      case "BookingIcal":
        return "bg-[#0071C2] text-white hover:bg-[#0071C2]/90";
      case "AirbnbIcal":
        return "bg-[#FF385C] text-white hover:bg-[#FF385C]/90";
      default:
        return "";
    }
  };

  const variant = source === "Manual" ? "secondary" : undefined;

  return (
    <Badge
      variant={variant}
      className={`flex items-center gap-1 text-xs ${getStyle()} ${className || ""}`}
    >
      {getIcon()}
      {getBookingSourceLabel(source)}
    </Badge>
  );
}
