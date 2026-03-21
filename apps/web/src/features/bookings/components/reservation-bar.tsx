import { AlertCircle, Check, Link, Lock } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { Booking, PaymentStatus } from "../types";
import { getBlockLabel, isBlock } from "../utils/booking-helpers";

const paymentStatusColors: Record<PaymentStatus, string> = {
  Paid: "bg-emerald-500 hover:bg-emerald-600",
  Partial: "bg-amber-500 hover:bg-amber-600",
  Pending: "bg-rose-500 hover:bg-rose-600",
};

interface ReservationBarProps {
  booking: Booking;
  onClick?: () => void;
  left?: number | string;
  width?: number | string;
}

export function ReservationBar({
  booking,
  onClick,
  left,
  width,
}: ReservationBarProps) {
  const bookingIsBlock = isBlock(booking);
  const remaining = bookingIsBlock
    ? 0
    : booking.pricing.total - booking.totalPaid;

  const barColor = bookingIsBlock
    ? "bg-gray-400/80 hover:bg-gray-500"
    : paymentStatusColors[booking.paymentStatus];

  const label = bookingIsBlock
    ? getBlockLabel(booking.source)
    : booking.guest?.name;

  const tooltip = bookingIsBlock
    ? `Período bloqueado via ${getBlockLabel(booking.source)}. Não editável.`
    : `${booking.guest?.name} - ${remaining > 0 ? `Falta: ${remaining.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}` : "Pago"}`;

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: <explanation> Barra de reserva é um elemento interativo para clique, mas não é um botão tradicional. O clique é tratado para abrir detalhes, e a barra tem feedback visual de hover. Para acessibilidade, idealmente deveria ser um botão, mas devido à estrutura atual do layout, estamos usando uma div com onClick. Planejamos refatorar para melhorar a acessibilidade no futuro.
    // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> Semelhante ao motivo acima, a barra de reserva é interativa, mas não é um elemento de botão tradicional. Para manter a simplicidade da implementação atual, estamos usando uma div com onClick. Reconhecemos que isso não é ideal para acessibilidade, e planejamos refatorar para usar um elemento mais semântico no futuro, garantindo suporte a teclado e leitores de tela.
    <div
      className={cn(
        "absolute top-2 h-10 text-white rounded-md cursor-pointer transition-all flex items-center justify-between px-2 overflow-hidden shadow-sm group",
        barColor,
      )}
      style={{
        left:
          left !== undefined
            ? typeof left === "number"
              ? `${left}px`
              : left
            : undefined,
        width:
          width !== undefined
            ? typeof width === "number"
              ? `${width}px`
              : width
            : undefined,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      title={tooltip}
    >
      <span className="text-xs font-medium truncate flex-1">{label}</span>
      <div className="flex items-center gap-0.5 ml-1">
        {bookingIsBlock ? (
          booking.source.includes("Ical") ? (
            <Link className="w-3 h-3" />
          ) : (
            <Lock className="w-3 h-3" />
          )
        ) : remaining <= 0 ? (
          <Check className="w-3 h-3" />
        ) : (
          <AlertCircle className="w-3 h-3" />
        )}
      </div>
    </div>
  );
}
