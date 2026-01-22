import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { InputMoney } from "@/shared/components/input-money";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
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
import { useCreateExpenseCategory } from "../hooks/use-expense-categories";
import type { ExpenseCategory } from "../types";
import { paymentMethodLabels } from "../types";

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

export function ExpenseForm({
  categories,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}: ExpenseFormProps) {
  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: initialData || {
      categoryId: "",
      description: "",
      amount: 0,
      paymentMethod: "Cash",
      date: new Date().toISOString().split("T")[0],
    },
  });

  // Local copy to allow optimistic creation of categories inside this form
  const [localCategories, setLocalCategories] =
    useState<ExpenseCategory[]>(categories);
  useEffect(() => setLocalCategories(categories), [categories]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Simple create form schema for category
  const createSchema = z.object({
    name: z
      .string("Nome inválido")
      .min(1, { error: "O nome é obrigatório" })
      .max(100, { error: "O nome deve ter no máximo 100 caracteres" }),
  });
  type CreateData = z.infer<typeof createSchema>;
  const createForm = useForm<CreateData>({
    resolver: zodResolver(createSchema),
    defaultValues: { name: "" },
  });

  const { createCategory } = useCreateExpenseCategory();

  const handleCreateCategory = async (data: CreateData) => {
    // optimistic local category while waiting the API
    const tempId = `temp-${Date.now()}`;
    const temp: ExpenseCategory = {
      id: tempId,
      name: data.name,
    } as ExpenseCategory;
    setLocalCategories((prev) => [temp, ...prev]);
    form.setValue("categoryId", tempId, { shouldValidate: true });

    try {
      const res = await createCategory(data.name);
      // replace temp id with real id returned from API
      setLocalCategories((prev) =>
        prev.map((c) => (c.id === tempId ? { ...c, id: res.id } : c)),
      );
      form.setValue("categoryId", res.id, { shouldValidate: true });
      createForm.reset();
      setIsCreateOpen(false);
    } catch {
      // roll back optimistic update
      setLocalCategories((prev) => prev.filter((c) => c.id !== tempId));
      form.setValue("categoryId", "", { shouldValidate: true });
    }
  };

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
                <Select
                  onValueChange={(val) => {
                    if (val === "__add__") {
                      setIsCreateOpen(true);
                      return;
                    }
                    field.onChange(val);
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {/* existing categories */}
                    {localCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                    {/* creatable action */}
                    <SelectItem key="__add__" value="__add__">
                      <span className="italic">+ Adicionar categoria...</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />

                {/* Dialog to create category */}
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar categoria</DialogTitle>
                    </DialogHeader>

                    <Form {...createForm}>
                      <form
                        onSubmit={createForm.handleSubmit(handleCreateCategory)}
                        className="space-y-4"
                      >
                        <FormField
                          control={createForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome</FormLabel>
                              <FormControl>
                                <Input placeholder="Ex: Internet" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              createForm.reset();
                              setIsCreateOpen(false);
                            }}
                          >
                            Cancelar
                          </Button>
                          <Button type="submit">Criar</Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Método de Pagamento</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value?.toString()}
                >
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
