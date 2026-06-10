import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import type { Booking } from "@/features/bookings/types";
import {
  isFinanciallyReconciled,
  isIgnoredExternalBlock,
} from "@/features/bookings/utils/booking-helpers";
import type { Expense } from "@/features/financial/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/components/ui/chart";
import { Skeleton } from "@/shared/components/ui/skeleton";

interface RevenueExpensesChartProps {
  bookings: Booking[];
  expenses: Expense[];
  isLoading: boolean;
}

const chartConfig = {
  revenue: {
    label: "Receita conciliada",
    color: "var(--primary)",
  },
  expenses: {
    label: "Despesas",
    color: "var(--destructive)",
  },
} satisfies ChartConfig;

export function RevenueExpensesChart({
  bookings,
  expenses,
  isLoading,
}: RevenueExpensesChartProps) {
  if (isLoading) {
    return (
      <Card className="col-span-1 lg:col-span-2 border-none shadow-none bg-transparent">
        <CardHeader>
          <CardTitle>Receitas vs Despesas</CardTitle>
        </CardHeader>
        <CardContent className="h-75 flex items-center justify-center">
          <Skeleton className="h-62.5 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Helper to group data by date
  const getDataByDate = () => {
    const dataMap = new Map<
      string,
      { date: string; revenue: number; expenses: number }
    >();

    bookings
      .filter(
        (booking) =>
          isFinanciallyReconciled(booking) && !isIgnoredExternalBlock(booking),
      )
      .forEach((booking) => {
        // Use check-in date for revenue recognition in this chart, or payment date if available
        // For simplicity using checkIn date for now
        const date = new Date(booking.checkIn).toISOString();
        let entry = dataMap.get(date);
        if (!entry) {
          entry = { date, revenue: 0, expenses: 0 };
          dataMap.set(date, entry);
        }
        entry.revenue += booking.pricing.total; // Total booking value
      });

    expenses.forEach((expense) => {
      const date = new Date(
        expense.paymentDate || expense.dueDate,
      ).toISOString();
      let entry = dataMap.get(date);
      if (!entry) {
        entry = { date, revenue: 0, expenses: 0 };
        dataMap.set(date, entry);
      }
      entry.expenses += expense.amount;
    });

    return Array.from(dataMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date),
    );
  };

  const data = getDataByDate();

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM", { locale: ptBR });
  };

  return (
    <Card className="col-span-1 lg:col-span-2 border-none shadow-sm ring-1 ring-border overflow-hidden bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Receita conciliada vs Despesas</CardTitle>
      </CardHeader>
      <CardContent className="h-75">
        {data.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-full w-full">
            <BarChart accessibilityLayer data={data}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                minTickGap={30}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="dashed"
                    labelFormatter={(value) => formatDate(value)}
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
              <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground p-6">
            Sem dados para este período
          </div>
        )}
      </CardContent>
    </Card>
  );
}
