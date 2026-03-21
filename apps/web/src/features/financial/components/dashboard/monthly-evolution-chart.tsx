import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from "recharts";
import type { FinancialDashboardMonth } from "@/features/financial/types";
import {
  Card,
  CardContent,
  CardDescription,
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

interface MonthlyEvolutionChartProps {
  data: FinancialDashboardMonth[];
  isLoading: boolean;
}

const chartConfig = {
  totalRevenue: {
    label: "Receita Total",
    color: "var(--primary)",
  },
  totalExpenses: {
    label: "Despesas",
    color: "var(--destructive)",
  },
  actualBalance: {
    label: "Balanço Real",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

export function MonthlyEvolutionChart({
  data,
  isLoading,
}: MonthlyEvolutionChartProps) {
  if (isLoading) {
    return (
      <Card className="col-span-1 border-none shadow-none bg-transparent">
        <CardHeader>
          <CardTitle>Evolução Mensal</CardTitle>
          <CardDescription>Últimos 12 meses</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((item) => ({
    ...item,
    monthLabel: format(new Date(item.monthStart), "MMM/yy", { locale: ptBR }),
  }));

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    });
  };

  return (
    <Card className="col-span-1 border-none shadow-sm ring-1 ring-border overflow-hidden bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Evolução Mensal</CardTitle>
        <CardDescription>
          Receita, despesas e balanço real dos últimos 12 meses
        </CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        {chartData.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-full w-full">
            <ComposedChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="monthLabel"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                minTickGap={18}
              />
              <YAxis
                tickFormatter={(value) => formatCurrency(Number(value))}
                tickLine={false}
                axisLine={false}
                width={92}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="dashed"
                    labelFormatter={(value) => String(value)}
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey="totalRevenue"
                fill="var(--color-totalRevenue)"
                radius={4}
              />
              <Bar
                dataKey="totalExpenses"
                fill="var(--color-totalExpenses)"
                radius={4}
              />
              <Line
                type="monotone"
                dataKey="actualBalance"
                stroke="var(--color-actualBalance)"
                strokeWidth={2}
                dot={{ fill: "var(--color-actualBalance)" }}
              />
            </ComposedChart>
          </ChartContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground p-6">
            Sem dados para os últimos 12 meses
          </div>
        )}
      </CardContent>
    </Card>
  );
}
