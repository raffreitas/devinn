import { useQuery } from "@tanstack/react-query";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isToday,
  parseISO,
  startOfMonth,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { roomService } from "@/features/inventory/services/room-service";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { useAuth } from "@/shared/contexts/auth-context";
import { cn } from "@/shared/lib/utils";
import { BookingFormDialog } from "../components/booking-form-dialog";
import { ReservationBar } from "../components/reservation-bar";
import { bookingService } from "../services/booking-service";
import type {
  Booking,
  CreateBookingRequest,
  UpdateBookingRequest,
} from "../types";

export function CalendarPage() {
  const { innId } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [preselectedRoom, setPreselectedRoom] = useState<string | undefined>();
  const [preselectedDate, setPreselectedDate] = useState<Date | undefined>();
  const [editingBooking, setEditingBooking] = useState<Booking | undefined>();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  // use flexible columns for days so the month fills the available space

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Reservas
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visualize e gerencie as reservas da sua pousada em um calendário
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={handleToday} className="min-w-30">
            {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
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
            <div className="overflow-x-auto">
              <div className="max-w-xs">
                <div className="flex">
                  <div className="w-28 shrink-0 p-3 font-semibold text-sm text-foreground border-r border-border border-b bg-muted/30 sticky top-0 z-10">
                    Quartos
                  </div>
                  <div className="flex">
                    {daysInMonth.map((day) => (
                      <div
                        key={day.toISOString()}
                        className={cn(
                          "border-r p-2 text-center text-xs font-medium w-15 border-b border-border bg-muted/30",
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

                {activeRooms.map((room) => {
                  const roomBookings = bookings
                    ? bookings.filter(
                        (b) => b.roomId === room.id && b.status !== "Canceled",
                      )
                    : [];
                  return (
                    <div key={room.id} className="flex border-b border-border">
                      <div className="w-28 shrink-0 p-3 flex items-center border-r border-border">
                        <div>
                          <div className="font-medium text-sm">
                            {room.number}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {room.categoryName}
                          </div>
                        </div>
                      </div>

                      <div className="flex relative flex-1">
                        {daysInMonth.map((day) => {
                          const booking = getBookingsForRoomAndDate(
                            room.id,
                            day,
                          );
                          return (
                            <div
                              key={`${room.id}-${day.toISOString()}`}
                              className={cn(
                                "border-r p-1 relative h-15 w-15 cursor-pointer hover:bg-accent/50 transition-colors",
                                isToday(day) && "bg-primary/5",
                              )}
                              onClick={() =>
                                !booking && handleCellClick(room.id, day)
                              }
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

                        {roomBookings.map((booking) => {
                          const checkIn = parseISO(booking.checkIn);
                          const checkOut = parseISO(booking.checkOut);

                          if (checkOut < monthStart || checkIn > monthEnd)
                            return null;

                          const startDay =
                            checkIn < monthStart ? 1 : checkIn.getDate();
                          const endDay =
                            checkOut > monthEnd
                              ? daysInMonth.length
                              : checkOut.getDate() - 1;

                          const totalDays = daysInMonth.length;
                          const leftPercent =
                            ((startDay - 1) / totalDays) * 100;
                          const widthPercent =
                            ((endDay - startDay + 1) / totalDays) * 100;

                          return (
                            <ReservationBar
                              key={booking.id}
                              booking={booking}
                              onClick={() => handleBookingClick(booking)}
                              left={`${leftPercent}%`}
                              width={`${widthPercent}%`}
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
