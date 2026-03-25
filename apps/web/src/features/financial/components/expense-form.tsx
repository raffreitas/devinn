import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { InputMoney } from "@/shared/components/input-money";
import { Button } from "@/shared/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import type { ExpenseCategory } from "../types";
import { paymentMethodLabels } from "../types";
import { CategorySelect } from "./category-select";

const expenseFormSchema = z
  .object({
    isRecurring: z.boolean(),
    categoryId: z.string().min(1, "Categoria é obrigatória"),
    description: z
      .string()
      .min(1, "Descrição é obrigatória")
      .max(500, "Descrição não pode ter mais de 500 caracteres"),
    amount: z.number().min(0.01, "Valor deve ser maior que zero"),
    paymentMethod: z.string({ error: "Método de pagamento é obrigatório" }),
    dueDate: z.string().min(1, "Data de vencimento é obrigatória"),
    paymentDate: z.string().optional(),
    endDate: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.isRecurring && data.paymentDate && data.paymentDate < data.dueDate) {
      ctx.addIssue({
        code: "custom",
        path: ["paymentDate"],
        message: "Data de pagamento não pode ser anterior à data de vencimento",
      });
    }

    if (data.isRecurring && data.paymentDate) {
      ctx.addIssue({
        code: "custom",
        path: ["paymentDate"],
        message: "Despesa recorrente não aceita data de pagamento no cadastro da série",
      });
    }

    if (data.isRecurring && data.endDate && data.endDate < data.dueDate) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "Data final não pode ser anterior ao primeiro vencimento",
      });
    }
  });

export type ExpenseFormData = z.infer<typeof expenseFormSchema>;

interface ExpenseFormProps {
  categories: ExpenseCategory[];
  initialData?: ExpenseFormData;
  onSubmit: (data: ExpenseFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "edit";
}

const getDefaultExpenseFormData = (): ExpenseFormData => ({
  isRecurring: false,
  categoryId: "",
  description: "",
  amount: 0,
  paymentMethod: "Cash",
  dueDate: new Date().toISOString().split("T")[0],
  paymentDate: "",
  endDate: "",
});

export function ExpenseForm({
  categories,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  mode = "create",
}: ExpenseFormProps) {
  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: initialData || getDefaultExpenseFormData(),
  });

  const isRecurring = form.watch("isRecurring");

  useEffect(() => {
    form.reset(initialData || getDefaultExpenseFormData());
  }, [form, initialData]);

  useEffect(() => {
    if (!isRecurring) {
      return;
    }

    form.setValue("paymentDate", "", { shouldValidate: true });
  }, [form, isRecurring]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mode === "create" && (
            <FormField
              control={form.control}
              name="isRecurring"
              render={({ field }) => (
                <FormItem className="md:col-span-2 rounded-lg border p-4">
                  <div className="flex items-start gap-3">
                    <FormControl>
                      <Input
                        type="checkbox"
                        checked={field.value}
                        onChange={(event) => field.onChange(event.target.checked)}
                        className="mt-1 h-4 w-4"
                      />
                    </FormControl>
                    <div className="space-y-1">
                      <FormLabel>Despesa recorrente mensal</FormLabel>
                      <FormDescription>
                        O sistema criará uma série mensal usando o dia do primeiro vencimento.
                      </FormDescription>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Conta de luz" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor</FormLabel>
                <FormControl>
                  <InputMoney {...field} placeholder="R$ 0,00" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <FormControl>
                  <CategorySelect
                    value={field.value}
                    onChange={field.onChange}
                    categories={categories}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {isRecurring ? "Primeiro vencimento" : "Data de vencimento"}
                </FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                {isRecurring && (
                  <FormDescription>
                    As próximas despesas serão geradas todo mês neste mesmo dia.
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Método de Pagamento</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o método" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(paymentMethodLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {isRecurring ? (
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data final da recorrência</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormDescription>
                    Deixe em branco para manter a recorrência ativa por tempo indeterminado.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <FormField
              control={form.control}
              name="paymentDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de pagamento</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormDescription>
                    Deixe em branco se a despesa ainda não foi paga.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Salvando..."
              : mode === "create"
                ? "Cadastrar"
                : "Salvar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
