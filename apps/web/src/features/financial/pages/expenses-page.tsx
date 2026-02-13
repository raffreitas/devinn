import {
  addMonths,
  endOfMonth,
  format,
  startOfMonth,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Filter, Plus, Search } from "lucide-react";
import { useState } from "react";
import { LoadingOverlay } from "@/shared/components/loading-overlay";
import { Modal } from "@/shared/components/modal";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { ExpenseForm, type ExpenseFormData } from "../components/expense-form";
import { type EditExpenseData, ExpenseList } from "../components/expense-list";
import { useExpenseCategories } from "../hooks/use-expense-categories";
import {
  useCreateExpense,
  useDeleteExpense,
  useExpenses,
  useUpdateExpense,
} from "../hooks/use-expenses";
import type { PaymentMethod } from "../types";

export function ExpensesPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  // Format dates for API (YYYY-MM-DD)
  const startDate = format(monthStart, "yyyy-MM-dd");
  const endDate = format(monthEnd, "yyyy-MM-dd");

  const { expenses, isLoading: isLoadingExpenses } = useExpenses({
    dueDateFrom: startDate,
    dueDateTo: endDate,
  });

  const { categories, isLoading: isLoadingCategories } = useExpenseCategories();

  const { createExpense, isLoading: isCreating } = useCreateExpense();
  const { updateExpense } = useUpdateExpense();
  const { deleteExpense } = useDeleteExpense();

  const isLoading = isLoadingExpenses || isLoadingCategories;

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

  // Filter expenses based on search term
  const filteredExpenses = expenses?.filter((expense) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      expense.description.toLowerCase().includes(searchLower) ||
      expense.categoryName.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-8 pb-10">
      <LoadingOverlay isFetching={isLoading} position="top-bar" />

      {/* Header com navegação de mês */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Despesas
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie todas as saídas e custos operacionais.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateMonth(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="min-w-36 cursor-default">
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

      <Card className="border-none shadow-sm ring-1 ring-border overflow-hidden bg-card/50 backdrop-blur-sm">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar despesas..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Filter className="w-4 h-4 mr-2" />
                Filtrar
              </Button>
              <Button onClick={() => setIsExpenseModalOpen(true)} size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Nova Despesa
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoadingExpenses || isLoadingCategories ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <ExpenseList
              expenses={filteredExpenses || []}
              categories={categories || []}
              onEdit={handleEditExpense}
              onDelete={handleDeleteExpense}
            />
          )}
        </CardContent>
      </Card>

      {/* Modal de Nova Despesa */}
      <Modal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        title="Nova Despesa"
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
