import { format } from "date-fns";
import {
  Check,
  Edit2,
  EllipsisVerticalIcon,
  Trash2,
  Wallet,
  X,
} from "lucide-react";
import { useState } from "react";
import { InputMoney } from "@/shared/components/input-money";
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
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import type { Expense, ExpenseCategory, PaymentMethod } from "../types";
import { paymentMethodLabels } from "../types";

interface ExpenseListProps {
  expenses: Expense[];
  categories: ExpenseCategory[];
  onEdit: (id: string, data: EditExpenseData) => void;
  onDelete: (id: string) => void;
}

export interface EditExpenseData {
  categoryId: string;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  date: string;
}

export function ExpenseList({
  expenses,
  categories,
  onEdit,
  onDelete,
}: ExpenseListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<EditExpenseData | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const handleStartEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setEditData({
      categoryId: expense.categoryId,
      description: expense.description,
      amount: expense.amount,
      paymentMethod: expense.paymentMethod,
      date: expense.paymentDate || expense.dueDate,
    });
  };

  const handleSaveEdit = () => {
    if (editingId && editData) {
      onEdit(editingId, editData);
      setEditingId(null);
      setEditData(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData(null);
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
                {editingId === expense.id && editData ? (
                  <>
                    <TableCell className="pl-6">
                      <Input
                        value={editData.description}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            description: e.target.value,
                          })
                        }
                        className="h-8 text-sm"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={editData.categoryId}
                        onValueChange={(v) =>
                          setEditData({ ...editData, categoryId: v })
                        }
                      >
                        <SelectTrigger
                          size="sm"
                          className="h-8 text-sm px-2 w-full"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Select
                        value={editData.paymentMethod.toString()}
                        onValueChange={(v) =>
                          setEditData({
                            ...editData,
                            paymentMethod: v as PaymentMethod,
                          })
                        }
                      >
                        <SelectTrigger
                          size="sm"
                          className="h-8 text-sm px-2 w-full"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(paymentMethodLabels).map(([k, l]) => (
                            <SelectItem key={k} value={k}>
                              {l}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="date"
                        value={editData.date}
                        onChange={(e) =>
                          setEditData({ ...editData, date: e.target.value })
                        }
                        className="h-8 text-sm"
                      />
                    </TableCell>
                    <TableCell>
                      <InputMoney
                        value={editData.amount}
                        onChange={(v) =>
                          setEditData({ ...editData, amount: v })
                        }
                        className="h-8 text-sm text-right font-medium"
                      />
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-primary"
                          onClick={handleSaveEdit}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground"
                          onClick={handleCancelEdit}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </>
                ) : (
                  <>
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
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <EllipsisVerticalIcon className="h-4 w-4" />
                            <span className="sr-only">Ações</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleStartEdit(expense)}
                          >
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
                  </>
                )}
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
