import { useState, useMemo } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, TrendingUp, TrendingDown, DollarSign, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDashboardMetrics, useExpenses } from '@/features/financial/api/financial-api';
import { useBookings } from '@/features/bookings/api/bookings-api';
import { ExpenseDialog } from './components/expense-dialog';
import { ExpensesList } from './components/expenses-list';
import { formatCurrency, calculatePaymentStatus } from '@/lib/booking-utils';
import type { ExpenseCategory } from '@/types';

const expenseCategoryLabels: Record<ExpenseCategory, string> = {
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

export function FinancialDashboardPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);

  const monthParam = format(currentMonth, 'yyyy-MM');
  const { data: metrics, isLoading: loadingMetrics } = useDashboardMetrics(monthParam);
  const { data: expenses = [], isLoading: loadingExpenses } = useExpenses({ month: monthParam });
  const { data: bookings = [] } = useBookings({ month: monthParam });

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // Calcular métricas do mês se a API não retornar (fallback)
  const calculatedMetrics = useMemo(() => {
    if (metrics) return metrics;

    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    // Filtrar bookings do mês
    const monthBookings = bookings.filter(b => {
      const checkIn = new Date(b.check_in);
      const checkOut = new Date(b.check_out);
      return (checkIn >= monthStart && checkIn <= monthEnd) || 
             (checkOut >= monthStart && checkOut <= monthEnd);
    });

    const totalRevenue = monthBookings.reduce((sum, b) => sum + b.total_value, 0);
    const receivedRevenue = monthBookings.reduce((sum, b) => sum + b.paid_value, 0);
    const pendingRevenue = totalRevenue - receivedRevenue;

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const realBalance = receivedRevenue - totalExpenses;
    const projectedBalance = totalRevenue - totalExpenses;

    const otaCommissions = expenses
      .filter(e => e.category === 'ota_commissions')
      .reduce((sum, e) => sum + e.amount, 0);

    const expensesByCategory: Record<ExpenseCategory, number> = {
      water: 0,
      electricity: 0,
      internet: 0,
      staff: 0,
      maintenance: 0,
      cleaning: 0,
      food: 0,
      marketing: 0,
      taxes: 0,
      ota_commissions: 0,
      other: 0,
    };

    expenses.forEach(e => {
      expensesByCategory[e.category] += e.amount;
    });

    return {
      total_revenue: totalRevenue,
      received_revenue: receivedRevenue,
      pending_revenue: pendingRevenue,
      total_expenses: totalExpenses,
      real_balance: realBalance,
      projected_balance: projectedBalance,
      ota_commissions: otaCommissions,
      expenses_by_category: expensesByCategory,
    };
  }, [metrics, bookings, expenses, currentMonth]);

  const pendingPaymentBookings = useMemo(() => {
    return bookings.filter(b => {
      const paymentStatus = calculatePaymentStatus(b.total_value, b.paid_value);
      return paymentStatus !== 'paid' && !b.cancellation_status;
    });
  }, [bookings]);

  if (loadingMetrics || loadingExpenses) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Financeiro</h1>
          <p className="mt-2 text-gray-600">
            Acompanhe receitas, despesas e o balanço da sua pousada
          </p>
        </div>
        <div className="flex items-center gap-2">
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

      {/* Alertas */}
      {pendingPaymentBookings.length > 0 && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardContent className="flex items-center gap-3 pt-6">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="font-semibold text-yellow-900">
                {pendingPaymentBookings.length} reserva(s) com pagamento pendente ou parcial
              </p>
              <p className="text-sm text-yellow-700">
                Valor total pendente: {formatCurrency(calculatedMetrics.pending_revenue)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Métricas Principais */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(calculatedMetrics.total_revenue)}</div>
            <p className="text-xs text-muted-foreground">Incluindo valores pendentes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Recebida</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(calculatedMetrics.received_revenue)}
            </div>
            <p className="text-xs text-muted-foreground">Pagamentos confirmados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(calculatedMetrics.total_expenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              Comissões OTA: {formatCurrency(calculatedMetrics.ota_commissions)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balanço Real</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                calculatedMetrics.real_balance >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatCurrency(calculatedMetrics.real_balance)}
            </div>
            <p className="text-xs text-muted-foreground">
              Projetado: {formatCurrency(calculatedMetrics.projected_balance)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Despesas por Categoria */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Despesas por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(calculatedMetrics.expenses_by_category)
              .filter(([_, value]) => value > 0)
              .sort(([_, a], [__, b]) => b - a)
              .map(([category, amount]) => {
                const percentage = (amount / calculatedMetrics.total_expenses) * 100;
                
                return (
                  <div key={category}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="font-medium">
                        {expenseCategoryLabels[category as ExpenseCategory]}
                      </span>
                      <span className="font-semibold">{formatCurrency(amount)}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="mt-1 text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                  </div>
                );
              })}

            {calculatedMetrics.total_expenses === 0 && (
              <div className="py-8 text-center text-gray-500">
                Nenhuma despesa registrada neste mês
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Gestão de Despesas */}
      <Tabs defaultValue="expenses" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="expenses">Despesas</TabsTrigger>
            <TabsTrigger value="revenue">Receitas</TabsTrigger>
          </TabsList>
          <Button onClick={() => setExpenseDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Despesa
          </Button>
        </div>

        <TabsContent value="expenses">
          <ExpensesList expenses={expenses} />
        </TabsContent>

        <TabsContent value="revenue">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">
                Visualização de receitas em desenvolvimento...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ExpenseDialog
        open={expenseDialogOpen}
        onClose={() => setExpenseDialogOpen(false)}
      />
    </div>
  );
}
