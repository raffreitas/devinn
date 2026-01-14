import { differenceInDays, parseISO, startOfDay } from 'date-fns';
import { cn } from '@/shared/lib/utils';
import type { Booking, PaymentStatus } from '../types';

const paymentStatusColors: Record<PaymentStatus, string> = {
  paid: 'bg-green-500 hover:bg-green-600',
  partial: 'bg-yellow-500 hover:bg-yellow-600',
  pending: 'bg-red-500 hover:bg-red-600',
};

interface ReservationBarProps {
  booking: Booking;
  onClick?: () => void;
}

export function ReservationBar({ booking, onClick }: ReservationBarProps) {
  const checkIn = parseISO(booking.checkIn);
  const checkOut = parseISO(booking.checkOut);
  const nights = differenceInDays(startOfDay(checkOut), startOfDay(checkIn));

  // Width calculation: each day cell is 1fr in the grid
  // We need to span across multiple cells
  const gridColumnSpan = nights;

  return (
    <div
      className={cn(
        'absolute inset-1 rounded px-2 py-1 text-white text-xs font-medium cursor-pointer transition-colors z-10 flex flex-col justify-center',
        paymentStatusColors[booking.paymentStatus]
      )}
      style={{
        gridColumn: `span ${gridColumnSpan}`,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      <div className="truncate">{booking.guest.name}</div>
      <div className="text-[10px] opacity-90">R$ {booking.pricing.total.toFixed(2)}</div>
    </div>
  );
}
