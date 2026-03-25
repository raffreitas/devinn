import { format } from "date-fns";
import {
  Edit2,
  EyeIcon,
  Filter,
  Plus,
  RepeatIcon,
  XCircleIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/shared/components/modal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/shared/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { ExpenseForm, type ExpenseFormData } from "./expense-form";
import { RecurringExpenseDetails } from "./recurring-expense-details";
import {
  useCancelRecurringExpense,
  useCreateRecurringExpense,
  useRecurringExpenseById,
  useRecurringExpenses,
  useUpdateRecurringExpense,
} from "../hooks/use-expenses";
import type { ExpenseCategory, PaymentMethod, RecurringExpense } from "../types";
import { RecurringExpenseStatus } from "../types";

type RecurringManagerView = "list" | "details" | "form";

interface RecurringExpenseManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: ExpenseCategory[];
  initialRecurringExpenseId?: string | null;
}

const PAGE_SIZE = 10;

const statusConfig = {
  [RecurringExpenseStatus.ACTIVE]: {
    label: "Ativa",
    className:
      "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-700",
  },
  [RecurringExpenseStatus.COMPLETED]: {
    label: "Concluída",
    className:
      "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700",
  },
  [RecurringExpenseStatus.CANCELLED]: {
    label: "Cancelada",
    className:
      "bg-gray-100 dark:bg-gray-950 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700",
  },
} as const;

function generatePaginationPages(currentPage: number, totalPages: number) {
  const pages: (number | "ellipsis-left" | "ellipsis-right")[] = [];
  const maxPagesToShow = 5;
  const halfWindow = Math.floor(maxPagesToShow / 2);

  let startPage = Math.max(1, currentPage - halfWindow);
  const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  if (startPage > 1) {
    pages.push(1);
    if (startPage > 2) {
      pages.push("ellipsis-left");
    }
  }

  for (let index = startPage; index <= endPage; index++) {
    pages.push(index);
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      pages.push("ellipsis-right");
    }
    pages.push(totalPages);
  }

  return pages;
}

const formatDate = (value?: string | null) => {
  if (!value) {
    return "-";
  }

  return format(new Date(value), "dd/MM/yyyy");
};

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const getDefaultFormData = (): ExpenseFormData => ({
  isRecurring: true,
  categoryId: "",
  description: "",
  amount: 0,
  paymentMethod: "Cash",
  dueDate: new Date().toISOString().split("T")[0],
  paymentDate: "",
  endDate: "",
});

const toFormData = (recurringExpense: RecurringExpense): ExpenseFormData => ({
  isRecurring: true,
  categoryId: recurringExpense.categoryId,
  description: recurringExpense.description,
  amount: recurringExpense.amount,
  paymentMethod: recurringExpense.paymentMethod,
  dueDate: recurringExpense.startDate,
  paymentDate: "",
  endDate: recurringExpense.endDate ?? "",
});

export function RecurringExpenseManagerModal({
  isOpen,
  onClose,
  categories,
  initialRecurringExpenseId,
}: RecurringExpenseManagerModalProps) {
  const [view, setView] = useState<RecurringManagerView>("list");
  const [statusFilter, setStatusFilter] = useState<
    (typeof RecurringExpenseStatus)[keyof typeof RecurringExpenseStatus] | "all"
  >("all");
  const [page, setPage] = useState(1);
  const [selectedRecurringExpenseId, setSelectedRecurringExpenseId] = useState<
    string | null
  >(initialRecurringExpenseId ?? null);
  const [editingRecurringExpense, setEditingRecurringExpense] =
    useState<RecurringExpense | null>(null);
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setEditingRecurringExpense(null);
    setCancelConfirmId(null);
    setSelectedRecurringExpenseId(initialRecurringExpenseId ?? null);
    setView(initialRecurringExpenseId ? "details" : "list");
  }, [initialRecurringExpenseId, isOpen]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const { data: recurringExpenses, isLoading: isLoadingRecurringExpenses } =
    useRecurringExpenses({
      status: statusFilter === "all" ? undefined : statusFilter,
      page,
      pageSize: PAGE_SIZE,
    });
  const { data: recurringExpenseDetails, isLoading: isLoadingDetails } =
    useRecurringExpenseById(selectedRecurringExpenseId);
  const { createRecurringExpense, isLoading: isCreating } =
    useCreateRecurringExpense();
  const { updateRecurringExpense, isLoading: isUpdating } =
    useUpdateRecurringExpense();
  const { cancelRecurringExpense, isLoading: isCancelling } =
    useCancelRecurringExpense();

  const formInitialData = useMemo(() => {
    if (!editingRecurringExpense) {
      return getDefaultFormData();
    }

    return toFormData(editingRecurringExpense);
  }, [editingRecurringExpense]);

  const recurringItems = recurringExpenses?.items ?? [];
  const isSubmitting = isCreating || isUpdating;
  const isListView = view === "list";
  const isDetailsView = view === "details";
  const isFormView = view === "form";

  const handleClose = () => {
    onClose();
  };

  const handleOpenList = () => {
    setEditingRecurringExpense(null);
    setSelectedRecurringExpenseId(null);
    setView("list");
  };

  const handleOpenCreate = () => {
    setEditingRecurringExpense(null);
    setSelectedRecurringExpenseId(null);
    setView("form");
  };

  const handleOpenDetails = (recurringExpenseId: string) => {
    setEditingRecurringExpense(null);
    setSelectedRecurringExpenseId(recurringExpenseId);
    setView("details");
  };

  const handleOpenEdit = (recurringExpense: RecurringExpense) => {
    setEditingRecurringExpense(recurringExpense);
    setSelectedRecurringExpenseId(recurringExpense.id);
    setView("form");
  };

  const handleCloseForm = () => {
    if (selectedRecurringExpenseId) {
      setView("details");
      return;
    }

    setView("list");
  };

  const handleSubmit = async (data: ExpenseFormData) => {
    if (editingRecurringExpense) {
      await updateRecurringExpense({
        id: editingRecurringExpense.id,
        data: {
          categoryId: data.categoryId,
          description: data.description,
          amount: data.amount,
          paymentMethod: data.paymentMethod as PaymentMethod,
          startDate: data.dueDate,
          endDate: data.endDate || undefined,
        },
      });

      setSelectedRecurringExpenseId(editingRecurringExpense.id);
      setView("details");
      return;
    }

    const createdRecurringExpense = await createRecurringExpense({
      categoryId: data.categoryId,
      description: data.description,
      amount: data.amount,
      paymentMethod: data.paymentMethod as PaymentMethod,
      startDate: data.dueDate,
      endDate: data.endDate || undefined,
    });

    setSelectedRecurringExpenseId(createdRecurringExpense.id);
    setView("details");
  };

  const handleCancelRecurring = async () => {
    if (!cancelConfirmId) {
      return;
    }

    await cancelRecurringExpense(cancelConfirmId);
    setCancelConfirmId(null);
  };

  const title = isFormView
    ? editingRecurringExpense
      ? "Editar recorrência"
      : "Nova recorrência"
    : isDetailsView
      ? "Detalhes da recorrência"
      : "Gerenciar recorrências";

  const description = isFormView
    ? editingRecurringExpense
      ? "Atualize a série inteira. As mudanças afetam os próximos lançamentos gerados."
      : "Cadastre uma nova série mensal de despesa."
    : isDetailsView
      ? "Acompanhe o estado atual da série e seus próximos vencimentos."
      : "Encontre séries recorrentes, acompanhe o status e faça ajustes sem sair da tela de despesas.";

  const footer = isFormView ? undefined : (
    <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
      {!isListView && (
        <Button
          type="button"
          variant="outline"
          onClick={handleOpenList}
          className="w-full sm:w-auto"
        >
          Voltar para a lista
        </Button>
      )}
      {isDetailsView && recurringExpenseDetails && (
        <>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenEdit(recurringExpenseDetails)}
            disabled={
              recurringExpenseDetails.status !== RecurringExpenseStatus.ACTIVE
            }
            className="w-full sm:w-auto"
          >
            Editar série
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => setCancelConfirmId(recurringExpenseDetails.id)}
            disabled={
              recurringExpenseDetails.status !== RecurringExpenseStatus.ACTIVE
            }
            className="w-full sm:w-auto"
          >
            Cancelar série
          </Button>
        </>
      )}
      <Button
        type="button"
        variant="outline"
        onClick={handleClose}
        className="w-full sm:w-auto"
      >
        Fechar
      </Button>
    </div>
  );

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={title}
        description={description}
        className={isListView ? "sm:max-w-5xl" : "sm:max-w-2xl"}
        footer={footer}
      >
        {isListView ? (
          <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as typeof statusFilter)
                }
              >
                <SelectTrigger className="w-full sm:w-52">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value={RecurringExpenseStatus.ACTIVE}>
                    Ativas
                  </SelectItem>
                  <SelectItem value={RecurringExpenseStatus.COMPLETED}>
                    Concluídas
                  </SelectItem>
                  <SelectItem value={RecurringExpenseStatus.CANCELLED}>
                    Canceladas
                  </SelectItem>
                </SelectContent>
              </Select>

              <Button type="button" onClick={handleOpenCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Nova recorrência
              </Button>
            </div>

            {isLoadingRecurringExpenses ? (
              <div className="space-y-4">
                {[
                  "recurring-skeleton-1",
                  "recurring-skeleton-2",
                  "recurring-skeleton-3",
                  "recurring-skeleton-4",
                ].map((key) => (
                  <Skeleton key={key} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            ) : recurringItems.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="pl-6">Série</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead className="text-center">
                          Próximo vencimento
                        </TableHead>
                        <TableHead className="text-center">Valor</TableHead>
                        <TableHead className="text-center">Geradas</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="pr-6 text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recurringItems.map((recurringExpense) => {
                        const status = statusConfig[recurringExpense.status];

                        return (
                          <TableRow key={recurringExpense.id}>
                            <TableCell className="pl-6">
                              <div className="space-y-1">
                                <div className="font-medium">
                                  {recurringExpense.description}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Início em{" "}
                                  {formatDate(recurringExpense.startDate)}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{recurringExpense.categoryName}</TableCell>
                            <TableCell className="text-center text-sm text-muted-foreground">
                              {formatDate(recurringExpense.nextDueDate)}
                            </TableCell>
                            <TableCell className="text-center font-semibold">
                              {formatCurrency(recurringExpense.amount)}
                            </TableCell>
                            <TableCell className="text-center">
                              {recurringExpense.generatedOccurrencesCount}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge className={status.className}>
                                {status.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="pr-6 text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    handleOpenDetails(recurringExpense.id)
                                  }
                                >
                                  <EyeIcon className="h-4 w-4" />
                                  <span className="sr-only">Ver detalhes</span>
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleOpenEdit(recurringExpense)}
                                  disabled={
                                    recurringExpense.status !==
                                    RecurringExpenseStatus.ACTIVE
                                  }
                                >
                                  <Edit2 className="h-4 w-4" />
                                  <span className="sr-only">Editar série</span>
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    setCancelConfirmId(recurringExpense.id)
                                  }
                                  disabled={
                                    recurringExpense.status !==
                                    RecurringExpenseStatus.ACTIVE
                                  }
                                >
                                  <XCircleIcon className="h-4 w-4" />
                                  <span className="sr-only">
                                    Cancelar série
                                  </span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {recurringExpenses && recurringExpenses.totalPages > 1 && (
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => page > 1 && setPage(page - 1)}
                          className={
                            page <= 1
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                          aria-disabled={page <= 1}
                        />
                      </PaginationItem>

                      {generatePaginationPages(
                        page,
                        recurringExpenses.totalPages,
                      ).map((pageNumber) =>
                        typeof pageNumber === "string" ? (
                          <PaginationItem key={pageNumber}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        ) : (
                          <PaginationItem key={pageNumber}>
                            <PaginationLink
                              onClick={() => setPage(Number(pageNumber))}
                              isActive={Number(pageNumber) === page}
                              className="cursor-pointer"
                            >
                              {pageNumber}
                            </PaginationLink>
                          </PaginationItem>
                        ),
                      )}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() =>
                            recurringExpenses &&
                            page < recurringExpenses.totalPages &&
                            setPage(page + 1)
                          }
                          className={
                            !recurringExpenses ||
                            page >= recurringExpenses.totalPages
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                          aria-disabled={
                            !recurringExpenses ||
                            page >= recurringExpenses.totalPages
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <RepeatIcon className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="mb-1 font-medium text-muted-foreground">
                  Nenhuma recorrência encontrada
                </p>
                <p className="text-sm text-muted-foreground/60">
                  Ajuste os filtros ou crie uma nova série recorrente.
                </p>
              </div>
            )}
          </div>
        ) : isFormView ? (
          <ExpenseForm
            categories={categories}
            initialData={formInitialData}
            onSubmit={handleSubmit}
            onCancel={handleCloseForm}
            isSubmitting={isSubmitting}
            mode={
              editingRecurringExpense ? "edit-recurring" : "create-recurring"
            }
          />
        ) : isLoadingDetails || !recurringExpenseDetails ? (
          <div className="space-y-3">
            {[
              "detail-skeleton-1",
              "detail-skeleton-2",
              "detail-skeleton-3",
              "detail-skeleton-4",
            ].map((key) => (
              <Skeleton key={key} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <RecurringExpenseDetails recurringExpense={recurringExpenseDetails} />
        )}
      </Modal>

      <AlertDialog
        open={!!cancelConfirmId}
        onOpenChange={(open) => !open && setCancelConfirmId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar esta recorrência?</AlertDialogTitle>
            <AlertDialogDescription>
              A série será encerrada e os lançamentos pendentes com vencimento
              após hoje serão cancelados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelRecurring}
              disabled={isCancelling}
            >
              {isCancelling ? "Cancelando..." : "Confirmar cancelamento"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
