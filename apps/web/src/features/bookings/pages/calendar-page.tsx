import { useQuery } from "@tanstack/react-query";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  addMonths,
  subMonths,
  isToday,
  parseISO,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { useTenant } from "@/shared/contexts/tenant-context";
import { roomService } from "@/features/inventory/services/room-service";
import { bookingService } from "../services/booking-service";
import { ReservationBar } from "../components/reservation-bar";
import { BookingFormDialog } from "../components/booking-form-dialog";
import type { Booking, CreateBookingRequest, UpdateBookingRequest } from "../types";
import { cn } from "@/shared/lib/utils";
import { toast } from "sonner";

export function CalendarPage() {
  const { innId } = useTenant();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [preselectedRoom, setPreselectedRoom] = useState<string | undefined>();
  const [preselectedDate, setPreselectedDate] = useState<Date | undefined>();
  const [editingBooking, setEditingBooking] = useState<Booking | undefined>();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const dayWidth = 46; // fixed day cell width (px) used to position booking bars


  const { data: roomsData } = useQuery({
    queryKey: ["rooms"],
    queryFn: () => roomService.getAll(),
  });

  const { data: bookings, refetch } = useQuery({
    queryKey: ["bookings", innId, currentMonth],
    queryFn: () => {
      if (!innId) return [];
      return bookingService.getAll({
        startDate: format(monthStart, "yyyy-MM-dd"),
        endDate: format(monthEnd, "yyyy-MM-dd"),
      });
    },
    enabled: !!innId,
  });

  const handlePreviousMonth = () => {
    setCurrentMonth((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  };

  const handleToday = () => {
    setCurrentMonth(new Date());
  };

  const handleCellClick = (roomId: string, date: Date) => {
    // Check if date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      toast.error("Não é possível criar reservas em datas passadas");
      return;
    }

    setPreselectedRoom(roomId);
    setPreselectedDate(date);
    setFormDialogOpen(true);
  };

  const handleBookingClick = (booking: Booking) => {
    // Open booking in edit mode
    setEditingBooking(booking);
    setPreselectedRoom(booking.roomId);
    setPreselectedDate(new Date(booking.checkIn));
    setFormDialogOpen(true);
  };

  const handleCreate = async (data: CreateBookingRequest) => {
    if (!innId) return;

    const room = roomsData?.items.find((r) => r.id === data.roomId);
    if (!room) {
      toast.error("Quarto não encontrado");
      return;
    }

    try {
      await bookingService.create(data);

      toast.success("Reserva criada com sucesso");
      setFormDialogOpen(false);
      refetch();
    } catch (error) {
      toast.error((error as Error).message || "Erro ao criar reserva");
    }
  };

  const handleUpdate = async (id: string, data: UpdateBookingRequest) => {
    try {
      await bookingService.update(id, data);

      toast.success("Reserva atualizada com sucesso");
      setFormDialogOpen(false);
      setEditingBooking(undefined);
      refetch();
    } catch (error) {
      toast.error((error as Error).message || "Erro ao atualizar reserva");
    }
  };

  const getBookingsForRoomAndDate = (
    roomId: string,
    date: Date,
  ): Booking | undefined => {
    if (!bookings) return undefined;

    return bookings.find((booking) => {
      if (booking.roomId !== roomId) return false;
      if (booking.status === "Canceled") return false;

      const checkIn = parseISO(booking.checkIn);
      const checkOut = parseISO(booking.checkOut);

      return date >= checkIn && date < checkOut;
    });
  };



  if (!innId) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">
          Selecione uma pousada para continuar
        </p>
      </div>
    );
  }

  const activeRooms =
    roomsData?.items.filter((room) => room.status === "Active") || [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Calendário de Reservas</CardTitle>
              <CardDescription>
                Visualização mensal das reservas por quarto
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePreviousMonth}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={handleToday}
                className="min-w-30"
              >
                {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
              </Button>
              <Button variant="outline" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-6 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <div
                className="grid"
                style={{
                  gridTemplateColumns: "120px 1fr",
                }}
              >
                {/* Header Row - Days */}
                <div className="sticky left-0 bg-background border-b border-r p-2 font-medium text-sm z-10">
                  Quarto
                </div>
                <div className="border-b" style={{ minWidth: `${daysInMonth.length * dayWidth}px` }}>
                  <div
                    className="grid"
                    style={{
                      gridTemplateColumns: `repeat(${daysInMonth.length}, ${dayWidth}px)`,
                    }}
                  >
                    {daysInMonth.map((day) => (
                      <div
                        key={day.toISOString()}
                        className={cn(
                          "border-b border-r p-2 text-center text-xs font-medium w-11.5",
                          isToday(day) && "bg-primary/10",
                        )}
                      >
                        <div>{format(day, "d")}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {format(day, "EEE", { locale: ptBR })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Room Rows */}
                {activeRooms.map((room) => {
                  const roomBookings = bookings
                    ? bookings.filter((b) => b.roomId === room.id && b.status !== "Canceled")
                    : [];

                  return (
                    <div key={room.id} className="contents">
                      <div className="sticky left-0 bg-background border-b border-r p-2 flex items-center z-10">
                        <div>
                          <div className="font-medium text-sm">{room.number}</div>
                          <div className="text-xs text-muted-foreground">
                            {room.categoryName}
                          </div>
                        </div>
                      </div>

                      <div className="border-b relative" style={{ minWidth: `${daysInMonth.length * dayWidth}px` }}>
                        <div className="grid" style={{ gridTemplateColumns: `repeat(${daysInMonth.length}, ${dayWidth}px)` }}>
                          {daysInMonth.map((day) => {
                            const booking = getBookingsForRoomAndDate(room.id, day);

                            return (
                              <div
                                key={`${room.id}-${day.toISOString()}`}
                                className={cn(
                                  "border-r p-1 relative min-h-15 cursor-pointer hover:bg-accent/50 w-11.5 h-14",
                                  isToday(day) && "bg-primary/5",
                                )}
                                onClick={() => !booking && handleCellClick(room.id, day)}
                                title={`Quarto ${room.number} - ${format(day, "dd/MM/yyyy")}`}
                              >
                                {!booking && (
                                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                    <Plus className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Booking bars overlay */}
                        {roomBookings.map((booking) => {
                          const checkIn = parseISO(booking.checkIn);
                          const checkOut = parseISO(booking.checkOut);

                          // Skip bookings fully outside the month
                          if (checkOut < monthStart || checkIn > monthEnd) return null;

                          const startDay = checkIn < monthStart ? 1 : checkIn.getDate();
                          const endDay = checkOut > monthEnd ? daysInMonth.length : checkOut.getDate() - 1;

                          const left = (startDay - 1) * dayWidth + 4;
                          const width = (endDay - startDay + 1) * dayWidth - 8;

                          return (
                            <ReservationBar
                              key={booking.id}
                              booking={booking}
                              onClick={() => handleBookingClick(booking)}
                              left={left}
                              width={width}
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

          {activeRooms.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground">
                Nenhum quarto ativo cadastrado. Cadastre quartos para começar a
                usar o calendário.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <BookingFormDialog
        open={formDialogOpen}
        onOpenChange={(open) => {
          setFormDialogOpen(open);
          if (!open) {
            setEditingBooking(undefined);
            setPreselectedRoom(undefined);
            setPreselectedDate(undefined);
          }
        }}
        onSubmit={handleCreate}
        onUpdate={handleUpdate}
        booking={editingBooking}
        preselectedRoom={preselectedRoom}
        preselectedDate={preselectedDate}
      />
    </div>
  );
}
