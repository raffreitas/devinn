import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useDeleteExpense } from '@/features/financial/api/financial-api';
import { ExpenseDialog } from './expense-dialog';
import { formatCurrency, formatDateShort } from '@/lib/booking-utils';
import type { Expense, ExpenseCategory, PaymentMethod } from '@/types';

const categoryLabels: Record<ExpenseCategory, string> = {
  water: 'Água',
  electricity: 'Energia',
  internet: 'Internet',
  staff: 'Funcionários',
  maintenance: 'Manutenção',
  cleaning: 'Limpeza',
  food: 'Alimentação',
  marketing: 'Marketing',
  taxes: 'Impostos',
  ota_commissions: 'Comissões OTA',
  other: 'Outros',
};

const paymentMethodLabels: Record<PaymentMethod, string> = {
  cash: 'Dinheiro',
  pix: 'PIX',
  debit_card: 'Débito',
  credit_card: 'Crédito',
  bank_transfer: 'Transferência',
};

interface ExpensesListProps {
  expenses: Expense[];
}

export function ExpensesList({ expenses }: ExpensesListProps) {
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const deleteMutation = useDeleteExpense();

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta despesa?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error('Erro ao excluir despesa:', error);
      }
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingExpense(undefined);
  };

  if (expenses.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-gray-500">Nenhuma despesa registrada neste período</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium">
                    {formatDateShort(expense.date)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{expense.description}</div>
                      {expense.notes && (
                        <div className="text-sm text-gray-500">{expense.notes}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{categoryLabels[expense.category]}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {paymentMethodLabels[expense.payment_method]}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(expense.amount)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(expense)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(expense.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ExpenseDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        expense={editingExpense}
      />
    </>
  );
}
