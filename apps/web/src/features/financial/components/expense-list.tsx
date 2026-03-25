import { format } from "date-fns";
import {
  AlertCircleIcon,
  CalendarIcon,
  CheckCircle2Icon,
  ClockIcon,
  Edit2,
  EllipsisVerticalIcon,
  RepeatIcon,
  Trash2,
  Wallet,
} from "lucide-react";
import { useState } from "react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { type Expense, ExpenseStatus } from "../types";

const statusConfig = {
  [ExpenseStatus.PAID]: {
    label: "Pago",
    variant: "default" as const,
    icon: CheckCircle2Icon,
    className:
      "bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700",
  },
  [ExpenseStatus.PENDING]: {
    label: "Pendente",
    variant: "secondary" as const,
    icon: ClockIcon,
    className:
      "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-700",
  },
  [ExpenseStatus.OVERDUE]: {
    label: "Vencido",
    variant: "destructive" as const,
    icon: AlertCircleIcon,
    className:
      "bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-700",
  },
  [ExpenseStatus.DUE_TODAY]: {
    label: "Vence Hoje",
    variant: "outline" as const,
    icon: CalendarIcon,
    className:
      "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700",
  },
  [ExpenseStatus.CANCELLED]: {
    label: "Cancelado",
    variant: "secondary" as const,
    icon: AlertCircleIcon,
    className:
      "bg-gray-100 dark:bg-gray-950 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700",
  },
};

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onMarkAsPaid: (expense: Expense) => void;
  onDelete: (id: string) => void;
  onOpenRecurringExpense: (recurringExpenseId: string) => void;
}

export function ExpenseList({
  expenses,
  onEdit,
  onDelete,
  onMarkAsPaid,
  onOpenRecurringExpense,
}: ExpenseListProps) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const handleMarkAsPaid = (expense: Expense) => {
    onMarkAsPaid(expense);
  };

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <Wallet className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground mb-1 font-medium">
          Nenhuma despesa cadastrada
        </p>
        <p className="text-sm text-muted-foreground/60">
          Tudo limpo por aqui neste mês!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent px-4">
              <TableHead className="pl-6">Lançamento</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-center">Vencimento</TableHead>
              <TableHead className="text-center">Pagamento</TableHead>
              <TableHead className="text-center">Valor</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right pr-6">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => {
              const config = statusConfig[expense.status];
              const StatusIcon = config.icon;
              return (
                <TableRow key={expense.id} className="px-4">
                  <TableCell className="pl-6 flex items-center gap-2">
                    {expense.recurringExpenseId && (
                      <Badge asChild variant="outline">
                        <button
                          type="button"
                          className="w-fit cursor-pointer gap-1 text-[10px] uppercase tracking-wider"
                          onClick={() =>
                            expense.recurringExpenseId &&
                            onOpenRecurringExpense(expense.recurringExpenseId)
                          }
                        >
                          <RepeatIcon className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    <div className="space-y-1">
                      <div className="font-medium text-foreground">
                        {expense.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="font-semibold text-[10px] uppercase py-0.5 tracking-wider"
                    >
                      {expense.categoryName}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center text-sm text-muted-foreground">
                    {expense.dueDate
                      ? format(new Date(expense.dueDate), "dd/MM/yyyy")
                      : "-"}
                  </TableCell>
                  <TableCell className="text-center text-sm text-muted-foreground">
                    {expense.paymentDate
                      ? format(new Date(expense.paymentDate), "dd/MM/yyyy")
                      : "-"}
                  </TableCell>
                  <TableCell className="text-center font-bold">
                    {formatCurrency(expense.amount)}
                  </TableCell>
                  <TableCell className="text-center text-sm text-muted-foreground">
                    <Badge className={config.className}>
                      <StatusIcon className="mr-1 h-3 w-3" />
                      {config.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <EllipsisVerticalIcon className="h-4 w-4" />
                          <span className="sr-only">Ações</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => onEdit(expense)}
                          disabled={
                            expense.status === ExpenseStatus.PAID ||
                            expense.status === ExpenseStatus.CANCELLED
                          }
                        >
                          <Edit2 className="h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        {expense.status !== ExpenseStatus.PAID &&
                          expense.status !== ExpenseStatus.CANCELLED && (
                            <DropdownMenuItem
                              onClick={() => handleMarkAsPaid(expense)}
                            >
                              <CheckCircle2Icon className="h-4 w-4" />
                              Marcar como Pago
                            </DropdownMenuItem>
                          )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setDeleteConfirmId(expense.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={!!deleteConfirmId}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Tem certeza que deseja excluir esta despesa?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso excluirá permanentemente a
              despesa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteConfirmId) onDelete(deleteConfirmId);
                setDeleteConfirmId(null);
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
