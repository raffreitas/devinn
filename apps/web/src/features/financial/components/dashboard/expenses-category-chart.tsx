import { Cell, Pie, PieChart } from "recharts";
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
import type { Expense } from "../../types";

interface ExpensesCategoryChartProps {
  expenses: Expense[];
  isLoading: boolean;
}

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function ExpensesCategoryChart({
  expenses,
  isLoading,
}: ExpensesCategoryChartProps) {
  if (isLoading) {
    return (
      <Card className="col-span-1 border-none shadow-none bg-transparent">
        <CardHeader className="items-center pb-0">
          <CardTitle>Despesas por Categoria</CardTitle>
          <CardDescription>Distribuição de gastos no período</CardDescription>
        </CardHeader>
        <CardContent className="h-75 flex items-center justify-center">
          <Skeleton className="h-62.5 w-62.5 rounded-full" />
        </CardContent>
      </Card>
    );
  }

  // Calculate total expenses for percentage check (optional)
  const total = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  // Group expenses by category
  const data = Object.values(
    expenses.reduce(
      (acc, expense) => {
        const category = expense.categoryName;
        if (!acc[category]) {
          acc[category] = {
            name: category,
            value: 0,
            fill: "", // Will be assigned later
          };
        }
        acc[category].value += expense.amount;
        return acc;
      },
      {} as Record<string, { name: string; value: number; fill: string }>,
    ),
  ).sort((a, b) => b.value - a.value);

  // Dynamically generate chart config and assign colors
  const chartConfig: ChartConfig = {
    value: {
      label: "Valor",
    },
  };

  data.forEach((item, index) => {
    const color = COLORS[index % COLORS.length];
    const key = item.name;
    chartConfig[key] = {
      label: item.name,
      color: color,
    };
    item.fill = color; // direct fill assignment for Pie Cell if needed, or mapping by config
  });

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  return (
    <Card className="flex flex-col border-none shadow-sm ring-1 ring-border overflow-hidden bg-card/50 backdrop-blur-sm">
      <CardHeader className="items-center pb-0">
        <CardTitle>Despesas por Categoria</CardTitle>
        <CardDescription>Total: {formatCurrency(total)}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {data.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-75"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                }
              />
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                strokeWidth={5}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartLegend
                content={<ChartLegendContent nameKey="name" />}
                className="-translate-y-2 flex-wrap gap-2 justify-center"
              />
            </PieChart>
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
