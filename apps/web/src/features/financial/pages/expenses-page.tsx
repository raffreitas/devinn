import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { useTenant } from '@/shared/contexts/tenant-context';
import { expenseService } from '../services/expense-service';
import { ExpenseFormDialog } from '../components/expense-form-dialog';
import type { Expense, CreateExpenseRequest } from '../types';
import { ptBR } from 'date-fns/locale';

const categoryLabels: Record<string, string> = {
  water: 'Água',
  electricity: 'Energia',
  gas: 'Gás',
  internet: 'Internet',
  maintenance: 'Manutenção',
  salaries: 'Funcionários',
  supplies: 'Suprimentos',
  marketing: 'Marketing',
  taxes: 'Impostos',
  other: 'Outros',
};

export function ExpensesPage() {
  const { innId } = useTenant();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | undefined>();
  const [currentDate, setCurrentDate] = useState(new Date());
  const queryClient = useQueryClient();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const startDate = startOfMonth(currentDate).toISOString();
  const endDate = endOfMonth(currentDate).toISOString();

  const { data: expenses, isLoading } = useQuery({
    queryKey: ['expenses', innId, year, month],
    queryFn: () => {
      if (!innId) return [];
      return expenseService.getAll(innId, startDate, endDate);
    },
    enabled: !!innId,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateExpenseRequest) => {
      if (!innId) throw new Error('Inn ID não encontrado');
      return expenseService.create(innId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['financial'] });
      toast.success('Despesa criada com sucesso');
      setDialogOpen(false);
    },
    onError: () => {
      toast.error('Erro ao criar despesa');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateExpenseRequest }) => {
      if (!innId) throw new Error('Inn ID não encontrado');
      return expenseService.update(innId, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['financial'] });
      toast.success('Despesa atualizada com sucesso');
      setDialogOpen(false);
      setSelectedExpense(undefined);
    },
    onError: () => {
      toast.error('Erro ao atualizar despesa');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      if (!innId) throw new Error('Inn ID não encontrado');
      return expenseService.delete(innId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['financial'] });
      toast.success('Despesa excluída com sucesso');
    },
    onError: () => {
      toast.error('Erro ao excluir despesa');
    },
  });

  const handleSubmit = async (data: CreateExpenseRequest) => {
    if (selectedExpense) {
      await updateMutation.mutateAsync({ id: selectedExpense.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleEdit = (expense: Expense) => {
    setSelectedExpense(expense);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta despesa?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleNew = () => {
    setSelectedExpense(undefined);
    setDialogOpen(true);
  };

  const handlePreviousMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const totalExpenses = expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;

  if (!innId) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Selecione uma pousada para continuar</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Despesas</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie as despesas da pousada</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={handleToday} className="min-w-30">
            {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-2xl font-bold">
          Total: <span className="text-red-600">R$ {totalExpenses.toFixed(2)}</span>
        </div>
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Despesa
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Despesas</CardTitle>
          <CardDescription>Todas as despesas do período selecionado</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : expenses && expenses.length > 0 ? (
            <div className="overflow-x-auto -mx-6 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead className="hidden md:table-cell">Descrição</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="w-25 text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="font-medium">
                          {format(new Date(expense.date), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{categoryLabels[expense.category]}</Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {expense.description}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-red-600">
                          R$ {expense.amount.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(expense)}
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(expense.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Excluir</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground mb-4">Nenhuma despesa registrada neste período</p>
              <Button onClick={handleNew}>
                <Plus className="mr-2 h-4 w-4" />
                Criar primeira despesa
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <ExpenseFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        expense={selectedExpense}
      />
    </div>
  );
}
