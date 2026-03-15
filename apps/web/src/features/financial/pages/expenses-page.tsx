import {
  addMonths,
  endOfMonth,
  format,
  startOfMonth,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import { useState } from "react";
import { LoadingOverlay } from "@/shared/components/loading-overlay";
import { Modal } from "@/shared/components/modal";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { ExpenseForm, type ExpenseFormData } from "../components/expense-form";
import { ExpenseList } from "../components/expense-list";
import { useExpenseCategories } from "../hooks/use-expense-categories";
import {
  useCreateExpense,
  useDeleteExpense,
  useExpenses,
  useUpdateExpense,
} from "../hooks/use-expenses";
import {
  type Expense,
  type PaymentMethod,
  paymentMethodLabels,
} from "../types";

export function ExpensesPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterPaymentMethod, setFilterPaymentMethod] = useState("all");

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
  const { updateExpense, isLoading: isUpdating } = useUpdateExpense();
  const { deleteExpense } = useDeleteExpense();

  const isLoading = isLoadingExpenses || isLoadingCategories;
  const isSubmittingExpense = isCreating || isUpdating;
  const expenseFormInitialData = editingExpense
    ? {
        categoryId: editingExpense.categoryId,
        description: editingExpense.description,
        amount: editingExpense.amount,
        paymentMethod: editingExpense.paymentMethod,
        dueDate: editingExpense.dueDate,
        paymentDate: editingExpense.paymentDate ?? "",
      }
    : undefined;

  const navigateMonth = (direction: number) => {
    setCurrentMonth((prev) =>
      direction > 0 ? addMonths(prev, 1) : subMonths(prev, 1),
    );
  };

  const closeExpenseModal = () => {
    setIsExpenseModalOpen(false);
    setEditingExpense(null);
  };

  const handleOpenCreateExpenseModal = () => {
    setEditingExpense(null);
    setIsExpenseModalOpen(true);
  };

  const handleSubmitExpense = async (data: ExpenseFormData) => {
    if (editingExpense) {
      await updateExpense({
        id: editingExpense.id,
        data: {
          categoryId: data.categoryId,
          description: data.description,
          amount: data.amount,
          dueDate: data.dueDate,
          paymentDate: data.paymentDate || undefined,
          paymentMethod: data.paymentMethod as PaymentMethod,
        },
      });
    } else {
      await createExpense({
        categoryId: data.categoryId,
        description: data.description,
        amount: data.amount,
        paymentMethod: data.paymentMethod as PaymentMethod,
        dueDate: data.dueDate,
        paymentDate: data.paymentDate || undefined,
      });
    }

    closeExpenseModal();
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsExpenseModalOpen(true);
  };

  const handleMarkAsPaid = async (expense: Expense) => {
    const today = format(new Date(), "yyyy-MM-dd");
    await updateExpense({
      id: expense.id,
      data: {
        ...expense,
        paymentDate: today,
      },
    });
  };

  const handleDeleteExpense = async (id: string) => {
    await deleteExpense(id);
  };

  // Filter expenses based on search term, category and payment method
  const filteredExpenses = expenses?.filter((expense) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      expense.description.toLowerCase().includes(searchLower) ||
      expense.categoryName.toLowerCase().includes(searchLower);
    const matchesCategory =
      filterCategory === "all" || expense.categoryId === filterCategory;
    const matchesPaymentMethod =
      filterPaymentMethod === "all" ||
      expense.paymentMethod === filterPaymentMethod;
    return matchesSearch && matchesCategory && matchesPaymentMethod;
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

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
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
              className="w-full min-w-0 cursor-default justify-center px-3 sm:min-w-36"
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
          <Button
            onClick={handleOpenCreateExpenseModal}
            className="w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Despesa
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-border overflow-hidden bg-card/50 backdrop-blur-sm">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Lista de Despesas</CardTitle>
              <CardDescription>
                Filtre por categoria e forma de pagamento
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar despesas..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full sm:w-45">
                  <SelectValue placeholder="Todas Categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Categorias</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filterPaymentMethod}
                onValueChange={setFilterPaymentMethod}
              >
                <SelectTrigger className="w-full sm:w-45">
                  <SelectValue placeholder="Todos Pagamentos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Pagamentos</SelectItem>
                  {Object.entries(paymentMethodLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setFilterCategory("all");
                  setFilterPaymentMethod("all");
                }}
                className="w-full sm:w-auto"
              >
                Limpar Filtros
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
              onEdit={handleEditExpense}
              onDelete={handleDeleteExpense}
              onMarkAsPaid={handleMarkAsPaid}
            />
          )}
        </CardContent>
      </Card>

      {/* Modal de despesa */}
      <Modal
        isOpen={isExpenseModalOpen}
        onClose={closeExpenseModal}
        title={editingExpense ? "Editar Despesa" : "Nova Despesa"}
        description={
          editingExpense
            ? "Atualize os dados da despesa selecionada."
            : "Registre uma nova saída no seu fluxo de caixa."
        }
        className="sm:max-w-md"
      >
        {categories && (
          <ExpenseForm
            categories={categories}
            initialData={expenseFormInitialData}
            onSubmit={handleSubmitExpense}
            onCancel={closeExpenseModal}
            isSubmitting={isSubmittingExpense}
            mode={editingExpense ? "edit" : "create"}
          />
        )}
      </Modal>
    </div>
  );
}
