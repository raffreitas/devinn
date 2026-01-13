import { useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { useCreateExpense, useUpdateExpense } from '@/features/financial/api/financial-api';
import type { Expense, ExpenseCategory, PaymentMethod } from '@/types';

const expenseSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  amount: z.coerce.number().min(0.01, 'Valor deve ser maior que zero'),
  category: z.enum([
    'water',
    'electricity',
    'internet',
    'staff',
    'maintenance',
    'cleaning',
    'food',
    'marketing',
    'taxes',
    'ota_commissions',
    'other',
  ]),
  payment_method: z.enum(['cash', 'pix', 'debit_card', 'credit_card', 'bank_transfer']),
  date: z.date({ required_error: 'Data é obrigatória' }),
  notes: z.string().optional(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface ExpenseDialogProps {
  open: boolean;
  onClose: () => void;
  expense?: Expense;
}

const categories: { value: ExpenseCategory; label: string }[] = [
  { value: 'water', label: 'Água' },
  { value: 'electricity', label: 'Energia' },
  { value: 'internet', label: 'Internet' },
  { value: 'staff', label: 'Funcionários' },
  { value: 'maintenance', label: 'Manutenção' },
  { value: 'cleaning', label: 'Limpeza' },
  { value: 'food', label: 'Alimentação' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'taxes', label: 'Impostos' },
  { value: 'ota_commissions', label: 'Comissões OTA' },
  { value: 'other', label: 'Outros' },
];

const paymentMethods: { value: PaymentMethod; label: string }[] = [
  { value: 'pix', label: 'PIX' },
  { value: 'cash', label: 'Dinheiro' },
  { value: 'debit_card', label: 'Cartão de Débito' },
  { value: 'credit_card', label: 'Cartão de Crédito' },
  { value: 'bank_transfer', label: 'Transferência Bancária' },
];

export function ExpenseDialog({ open, onClose, expense }: ExpenseDialogProps) {
  const isEditing = !!expense;
  const createMutation = useCreateExpense();
  const updateMutation = useUpdateExpense();

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: '',
      amount: 0,
      category: 'other',
      payment_method: 'pix',
      date: new Date(),
      notes: '',
    },
  });

  useEffect(() => {
    if (expense) {
      form.reset({
        description: expense.description,
        amount: expense.amount,
        category: expense.category,
        payment_method: expense.payment_method,
        date: new Date(expense.date),
        notes: expense.notes || '',
      });
    } else {
      form.reset({
        description: '',
        amount: 0,
        category: 'other',
        payment_method: 'pix',
        date: new Date(),
        notes: '',
      });
    }
  }, [expense, form, open]);

  const onSubmit = async (data: ExpenseFormData) => {
    try {
      const payload = {
        ...data,
        date: format(data.date, 'yyyy-MM-dd'),
      };

      if (isEditing) {
        await updateMutation.mutateAsync({ id: expense.id, ...payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onClose();
    } catch (error) {
      console.error('Erro ao salvar despesa:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Despesa' : 'Nova Despesa'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Atualize as informações da despesa'
              : 'Registre uma nova despesa da pousada'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Conta de luz de Janeiro" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data *</FormLabel>
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
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
                name="payment_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forma de Pagamento *</FormLabel>
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
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Informações adicionais sobre a despesa..."
                      {...field}
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
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? 'Salvando...'
                  : isEditing
                  ? 'Atualizar'
                  : 'Criar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
