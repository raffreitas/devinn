import { endOfMonth, format, startOfMonth } from "date-fns";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { useBookings } from "@/features/bookings/hooks/use-booking";
import { DateRangePicker } from "@/shared/components/date-range-picker";
import { LoadingOverlay } from "@/shared/components/loading-overlay";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { ExpensesCategoryChart } from "../components/dashboard/expenses-category-chart";
import { RevenueExpensesChart } from "../components/dashboard/revenue-expenses-chart";
import { FinancialSummaryCards } from "../components/financial-summary-cards";
import { useExpenses } from "../hooks/use-expenses";

export function FinancialPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  // Format dates for API (YYYY-MM-DD)
  // Se não tiver data selecionada, usa o mês atual como fallback
  const startDate = dateRange?.from
    ? format(dateRange.from, "yyyy-MM-dd")
    : format(startOfMonth(new Date()), "yyyy-MM-dd");

  const endDate = dateRange?.to
    ? format(dateRange.to, "yyyy-MM-dd")
    : dateRange?.from
      ? format(dateRange.from, "yyyy-MM-dd")
      : format(endOfMonth(new Date()), "yyyy-MM-dd");

  const { data: bookings, isLoading: isLoadingBookings } = useBookings({
    startDate,
    endDate,
  });

  const { expenses, isLoading: isLoadingExpenses } = useExpenses({
    dueDateFrom: startDate,
    dueDateTo: endDate,
  });

  const isLoading = isLoadingBookings || isLoadingExpenses;

  return (
    <div className="space-y-8 pb-10">
      <LoadingOverlay isFetching={isLoading} position="top-bar" />

      {/* Header com navegação de mês */}
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

        {/* Navegação de Data */}
        <div className="flex items-center gap-2">
          <DateRangePicker date={dateRange} onDateChange={setDateRange} />
        </div>
      </div>

      {/* Cards de Resumo */}
      <section>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <FinancialSummaryCards
            bookings={bookings || []}
            expenses={expenses || []}
          />
        )}
      </section>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RevenueExpensesChart
          bookings={bookings || []}
          expenses={expenses || []}
          isLoading={isLoading}
        />
        <ExpensesCategoryChart
          expenses={expenses || []}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
