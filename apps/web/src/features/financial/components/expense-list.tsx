import { format } from "date-fns";
import {
  Edit2,
  EllipsisVerticalIcon,
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
import type { Expense } from "../types";
import { paymentMethodLabels } from "../types";

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export function ExpenseList({
  expenses,
  onEdit,
  onDelete,
}: ExpenseListProps) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
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
              <TableHead className="hidden sm:table-cell">Pagamento</TableHead>
              <TableHead className="text-center">Data</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="text-right pr-6">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense.id} className="px-4">
                <TableCell className="pl-6">
                  <div className="font-medium text-foreground">
                    {expense.description}
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
                <TableCell className="hidden sm:table-cell">
                  <span className="text-sm text-muted-foreground">
                    {paymentMethodLabels[expense.paymentMethod]}
                  </span>
                </TableCell>
                <TableCell className="text-center text-sm text-muted-foreground">
                  {format(
                    new Date(expense.paymentDate || expense.dueDate),
                    "dd/MM/yyyy",
                  )}
                </TableCell>
                <TableCell className="text-right font-bold text-destructive">
                  {formatCurrency(expense.amount)}
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
                      <DropdownMenuItem onClick={() => onEdit(expense)}>
                        <Edit2 className="h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
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
            ))}
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
