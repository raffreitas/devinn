import { DollarSign, PiggyBank, TrendingDown, TrendingUp } from "lucide-react";
import type { Booking } from "@/features/bookings/types";
import type { Expense } from "../types";

interface FinancialSummaryCardsProps {
  bookings: Booking[];
  expenses: Expense[];
}

export function FinancialSummaryCards({
  bookings,
  expenses,
}: FinancialSummaryCardsProps) {
  // Calcula receitas do mês
  const totalRevenue = bookings.reduce((sum, b) => sum + b.pricing.total, 0);
  const receivedRevenue = bookings.reduce((sum, b) => sum + b.totalPaid, 0);
  const pendingRevenue = totalRevenue - receivedRevenue;

  // Calcula despesas do mês
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Balanço
  const balance = receivedRevenue - totalExpenses;
  const projectedBalance = totalRevenue - totalExpenses;

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Receita Total */}
      <div className="bg-card rounded-xl p-5 border border-border shadow-sm flex flex-col justify-between hover:border-primary/50 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <span className="text-muted-foreground font-medium text-xs uppercase tracking-wider">
            Receita Total
          </span>
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">
            {formatCurrency(totalRevenue)}
          </p>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            {bookings.length} reservas no período
          </p>
        </div>
      </div>

      {/* Receita Recebida */}
      <div className="bg-card rounded-xl p-5 border border-border shadow-sm flex flex-col justify-between hover:border-primary/50 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <DollarSign className="w-5 h-5 text-primary" />
          </div>
          <span className="text-muted-foreground font-medium text-xs uppercase tracking-wider">
            Recebido
          </span>
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">
            {formatCurrency(receivedRevenue)}
          </p>
          <p
            className={`text-xs mt-1 font-medium ${pendingRevenue > 0 ? "text-amber-500" : "text-primary"}`}
          >
            {pendingRevenue > 0
              ? `${formatCurrency(pendingRevenue)} pendente`
              : "100% recebido"}
          </p>
        </div>
      </div>

      {/* Despesas */}
      <div className="bg-card rounded-xl p-5 border border-border shadow-sm flex flex-col justify-between hover:border-destructive/50 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-destructive/10 rounded-lg">
            <TrendingDown className="w-5 h-5 text-destructive" />
          </div>
          <span className="text-muted-foreground font-medium text-xs uppercase tracking-wider">
            Despesas
          </span>
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">
            {formatCurrency(totalExpenses)}
          </p>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            {expenses.length} lançamentos realizados
          </p>
        </div>
      </div>

      {/* Saldo */}
      <div
        className={`bg-card rounded-xl p-5 border shadow-sm flex flex-col justify-between transition-colors ${
          balance >= 0
            ? "border-primary/30 hover:border-primary/60"
            : "border-destructive/30 hover:border-destructive/60"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div
            className={`p-2 rounded-lg ${balance >= 0 ? "bg-primary/10" : "bg-destructive/10"}`}
          >
            <PiggyBank
              className={`w-5 h-5 ${balance >= 0 ? "text-primary" : "text-destructive"}`}
            />
          </div>
          <span className="text-muted-foreground font-medium text-xs uppercase tracking-wider">
            Saldo Atual
          </span>
        </div>
        <div>
          <p
            className={`text-2xl font-bold ${balance >= 0 ? "text-primary" : "text-destructive"}`}
          >
            {formatCurrency(balance)}
          </p>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            Projetado: {formatCurrency(projectedBalance)}
          </p>
        </div>
      </div>
    </div>
  );
}
