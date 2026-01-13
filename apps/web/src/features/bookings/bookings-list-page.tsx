import { useState, useMemo } from 'react';
import { useBookings } from '@/features/bookings/api/bookings-api';
import { useRooms } from '@/features/rooms/api/rooms-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Calendar, User, Phone, DollarSign } from 'lucide-react';
import { BookingDialog } from './components/booking-dialog';
import { BookingDetailsDialog } from './components/booking-details-dialog';
import {
  formatCurrency,
  formatDateShort,
  calculateBookingStatus,
  calculatePaymentStatus,
  getBookingStatusLabel,
  getPaymentStatusLabel,
  getBookingStatusColor,
  getPaymentStatusColor,
} from '@/lib/booking-utils';
import type { Booking, BookingStatus } from '@/types';

export function BookingsListPage() {
  const { data: bookings = [], isLoading } = useBookings();
  const { data: rooms = [] } = useRooms();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | undefined>();
  const [filterStatus, setFilterStatus] = useState<'all' | BookingStatus>('all');

  const bookingsWithStatus = useMemo(() => {
    return bookings.map(booking => {
      const status = calculateBookingStatus(
        booking.check_in,
        booking.check_out,
        booking.cancellation_status
      );
      const paymentStatus = calculatePaymentStatus(booking.total_value, booking.paid_value);
      const room = rooms.find(r => r.id === booking.room_id);

      return {
        ...booking,
        booking_status: status,
        payment_status: paymentStatus,
        room,
        balance_due: booking.total_value - booking.paid_value,
      };
    });
  }, [bookings, rooms]);

  const filteredBookings = useMemo(() => {
    if (filterStatus === 'all') {
      return bookingsWithStatus;
    }
    return bookingsWithStatus.filter(b => b.booking_status === filterStatus);
  }, [bookingsWithStatus, filterStatus]);

  const sortedBookings = useMemo(() => {
    return [...filteredBookings].sort((a, b) => {
      return new Date(a.check_in).getTime() - new Date(b.check_in).getTime();
    });
  }, [filteredBookings]);

  const stats = useMemo(() => {
    return {
      total: bookingsWithStatus.length,
      scheduled: bookingsWithStatus.filter(b => b.booking_status === 'scheduled').length,
      checked_in: bookingsWithStatus.filter(b => b.booking_status === 'checked_in').length,
      completed: bookingsWithStatus.filter(b => b.booking_status === 'completed').length,
      cancelled: bookingsWithStatus.filter(b => b.booking_status === 'cancelled').length,
    };
  }, [bookingsWithStatus]);

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setDetailsDialogOpen(true);
  };

  const handleCloseDetailsDialog = () => {
    setDetailsDialogOpen(false);
    setSelectedBooking(undefined);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reservas</h1>
          <p className="mt-2 text-gray-600">
            Gerencie todas as reservas da sua pousada
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Reserva
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{stats.total}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{stats.scheduled}</p>
              <p className="text-sm text-gray-600">Agendadas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{stats.checked_in}</p>
              <p className="text-sm text-gray-600">Hospedados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-600">{stats.completed}</p>
              <p className="text-sm text-gray-600">Concluídas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">{stats.cancelled}</p>
              <p className="text-sm text-gray-600">Canceladas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Tabs value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="scheduled">Agendadas</TabsTrigger>
          <TabsTrigger value="checked_in">Hospedados</TabsTrigger>
          <TabsTrigger value="completed">Concluídas</TabsTrigger>
          <TabsTrigger value="cancelled">Canceladas</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* List */}
      {sortedBookings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="mb-4 h-12 w-12 text-gray-400" />
            <p className="text-lg font-medium">Nenhuma reserva encontrada</p>
            <p className="mb-4 text-sm text-gray-500">
              {filterStatus === 'all'
                ? 'Comece criando uma nova reserva'
                : 'Não há reservas com este status'}
            </p>
            {filterStatus === 'all' && (
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeira Reserva
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedBookings.map((booking) => (
            <Card
              key={booking.id}
              className="cursor-pointer transition-colors hover:bg-gray-50"
              onClick={() => handleViewDetails(booking)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{booking.guest_name}</h3>
                      <Badge className={getBookingStatusColor(booking.booking_status!)}>
                        {getBookingStatusLabel(booking.booking_status!)}
                      </Badge>
                      <Badge variant={getPaymentStatusColor(booking.payment_status!) as any}>
                        {getPaymentStatusLabel(booking.payment_status!)}
                      </Badge>
                      {booking.source !== 'manual' && (
                        <Badge variant="outline">{booking.source}</Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 md:grid-cols-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{booking.room?.name || `Quarto ${booking.room?.number}`}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {formatDateShort(booking.check_in)} - {formatDateShort(booking.check_out)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{booking.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-medium">{formatCurrency(booking.total_value)}</span>
                      </div>
                    </div>

                    {booking.balance_due! > 0 && (
                      <div className="mt-2 text-sm">
                        <span className="text-gray-600">Saldo devedor: </span>
                        <span className="font-semibold text-red-600">
                          {formatCurrency(booking.balance_due!)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <BookingDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />

      <BookingDetailsDialog
        open={detailsDialogOpen}
        onClose={handleCloseDetailsDialog}
        booking={selectedBooking}
      />
    </div>
  );
}
