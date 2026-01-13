import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { useAddPayment } from '@/features/bookings/api/bookings-api';
import { formatCurrency } from '@/lib/booking-utils';
import type { Booking, PaymentMethod } from '@/types';

const paymentSchema = z.object({
  amount: z.coerce.number().min(0.01, 'Valor deve ser maior que zero'),
  method: z.enum(['cash', 'pix', 'debit_card', 'credit_card', 'bank_transfer']),
  date: z.date({ required_error: 'Data é obrigatória' }),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface AddPaymentDialogProps {
  open: boolean;
  onClose: () => void;
  booking?: Booking;
}

const paymentMethods: { value: PaymentMethod; label: string }[] = [
  { value: 'pix', label: 'PIX' },
  { value: 'cash', label: 'Dinheiro' },
  { value: 'debit_card', label: 'Cartão de Débito' },
  { value: 'credit_card', label: 'Cartão de Crédito' },
  { value: 'bank_transfer', label: 'Transferência Bancária' },
];

export function AddPaymentDialog({ open, onClose, booking }: AddPaymentDialogProps) {
  const addPaymentMutation = useAddPayment();

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: 0,
      method: 'pix',
      date: new Date(),
    },
  });

  if (!booking) return null;

  const balanceDue = booking.total_value - booking.paid_value;

  const handleQuickFill = () => {
    form.setValue('amount', balanceDue);
  };

  const onSubmit = async (data: PaymentFormData) => {
    try {
      await addPaymentMutation.mutateAsync({
        id: booking.id,
        amount: data.amount,
        method: data.method,
        date: format(data.date, 'yyyy-MM-dd'),
      });
      onClose();
      form.reset();
    } catch (error) {
      console.error('Erro ao adicionar pagamento:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Pagamento</DialogTitle>
          <DialogDescription>
            Registre um novo pagamento para esta reserva
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4 rounded-lg bg-gray-50 p-4">
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-gray-600">Valor Total:</span>
            <span className="font-medium">{formatCurrency(booking.total_value)}</span>
          </div>
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-gray-600">Já Pago:</span>
            <span className="font-medium text-green-600">{formatCurrency(booking.paid_value)}</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="font-semibold">Saldo Devedor:</span>
            <span className="font-bold text-red-600">{formatCurrency(balanceDue)}</span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor do Pagamento</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleQuickFill}
                    >
                      Total
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Forma de Pagamento</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data do Pagamento</FormLabel>
                  <FormControl>
                    <DatePicker
                      date={field.value}
                      onSelect={field.onChange}
                      placeholder="Selecione a data"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={addPaymentMutation.isPending}>
                {addPaymentMutation.isPending ? 'Salvando...' : 'Adicionar Pagamento'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
