import { differenceInCalendarDays, format, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus } from "lucide-react";
import type { Room } from "@/features/inventory/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";
import type { Booking } from "../types";
import { ReservationBar } from "./reservation-bar";

interface CalendarGridProps {
  days: Date[];
  rooms: Room[];
  bookings: Booking[];
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  onCellClick: (roomId: string, date: Date) => void;
  onBookingClick: (booking: Booking) => void;
  onBookingEdit: (booking: Booking) => void;
}

function getBarPosition(booking: Booking, days: Date[]) {
  const firstDay = days[0];
  const lastDay = days[days.length - 1];
  const totalDays = days.length;

  const checkIn = booking.checkIn;
  const checkOut = booking.checkOut;

  if (checkOut <= firstDay || checkIn > lastDay) return null;

  // Last night of the booking (checkOut is the departure day, exclusive)
  const lastNight = new Date(
    checkOut.getFullYear(),
    checkOut.getMonth(),
    checkOut.getDate() - 1,
  );

  const visibleStart = checkIn < firstDay ? firstDay : checkIn;
  const visibleEnd = lastNight > lastDay ? lastDay : lastNight;

  const startIdx = differenceInCalendarDays(visibleStart, firstDay);
  const endIdx = differenceInCalendarDays(visibleEnd, firstDay);

  if (startIdx > endIdx) return null;

  return {
    left: `${(startIdx / totalDays) * 100}%`,
    width: `${((endIdx - startIdx + 1) / totalDays) * 100}%`,
  };
}

export function CalendarGrid({
  days,
  rooms,
  bookings,
  scrollContainerRef,
  onCellClick,
  onBookingClick,
  onBookingEdit,
}: CalendarGridProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Calendário de Reservas</CardTitle>
            <CardDescription>
              Visualize as reservas por quarto e data
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden">
          <div
            ref={scrollContainerRef}
            className="overflow-auto max-h-[68.8vh]"
          >
            <div className="inline-block min-w-full">
              {/* Header row */}
              <div className="flex sticky top-0 z-20">
                <div className="w-20 sm:w-28 shrink-0 p-3 font-semibold text-xs sm:text-sm whitespace-nowrap text-foreground border-r border-border border-b bg-muted sticky top-0 z-30 left-0">
                  Quartos
                </div>
                <div className="flex flex-1">
                  {days.map((day) => (
                    <div
                      key={day.toISOString()}
                      {...(isToday(day) ? { "data-today": "" } : {})}
                      className={cn(
                        "border-r p-2 text-center text-xs font-medium flex-1 min-w-9 border-b border-border bg-muted",
                        isToday(day) && "bg-primary/10",
                      )}
                    >
                      <div className="font-semibold">{format(day, "d")}</div>
                      <div className="text-[10px] text-muted-foreground uppercase">
                        {format(day, "EEE", { locale: ptBR })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Room rows */}
              {rooms.map((room) => {
                const roomBookings = bookings.filter(
                  (b) => b.roomId === room.id && b.status !== "Canceled",
                );

                return (
                  <div key={room.id} className="flex min-h-14 border-b border-border">
                    <div className="w-20 sm:w-28 shrink-0 h-14 p-3 flex items-center border-r border-border sticky left-0 z-10 bg-muted truncate">
                      <div>
                        <div className="font-medium text-sm">{room.number}</div>
                        <div className="text-xs text-muted-foreground hidden sm:block">
                          {room.categoryName}
                        </div>
                      </div>
                    </div>

                    <div className="flex relative flex-1 h-14">
                      {days.map((day) => {
                        const hasBooking = roomBookings.some(
                          (b) => day >= b.checkIn && day < b.checkOut,
                        );
                        return (
                          <button
                            type="button"
                            key={`${room.id}-${day.toISOString()}`}
                            className={cn(
                              "border-r p-1 relative h-14 flex-1 min-w-9 cursor-pointer hover:bg-accent/50 transition-colors",
                              isToday(day) && "bg-primary/5",
                            )}
                            onClick={() =>
                              !hasBooking && onCellClick(room.id, day)
                            }
                            title={`Quarto ${room.number} - ${format(day, "dd/MM/yyyy")}`}
                          >
                            {!hasBooking && (
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                <Plus className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                          </button>
                        );
                      })}

                      {roomBookings.map((booking) => {
                        const pos = getBarPosition(booking, days);
                        if (!pos) return null;
                        return (
                          <ReservationBar
                            key={booking.id}
                            booking={booking}
                            onClick={() => onBookingClick(booking)}
                            onEdit={() => onBookingEdit(booking)}
                            left={pos.left}
                            width={pos.width}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {rooms.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">
              Nenhum quarto ativo cadastrado. Cadastre quartos para começar a
              usar o calendário.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
