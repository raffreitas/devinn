import { DollarSign, PiggyBank, TrendingDown, TrendingUp } from "lucide-react";
import type { Booking } from "@/features/bookings/types";
import type { Expense } from "../types";
import {
  calculateFinancialSummary,
  getReceivedRevenueMessage,
} from "../utils/financial-summary";

interface FinancialSummaryCardsProps {
  bookings: Booking[];
  expenses: Expense[];
}

export function FinancialSummaryCards({
  bookings,
  expenses,
}: FinancialSummaryCardsProps) {
  const financialSummary = calculateFinancialSummary(bookings);

  // Calcula despesas do mês
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Balanço
  const balance = financialSummary.receivedRevenue - totalExpenses;
  const projectedBalance = financialSummary.reconciledRevenue - totalExpenses;

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const receivedRevenueMessage = getReceivedRevenueMessage(
    financialSummary,
    formatCurrency,
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Receita conciliada */}
      <div className="bg-card rounded-xl p-5 border border-border shadow-sm flex flex-col justify-between hover:border-primary/50 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <span className="text-muted-foreground font-medium text-xs uppercase tracking-wider">
            Receita conciliada
          </span>
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">
            {formatCurrency(financialSummary.reconciledRevenue)}
          </p>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            {financialSummary.reconciledBookingsCount} reservas conciliadas
          </p>
          {financialSummary.pendingPricingCount > 0 && (
            <p className="text-xs text-amber-500 mt-1 font-medium">
              {financialSummary.pendingPricingCount} conciliações pendentes
            </p>
          )}
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
            {formatCurrency(financialSummary.receivedRevenue)}
          </p>
          <p
            className={`text-xs mt-1 font-medium ${
              financialSummary.receivableRevenue > 0 ||
              financialSummary.pendingPricingCount > 0
                ? "text-amber-500"
                : "text-primary"
            }`}
          >
            {receivedRevenueMessage}
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
