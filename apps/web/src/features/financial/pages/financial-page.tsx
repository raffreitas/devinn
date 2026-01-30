import {
  addMonths,
  endOfMonth,
  format,
  startOfMonth,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Plus,
  Receipt,
  TrendingDown,
} from "lucide-react";
import { useState } from "react";
import { useBookings } from "@/features/bookings/hooks/use-booking";
import { getBlockLabel } from "@/features/bookings/utils/booking-helpers";
import { LoadingOverlay } from "@/shared/components/loading-overlay";
import { Modal } from "@/shared/components/modal";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { ExpenseForm, type ExpenseFormData } from "../components/expense-form";
import { type EditExpenseData, ExpenseList } from "../components/expense-list";
import { FinancialSummaryCards } from "../components/financial-summary-cards";
import { useExpenseCategories } from "../hooks/use-expense-categories";
import {
  useCreateExpense,
  useDeleteExpense,
  useExpenses,
  useUpdateExpense,
} from "../hooks/use-expenses";
import type { PaymentMethod } from "../types";

export function FinancialPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  // Format dates for API (YYYY-MM-DD)
  const startDate = format(monthStart, "yyyy-MM-dd");
  const endDate = format(monthEnd, "yyyy-MM-dd");

  const { data: bookings, isLoading: isLoadingBookings } = useBookings({
    startDate,
    endDate,
  });

  const { expenses, isLoading: isLoadingExpenses } = useExpenses({
    dueDateFrom: startDate,
    dueDateTo: endDate,
  });

  const { categories, isLoading: isLoadingCategories } = useExpenseCategories();

  const { createExpense, isLoading: isCreating } = useCreateExpense();
  const { updateExpense } = useUpdateExpense();
  const { deleteExpense } = useDeleteExpense();

  const isLoading =
    isLoadingBookings || isLoadingExpenses || isLoadingCategories;

  const navigateMonth = (direction: number) => {
    setCurrentMonth((prev) =>
      direction > 0 ? addMonths(prev, 1) : subMonths(prev, 1),
    );
  };

  const handleCreateExpense = async (data: ExpenseFormData) => {
    await createExpense({
      categoryId: data.categoryId,
      description: data.description,
      amount: data.amount,
      paymentMethod: data.paymentMethod as PaymentMethod,
      dueDate: data.date,
      paymentDate: data.date,
    });
    setIsExpenseModalOpen(false);
  };

  const handleEditExpense = async (id: string, data: EditExpenseData) => {
    await updateExpense({
      id,
      data: {
        categoryId: data.categoryId,
        description: data.description,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        dueDate: data.date,
        paymentDate: data.date,
      },
    });
  };

  const handleDeleteExpense = async (id: string) => {
    await deleteExpense(id);
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  // Agrupa despesas por categoria
  const expensesByCategory =
    expenses?.reduce(
      (acc, expense) => {
        acc[expense.categoryName] =
          (acc[expense.categoryName] || 0) + expense.amount;
        return acc;
      },
      {} as Record<string, number>,
    ) || {};

  return (
    <div className="space-y-8 pb-10">
      <LoadingOverlay isFetching={isLoading} position="top-bar" />

      {/* Header com navegação de mês */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Gestão Financeira
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Veja como está a saúde do seu negócio. Acompanhe entradas e saídas e
            planeje seus próximos passos.
          </p>
        </div>

        {/* Navegação do Mês */}

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateMonth(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="min-w-30 cursor-default">
            {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateMonth(1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
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

      {/* Seções de Receitas e Despesas */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Receitas do Mês */}
        <Card className="border-none shadow-sm ring-1 ring-border overflow-hidden bg-card/50 backdrop-blur-sm gap-0">
          <CardHeader className="border-b border-primary/10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Receipt className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Entradas de Reservas</CardTitle>
                <CardDescription>
                  Fluxo de caixa gerado por hóspedes
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoadingBookings ? (
              <div className="p-6 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            ) : !bookings || bookings.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-center px-6">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <ArrowRight className="w-6 h-6 text-muted-foreground opacity-20" />
                </div>
                <p className="text-muted-foreground font-medium">
                  Sem entradas de reserva este mês
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent px-4">
                      <TableHead className="pl-6">Hóspede</TableHead>
                      <TableHead className="text-center">Quarto</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right pr-6">
                        Situação
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id} className="px-4">
                        <TableCell className="pl-6 font-medium py-4">
                          {booking.guest?.name || getBlockLabel(booking.source)}
                        </TableCell>
                        <TableCell className="text-center font-mono text-xs">
                          {booking.number}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(booking.pricing.total)}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <Badge
                            variant={
                              booking.totalPaid >= booking.pricing.total
                                ? "default"
                                : "outline"
                            }
                            className={`font-bold text-[10px] ${
                              booking.totalPaid >= booking.pricing.total
                                ? "bg-primary text-primary-foreground border-transparent"
                                : booking.totalPaid > 0
                                  ? "border-amber-500 text-amber-600 dark:text-amber-400"
                                  : "border-destructive text-destructive"
                            }`}
                          >
                            {booking.totalPaid >= booking.pricing.total
                              ? "TOTAL"
                              : formatCurrency(booking.totalPaid)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Despesas do Mês */}
        <Card className="border-none shadow-sm ring-1 ring-border overflow-hidden bg-card/50 backdrop-blur-sm gap-0">
          <CardHeader className="border-b border-destructive/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-destructive/10 rounded-lg">
                  <TrendingDown className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <CardTitle className="text-lg">Saídas e Gastos</CardTitle>
                  <CardDescription>
                    Manutenção e custos operacionais
                  </CardDescription>
                </div>
              </div>
              <Button
                onClick={() => setIsExpenseModalOpen(true)}
                size="sm"
                variant="destructive"
              >
                <Plus className="w-4 h-4 mr-1" />
                Novo Gasto
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoadingExpenses || isLoadingCategories ? (
              <div className="p-6 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <ExpenseList
                expenses={expenses || []}
                categories={categories || []}
                onEdit={handleEditExpense}
                onDelete={handleDeleteExpense}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Resumo por Categoria */}
      {expenses &&
        expenses.length > 0 &&
        Object.keys(expensesByCategory).length > 0 && (
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Distribuição de Gastos
              </h2>
              <p className="text-sm text-muted-foreground">
                Visão geral por categoria
              </p>
            </div>
            <div className="flex flex-wrap gap-2 py-1">
              {Object.entries(expensesByCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([category, value]) => (
                  <div
                    key={category}
                    className="bg-card border border-border px-4 py-2.5 rounded-xl flex items-center gap-3 shadow-sm hover:ring-2 hover:ring-primary/20 transition-all cursor-default"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {category}
                    </span>
                    <span className="text-sm font-bold text-destructive">
                      {formatCurrency(value)}
                    </span>
                  </div>
                ))}
            </div>
          </section>
        )}

      {/* Modal de Nova Despesa */}
      <Modal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        title="Novo Gasto"
        description="Registre uma nova saída no seu fluxo de caixa."
        className="sm:max-w-md"
      >
        {categories && (
          <ExpenseForm
            categories={categories}
            onSubmit={handleCreateExpense}
            onCancel={() => setIsExpenseModalOpen(false)}
            isSubmitting={isCreating}
          />
        )}
      </Modal>
    </div>
  );
}
