import { format } from "date-fns";
import { Badge } from "@/shared/components/ui/badge";
import { paymentMethodLabels, type RecurringExpense } from "../types";

const statusConfig = {
  Active: {
    label: "Ativa",
    className:
      "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-700",
  },
  Completed: {
    label: "Concluída",
    className:
      "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700",
  },
  Cancelled: {
    label: "Cancelada",
    className:
      "bg-gray-100 dark:bg-gray-950 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700",
  },
} as const;

interface RecurringExpenseDetailsProps {
  recurringExpense: RecurringExpense;
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

export function RecurringExpenseDetails({
  recurringExpense,
}: RecurringExpenseDetailsProps) {
  const status = statusConfig[recurringExpense.status];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">
            {recurringExpense.description}
          </h3>
          <p className="text-sm text-muted-foreground">
            {recurringExpense.categoryName}
          </p>
        </div>
        <Badge className={status.className}>{status.label}</Badge>
      </div>

      <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
        <div className="space-y-1 rounded-lg border p-3">
          <dt className="text-muted-foreground">Valor</dt>
          <dd className="font-semibold">
            {formatCurrency(recurringExpense.amount)}
          </dd>
        </div>
        <div className="space-y-1 rounded-lg border p-3">
          <dt className="text-muted-foreground">Método de pagamento</dt>
          <dd className="font-semibold">
            {paymentMethodLabels[recurringExpense.paymentMethod]}
          </dd>
        </div>
        <div className="space-y-1 rounded-lg border p-3">
          <dt className="text-muted-foreground">Data inicial</dt>
          <dd className="font-semibold">
            {formatDate(recurringExpense.startDate)}
          </dd>
        </div>
        <div className="space-y-1 rounded-lg border p-3">
          <dt className="text-muted-foreground">Dia da recorrência</dt>
          <dd className="font-semibold">
            Todo dia {recurringExpense.dayOfMonth}
          </dd>
        </div>
        <div className="space-y-1 rounded-lg border p-3">
          <dt className="text-muted-foreground">Próximo vencimento</dt>
          <dd className="font-semibold">
            {formatDate(recurringExpense.nextDueDate)}
          </dd>
        </div>
        <div className="space-y-1 rounded-lg border p-3">
          <dt className="text-muted-foreground">Último lançamento gerado</dt>
          <dd className="font-semibold">
            {formatDate(recurringExpense.lastGeneratedDueDate)}
          </dd>
        </div>
        <div className="space-y-1 rounded-lg border p-3">
          <dt className="text-muted-foreground">Data final</dt>
          <dd className="font-semibold">
            {formatDate(recurringExpense.endDate)}
          </dd>
        </div>
        <div className="space-y-1 rounded-lg border p-3">
          <dt className="text-muted-foreground">Ocorrências geradas</dt>
          <dd className="font-semibold">
            {recurringExpense.generatedOccurrencesCount}
          </dd>
        </div>
      </dl>
    </div>
  );
}
