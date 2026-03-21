import {
  addMonths,
  endOfMonth,
  format,
  startOfMonth,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { LoadingOverlay } from "@/shared/components/loading-overlay";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { ExpensesCategoryChart } from "../components/dashboard/expenses-category-chart";
import { MonthlyEvolutionChart } from "../components/dashboard/monthly-evolution-chart";
import { FinancialSummaryCards } from "../components/financial-summary-cards";
import { useExpenses } from "../hooks/use-expenses";
import { useFinancialDashboard } from "../hooks/use-financial-dashboard";

export function FinancialPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const referenceDate = format(monthStart, "yyyy-MM-dd");
  const startDate = referenceDate;
  const endDate = format(monthEnd, "yyyy-MM-dd");

  const { metrics, isLoading: isLoadingMetrics } =
    useFinancialDashboard(referenceDate);

  const { expenses, isLoading: isLoadingExpenses } = useExpenses({
    dueDateFrom: startDate,
    dueDateTo: endDate,
  });

  const isLoading = isLoadingMetrics || isLoadingExpenses;

  const navigateMonth = (direction: number) => {
    setCurrentMonth((prev) =>
      direction > 0 ? addMonths(prev, 1) : subMonths(prev, 1),
    );
  };

  return (
    <div className="space-y-8 pb-10">
      <LoadingOverlay isFetching={isLoading} position="top-bar" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Dashboard Financeiro
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Veja como está a saúde do seu negócio. Acompanhe entradas e saídas e
            planeje seus próximos passos.
          </p>
        </div>

        <div className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-2 sm:w-auto">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateMonth(-1)}
            className="shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="w-full min-w-0 cursor-default justify-center px-3 capitalize sm:min-w-40"
          >
            {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateMonth(1)}
            className="shrink-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <section>
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "total",
              "received",
              "pending",
              "expenses",
              "actual-balance",
              "projected-balance",
            ].map((key) => (
              <Skeleton key={key} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        ) : metrics ? (
          <FinancialSummaryCards metrics={metrics} />
        ) : null}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <MonthlyEvolutionChart
          data={metrics?.monthlyEvolution || []}
          isLoading={isLoadingMetrics}
        />
        <ExpensesCategoryChart
          expenses={expenses || []}
          isLoading={isLoadingExpenses}
        />
      </div>
    </div>
  );
}
