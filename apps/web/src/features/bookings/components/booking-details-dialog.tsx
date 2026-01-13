import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Pencil, DollarSign, XCircle, Calendar, User, Phone, Mail, FileText } from 'lucide-react';
import { useAddPayment, useCancelBooking } from '@/features/bookings/api/bookings-api';
import { BookingDialog } from './booking-dialog';
import { AddPaymentDialog } from './add-payment-dialog';
import {
  formatCurrency,
  formatDate,
  calculateBookingStatus,
  calculatePaymentStatus,
  calculateNights,
  getBookingStatusLabel,
  getPaymentStatusLabel,
  getBookingStatusColor,
  getPaymentStatusColor,
} from '@/lib/booking-utils';
import type { Booking } from '@/types';

interface BookingDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  booking?: Booking;
}

export function BookingDetailsDialog({ open, onClose, booking }: BookingDetailsDialogProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const cancelMutation = useCancelBooking();

  if (!booking) return null;

  const bookingStatus = calculateBookingStatus(
    booking.check_in,
    booking.check_out,
    booking.cancellation_status
  );
  const paymentStatus = calculatePaymentStatus(booking.total_value, booking.paid_value);
  const nights = calculateNights(booking.check_in, booking.check_out);
  const balanceDue = booking.total_value - booking.paid_value;

  const handleCancel = async () => {
    const fee = prompt('Valor da multa por cancelamento (deixe em branco para sem multa):');
    if (fee === null) return;

    const cancellation_fee = fee ? parseFloat(fee) : 0;

    if (window.confirm('Tem certeza que deseja cancelar esta reserva?')) {
      try {
        await cancelMutation.mutateAsync({ id: booking.id, cancellation_fee });
        onClose();
      } catch (error) {
        console.error('Erro ao cancelar reserva:', error);
      }
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="text-2xl">{booking.guest_name}</DialogTitle>
                <DialogDescription>Detalhes completos da reserva</DialogDescription>
              </div>
              <div className="flex gap-2">
                <Badge className={getBookingStatusColor(bookingStatus)}>
                  {getBookingStatusLabel(bookingStatus)}
                </Badge>
                <Badge variant={getPaymentStatusColor(paymentStatus) as any}>
                  {getPaymentStatusLabel(paymentStatus)}
                </Badge>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Informações do Hóspede */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                  <User className="h-5 w-5" />
                  Informações do Hóspede
                </h3>
                <div className="grid gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Telefone:</span>
                    <span className="font-medium">{booking.phone}</span>
                  </div>
                  {booking.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{booking.email}</span>
                    </div>
                  )}
                  {booking.document && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">CPF:</span>
                      <span className="font-medium">{booking.document}</span>
                    </div>
                  )}
                  {booking.birth_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">Data de Nascimento:</span>
                      <span className="font-medium">{formatDate(booking.birth_date)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Detalhes da Estadia */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                  <Calendar className="h-5 w-5" />
                  Detalhes da Estadia
                </h3>
                <div className="grid gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quarto:</span>
                    <span className="font-medium">
                      {booking.room?.name || `Quarto ${booking.room?.number}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-in:</span>
                    <span className="font-medium">{formatDate(booking.check_in)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-out:</span>
                    <span className="font-medium">{formatDate(booking.check_out)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Noites:</span>
                    <span className="font-medium">{nights}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-gray-600">Adultos:</span>
                    <span className="font-medium">{booking.adults}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Crianças:</span>
                    <span className="font-medium">{booking.children}</span>
                  </div>
                  {booking.ages_text && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Idades:</span>
                      <span className="font-medium">{booking.ages_text}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Informações Financeiras */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                  <DollarSign className="h-5 w-5" />
                  Informações Financeiras
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Valor Total:</span>
                    <span className="font-medium">{formatCurrency(booking.total_value)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Valor Pago:</span>
                    <span className="font-medium text-green-600">{formatCurrency(booking.paid_value)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Saldo Devedor:</span>
                    <span className={balanceDue > 0 ? 'text-red-600' : 'text-green-600'}>
                      {formatCurrency(balanceDue)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Observações */}
            {booking.notes && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="mb-2 text-lg font-semibold">Observações</h3>
                  <p className="whitespace-pre-wrap text-sm text-gray-700">{booking.notes}</p>
                </CardContent>
              </Card>
            )}

            {/* Ações */}
            <div className="flex justify-between gap-2">
              <div>
                {bookingStatus !== 'cancelled' && (
                  <Button
                    variant="destructive"
                    onClick={handleCancel}
                    disabled={cancelMutation.isPending}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    {cancelMutation.isPending ? 'Cancelando...' : 'Cancelar Reserva'}
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                {paymentStatus !== 'paid' && bookingStatus !== 'cancelled' && (
                  <Button variant="outline" onClick={() => setPaymentDialogOpen(true)}>
                    <DollarSign className="mr-2 h-4 w-4" />
                    Adicionar Pagamento
                  </Button>
                )}
                {bookingStatus !== 'cancelled' && (
                  <Button onClick={() => setEditDialogOpen(true)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BookingDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        booking={booking}
      />

      <AddPaymentDialog
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        booking={booking}
      />
    </>
  );
}
