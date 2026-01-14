import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import type { Booking, PaymentMethod } from '@/features/bookings/types';

const paymentSchema = z.object({
  amount: z
    .number({ error: 'Valor é obrigatório' })
    .positive('Valor deve ser maior que 0'),
  method: z.enum(['pix', 'cash', 'credit_card', 'debit_card'], {
    error: 'Método de pagamento é obrigatório',
  }),
  notes: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentRegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (amount: number, method: PaymentMethod, notes?: string) => Promise<void>;
  booking: Booking;
}

export function PaymentRegistrationDialog({
  open,
  onOpenChange,
  onSubmit,
  booking,
}: PaymentRegistrationDialogProps) {
  const remainingAmount = booking.pricing.total - booking.totalPaid;

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: remainingAmount,
      method: 'pix',
      notes: '',
    },
  });

  const handleSubmit = async (data: PaymentFormData) => {
    await onSubmit(data.amount, data.method, data.notes);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Registrar Pagamento</DialogTitle>
          <DialogDescription>
            Adicione um novo pagamento para a reserva de {booking.guest.name}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Valor total:</span>
            <span className="font-medium">R$ {booking.pricing.total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Já pago:</span>
            <span className="text-green-600 font-medium">
              R$ {booking.totalPaid.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t">
            <span className="text-muted-foreground font-semibold">Restante:</span>
            <span className="text-destructive font-bold">
              R$ {remainingAmount.toFixed(2)}
            </span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor do Pagamento (R$)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      max={remainingAmount}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Máximo: R$ {remainingAmount.toFixed(2)}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Método de Pagamento</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="cash">Dinheiro</SelectItem>
                      <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                      <SelectItem value="debit_card">Cartão de Débito</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Informações adicionais" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Registrando...' : 'Registrar Pagamento'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
