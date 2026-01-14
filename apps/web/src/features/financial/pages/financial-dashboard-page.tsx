import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useTenant } from '@/shared/contexts/tenant-context';
import { financialService } from '../services/financial-service';
import { ExpenseList } from '../components/expense-list';
import { cn } from '@/shared/lib/utils';

export function FinancialDashboardPage() {
  const { innId } = useTenant();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const { data: financialData, isLoading } = useQuery({
    queryKey: ['financial', innId, year, month],
    queryFn: () => {
      if (!innId) throw new Error('Inn ID não encontrado');
      return financialService.getMonthlyData(innId, year, month);
    },
    enabled: !!innId,
  });

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

  if (!innId) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Selecione uma pousada para continuar</p>
      </div>
    );
  }

  const metrics = financialData?.metrics;
  const isPositiveBalance = (metrics?.balance || 0) >= 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Financeiro</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Controle financeiro e despesas
          </p>
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

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  R$ {metrics?.totalRevenue.toFixed(2) || '0.00'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Pagamentos recebidos no período
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Despesas Totais</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  R$ {metrics?.totalExpenses.toFixed(2) || '0.00'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Despesas lançadas no período
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Balanço</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div
                  className={cn(
                    'text-2xl font-bold',
                    isPositiveBalance ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  R$ {metrics?.balance.toFixed(2) || '0.00'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {isPositiveBalance ? 'Superávit' : 'Déficit'} do período
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Despesas por Categoria</CardTitle>
                <CardDescription>Distribuição de gastos no período</CardDescription>
              </CardHeader>
              <CardContent>
                {financialData && (
                  <ExpenseList
                    expensesByCategory={financialData.metrics.expensesByCategory}
                    totalExpenses={financialData.metrics.totalExpenses}
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resumo do Período</CardTitle>
                <CardDescription>Análise financeira mensal</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Taxa de Receita/Despesa</span>
                    <span className="font-medium">
                      {metrics?.totalExpenses
                        ? ((metrics.totalRevenue / metrics.totalExpenses) * 100).toFixed(1)
                        : '0'}
                      %
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full transition-all',
                        isPositiveBalance ? 'bg-green-500' : 'bg-red-500'
                      )}
                      style={{
                        width: `${Math.min(
                          100,
                          metrics?.totalExpenses
                            ? (metrics.totalRevenue / metrics.totalExpenses) * 100
                            : 0
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t space-y-2">
                  <h4 className="text-sm font-medium">Dicas de Gestão</h4>
                  {isPositiveBalance ? (
                    <p className="text-sm text-muted-foreground">
                      Excelente! Suas receitas estão superando as despesas. Continue
                      monitorando os gastos e buscando otimizações.
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Atenção: Suas despesas estão superiores às receitas. Revise os gastos
                      e busque formas de reduzir custos ou aumentar a ocupação.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
