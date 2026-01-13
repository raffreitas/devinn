import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isToday, isWeekend, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useBookings } from '@/features/bookings/api/bookings-api';
import { useRooms } from '@/features/rooms/api/rooms-api';
import { BookingDialog } from '@/features/bookings/components/booking-dialog';
import { BookingDetailsDialog } from '@/features/bookings/components/booking-details-dialog';
import { cn } from '@/lib/utils';
import { calculateBookingStatus, calculatePaymentStatus, formatCurrency } from '@/lib/booking-utils';
import type { Booking, Room } from '@/types';

interface BookingBar {
  booking: Booking;
  room: Room;
  startDay: number;
  duration: number;
  status: string;
  paymentStatus: string;
}

export function AvailabilityMapPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState<Booking | undefined>();
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [newBookingDialogOpen, setNewBookingDialogOpen] = useState(false);
  const [preselectedRoom, setPreselectedRoom] = useState<string | undefined>();
  const [preselectedDate, setPreselectedDate] = useState<Date | undefined>();

  const { data: bookings = [] } = useBookings();
  const { data: rooms = [] } = useRooms();

  const activeRooms = useMemo(() => {
    return rooms.filter(r => r.status === 'active').sort((a, b) => a.number - b.number);
  }, [rooms]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const bookingBars = useMemo(() => {
    const bars: BookingBar[] = [];

    bookings.forEach(booking => {
      const room = rooms.find(r => r.id === booking.room_id);
      if (!room) return;

      const checkIn = new Date(booking.check_in);
      const checkOut = new Date(booking.check_out);

      // Verificar se a reserva está no mês atual
      if (checkOut < monthStart || checkIn > monthEnd) return;

      // Calcular posição e duração
      const startDay = checkIn < monthStart ? 0 : Math.floor((checkIn.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24));
      const endDay = checkOut > monthEnd ? daysInMonth.length - 1 : Math.floor((checkOut.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24));
      const duration = endDay - startDay + 1;

      const bookingStatus = calculateBookingStatus(booking.check_in, booking.check_out, booking.cancellation_status);
      const paymentStatus = calculatePaymentStatus(booking.total_value, booking.paid_value);

      bars.push({
        booking,
        room,
        startDay,
        duration,
        status: bookingStatus,
        paymentStatus,
      });
    });

    return bars;
  }, [bookings, rooms, monthStart, monthEnd, daysInMonth.length]);

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleToday = () => {
    setCurrentMonth(new Date());
  };

  const handleCellClick = (room: Room, date: Date) => {
    // Verificar se já existe reserva neste dia para este quarto
    const existingBooking = bookings.find(b => {
      if (b.room_id !== room.id) return false;
      const checkIn = new Date(b.check_in);
      const checkOut = new Date(b.check_out);
      return date >= checkIn && date < checkOut;
    });

    if (existingBooking) {
      setSelectedBooking(existingBooking);
      setDetailsDialogOpen(true);
    } else {
      setPreselectedRoom(room.id);
      setPreselectedDate(date);
      setNewBookingDialogOpen(true);
    }
  };

  const handleBarClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setDetailsDialogOpen(true);
  };

  const getPaymentColor = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'paid':
        return 'bg-green-500 hover:bg-green-600';
      case 'partial':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'pending':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const handleCloseNewBookingDialog = () => {
    setNewBookingDialogOpen(false);
    setPreselectedRoom(undefined);
    setPreselectedDate(undefined);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mapa de Disponibilidade</h1>
          <p className="mt-2 text-gray-600">
            Visualize e gerencie as reservas em formato de calendário
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleToday}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            Hoje
          </Button>
          <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-[200px] text-center font-semibold">
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </div>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Legend */}
      <Card className="mb-4 p-4">
        <div className="flex items-center gap-6 text-sm">
          <span className="font-semibold">Legenda:</span>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-green-500" />
            <span>Pago</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-yellow-500" />
            <span>Parcial</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-red-500" />
            <span>Pendente</span>
          </div>
        </div>
      </Card>

      {/* Gantt Chart */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[1200px]">
            {/* Header with days */}
            <div className="flex border-b bg-gray-50">
              <div className="sticky left-0 z-10 w-40 shrink-0 border-r bg-gray-50 p-3 font-semibold">
                Quarto
              </div>
              <div className="flex flex-1">
                {daysInMonth.map((day, idx) => {
                  const today = isToday(day);
                  const weekend = isWeekend(day);

                  return (
                    <div
                      key={idx}
                      className={cn(
                        'flex flex-1 flex-col items-center justify-center border-r p-2 text-xs',
                        weekend && 'bg-blue-50',
                        today && 'bg-primary text-primary-foreground font-bold'
                      )}
                    >
                      <div>{format(day, 'EEE', { locale: ptBR })}</div>
                      <div className="text-lg font-semibold">{format(day, 'd')}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rooms rows */}
            {activeRooms.map((room) => {
              const roomBookings = bookingBars.filter(b => b.room.id === room.id);

              return (
                <div key={room.id} className="flex border-b hover:bg-gray-50">
                  {/* Room info */}
                  <div className="sticky left-0 z-10 w-40 shrink-0 border-r bg-white p-3">
                    <div className="font-medium">{room.name || `Quarto ${room.number}`}</div>
                    <div className="text-xs text-gray-500">{room.category?.name}</div>
                  </div>

                  {/* Days grid */}
                  <div className="relative flex flex-1">
                    {daysInMonth.map((day, idx) => {
                      const weekend = isWeekend(day);
                      
                      return (
                        <div
                          key={idx}
                          className={cn(
                            'flex-1 border-r p-1 cursor-pointer hover:bg-gray-100 transition-colors',
                            weekend && 'bg-blue-50'
                          )}
                          style={{ minHeight: '60px' }}
                          onClick={() => handleCellClick(room, day)}
                        />
                      );
                    })}

                    {/* Booking bars */}
                    {roomBookings.map((bar, idx) => {
                      const cellWidth = 100 / daysInMonth.length;
                      const left = bar.startDay * cellWidth;
                      const width = bar.duration * cellWidth;

                      return (
                        <div
                          key={idx}
                          className={cn(
                            'absolute top-1 rounded px-2 py-1 text-xs text-white cursor-pointer transition-all',
                            getPaymentColor(bar.paymentStatus)
                          )}
                          style={{
                            left: `${left}%`,
                            width: `${width}%`,
                            height: 'calc(100% - 8px)',
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBarClick(bar.booking);
                          }}
                          title={`${bar.booking.guest_name} - ${formatCurrency(bar.booking.total_value)}`}
                        >
                          <div className="truncate font-medium">
                            {bar.booking.guest_name}
                          </div>
                          <div className="text-xs opacity-90">
                            {formatCurrency(bar.booking.total_value)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {activeRooms.length === 0 && (
              <div className="p-12 text-center text-gray-500">
                Nenhum quarto ativo cadastrado
              </div>
            )}
          </div>
        </div>
      </Card>

      <BookingDialog
        open={newBookingDialogOpen}
        onClose={handleCloseNewBookingDialog}
        preselectedRoomId={preselectedRoom}
        preselectedDate={preselectedDate}
      />

      <BookingDetailsDialog
        open={detailsDialogOpen}
        onClose={() => {
          setDetailsDialogOpen(false);
          setSelectedBooking(undefined);
        }}
        booking={selectedBooking}
      />
    </div>
  );
}
