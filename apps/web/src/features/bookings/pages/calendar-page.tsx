import { useQuery } from "@tanstack/react-query";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  addMonths,
  subMonths,
  isToday,
  isSameDay,
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
import type { Booking, CreateBookingRequest } from "../types";
import { cn } from "@/shared/lib/utils";
import { toast } from "sonner";

export function CalendarPage() {
  const { innId } = useTenant();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [preselectedRoom, setPreselectedRoom] = useState<string | undefined>();
  const [preselectedDate, setPreselectedDate] = useState<Date | undefined>();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

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
    // Open details dialog (to be implemented)
    console.log("Booking clicked:", booking);
  };

  const handleSubmit = async (data: CreateBookingRequest) => {
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

  const getBookingsForRoomAndDate = (
    roomId: string,
    date: Date,
  ): Booking | undefined => {
    if (!bookings) return undefined;

    return bookings.find((booking) => {
      if (booking.roomId !== roomId) return false;
      if (booking.status === "cancelled") return false;

      const checkIn = parseISO(booking.checkIn);
      const checkOut = parseISO(booking.checkOut);

      return date >= checkIn && date < checkOut;
    });
  };

  const isBookingStart = (booking: Booking, date: Date): boolean => {
    const checkIn = parseISO(booking.checkIn);
    return isSameDay(checkIn, date);
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
                  gridTemplateColumns:
                    "120px repeat(auto-fit, minmax(40px, 1fr))",
                }}
              >
                {/* Header Row - Days */}
                <div className="sticky left-0 bg-background border-b border-r p-2 font-medium text-sm z-10">
                  Quarto
                </div>
                {daysInMonth.map((day) => (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      "border-b border-r p-2 text-center text-xs font-medium",
                      isToday(day) && "bg-primary/10",
                    )}
                  >
                    <div>{format(day, "d")}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {format(day, "EEE", { locale: ptBR })}
                    </div>
                  </div>
                ))}

                {/* Room Rows */}
                {activeRooms.map((room) => (
                  <div key={room.id} className="contents">
                    <div className="sticky left-0 bg-background border-b border-r p-2 flex items-center z-10">
                      <div>
                        <div className="font-medium text-sm">
                          {room.number}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {room.categoryName}
                        </div>
                      </div>
                    </div>
                    {daysInMonth.map((day) => {
                      const booking = getBookingsForRoomAndDate(room.id, day);
                      const isStart = booking
                        ? isBookingStart(booking, day)
                        : false;

                      return (
                        <div
                          key={`${room.id}-${day.toISOString()}`}
                          className={cn(
                            "border-b border-r p-1 relative min-h-15 cursor-pointer hover:bg-accent/50",
                            isToday(day) && "bg-primary/5",
                          )}
                          onClick={() =>
                            !booking && handleCellClick(room.id, day)
                          }
                        >
                          {booking && isStart && (
                            <ReservationBar
                              booking={booking}
                              onClick={() => handleBookingClick(booking)}
                            />
                          )}
                          {!booking && (
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                              <Plus className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
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
        onOpenChange={setFormDialogOpen}
        onSubmit={handleSubmit}
        preselectedRoom={preselectedRoom}
        preselectedDate={preselectedDate}
      />
    </div>
  );
}
