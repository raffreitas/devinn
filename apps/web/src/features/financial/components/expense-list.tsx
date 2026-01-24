import { format } from "date-fns";
import { Calendar, Check, Edit2, Trash2, Wallet, X } from "lucide-react";
import { useState } from "react";
import { InputMoney } from "@/shared/components/input-money";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
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
      {/* Mobile View: Cards */}
      <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
        {expenses.map((expense) => (
          <div
            key={expense.id}
            className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-3"
          >
            {editingId === expense.id && editData ? (
              <div className="space-y-3">
                <Input
                  value={editData.description}
                  onChange={(e) =>
                    setEditData({ ...editData, description: e.target.value })
                  }
                  placeholder="Descrição"
                  className="h-9"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Select
                    value={editData.categoryId}
                    onValueChange={(v) =>
                      setEditData({ ...editData, categoryId: v })
                    }
                  >
                    <SelectTrigger className="h-9">
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
                  <Input
                    type="date"
                    value={editData.date}
                    onChange={(e) =>
                      setEditData({ ...editData, date: e.target.value })
                    }
                    className="h-9"
                  />
                </div>
                <InputMoney
                  value={editData.amount}
                  onChange={(v) => setEditData({ ...editData, amount: v })}
                  className="h-9"
                />
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={handleSaveEdit}>
                    <Check className="w-4 h-4 mr-2" />
                    Salvar
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleCancelEdit}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-foreground">
                      {expense.description}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="secondary"
                        className="text-[10px] uppercase font-bold tracking-wider py-0 px-1.5 h-auto"
                      >
                        {expense.categoryName}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(
                          new Date(expense.paymentDate || expense.dueDate),
                          "dd/MM/yyyy",
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-destructive">
                      {formatCurrency(expense.amount)}
                    </p>
                    <span className="text-[10px] text-muted-foreground uppercase font-medium">
                      {paymentMethodLabels[expense.paymentMethod]}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8"
                    onClick={() => handleStartEdit(expense)}
                  >
                    <Edit2 className="w-3.5 h-3.5 mr-2" /> Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 text-destructive hover:text-destructive"
                    onClick={() => onDelete(expense.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-2" /> Excluir
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Desktop View: Table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent px-4">
              <TableHead className="pl-6">Lançamento</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Pagamento</TableHead>
              <TableHead className="text-center">Data</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="text-right pr-6">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense.id} className="group px-4">
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
                    <TableCell>
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
                    <TableCell>
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
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:text-primary"
                          onClick={() => handleStartEdit(expense)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:text-destructive"
                          onClick={() => onDelete(expense.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
