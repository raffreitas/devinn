import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { InputMoney } from "@/shared/components/input-money";
import { Button } from "@/shared/components/ui/button";
import {
  Form,
  FormControl,
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

const expenseFormSchema = z.object({
  categoryId: z.string().min(1, "Categoria é obrigatória"),
  description: z
    .string()
    .min(1, "Descrição é obrigatória")
    .max(500, "Descrição não pode ter mais de 500 caracteres"),
  amount: z.number().min(0.01, "Valor deve ser maior que zero"),
  paymentMethod: z.string({ error: "Método de pagamento é obrigatório" }),
  date: z.string().min(1, "Data é obrigatória"),
});

export type ExpenseFormData = z.infer<typeof expenseFormSchema>;

interface ExpenseFormProps {
  categories: ExpenseCategory[];
  initialData?: ExpenseFormData;
  onSubmit: (data: ExpenseFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const getDefaultExpenseFormData = (): ExpenseFormData => ({
  categoryId: "",
  description: "",
  amount: 0,
  paymentMethod: "Cash",
  date: new Date().toISOString().split("T")[0],
});

export function ExpenseForm({
  categories,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}: ExpenseFormProps) {
  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: initialData || getDefaultExpenseFormData(),
  });

  useEffect(() => {
    form.reset(initialData || getDefaultExpenseFormData());
  }, [form, initialData]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
