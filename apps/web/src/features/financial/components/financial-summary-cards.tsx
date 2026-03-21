import {
  Calculator,
  Clock3,
  DollarSign,
  PiggyBank,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import type { FinancialDashboardMetrics } from "../types";

interface FinancialSummaryCardsProps {
  metrics: FinancialDashboardMetrics;
}

export function FinancialSummaryCards({ metrics }: FinancialSummaryCardsProps) {
  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const cards = [
    {
      title: "Receita Total",
      value: formatCurrency(metrics.totalRevenue),
      description: "Reservas do mês selecionado",
      icon: TrendingUp,
      accent: "primary",
    },
    {
      title: "Receita Recebida",
      value: formatCurrency(metrics.receivedRevenue),
      description:
        metrics.pendingRevenue > 0
          ? `${formatCurrency(metrics.pendingRevenue)} pendente`
          : "100% recebido",
      icon: DollarSign,
      accent: metrics.pendingRevenue > 0 ? "amber" : "primary",
    },
    {
      title: "Receita Pendente",
      value: formatCurrency(metrics.pendingRevenue),
      description: "Diferença entre total e recebido",
      icon: Clock3,
      accent: metrics.pendingRevenue > 0 ? "amber" : "muted",
    },
    {
      title: "Total de Despesas",
      value: formatCurrency(metrics.totalExpenses),
      description: "Despesas lançadas no período",
      icon: TrendingDown,
      accent: "destructive",
    },
    {
      title: "Balanço Real",
      value: formatCurrency(metrics.actualBalance),
      description: "Recebido menos despesas",
      icon: PiggyBank,
      accent: metrics.actualBalance >= 0 ? "primary" : "destructive",
    },
    {
      title: "Balanço Projetado",
      value: formatCurrency(metrics.projectedBalance),
      description: "Total previsto menos despesas",
      icon: Calculator,
      accent: metrics.projectedBalance >= 0 ? "primary" : "destructive",
    },
  ] as const;

  const toneClasses = {
    primary: "text-primary",
    destructive: "text-destructive",
    amber: "text-amber-500",
    muted: "text-muted-foreground",
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => {
        const toneColor = toneClasses[card.accent];
        const Icon = card.icon;

        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {card.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${toneColor}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
