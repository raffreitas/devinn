import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import type { Category } from "../types";
import { InputMoney } from "@/shared/components/input-money";

const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  description: z
    .string()
    .max(500, "Descrição deve ter no máximo 500 caracteres")
    .optional(),
  capacity: z.coerce
    .number()
    .min(1, "Capacidade mínima é 1")
    .max(10, "Capacidade máxima é 10"),
  basePrice: z.coerce.number().min(0, "Preço base deve ser maior ou igual a 0"),
  extraPersonPrice: z.coerce
    .number()
    .min(0, "Preço extra deve ser maior ou igual a 0"),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  category?: Category;
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  onSubmit,
  category,
}: CategoryFormDialogProps) {
  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema) as any,
    defaultValues: {
      name: category?.name || "",
      description: category?.description || "",
      capacity: category?.capacity || 2,
      basePrice: category?.basePrice || 0,
      extraPersonPrice: category?.extraPersonPrice || 0,
    },
  });

  // Reset form when editing a category or when category prop changes
  useEffect(() => {
    form.reset({
      name: category?.name || "",
      description: category?.description || "",
      capacity: category?.capacity ?? 2,
      basePrice: category?.basePrice ?? 0,
      extraPersonPrice: category?.extraPersonPrice ?? 0,
    });
  }, [category, form]);

  const handleSubmit = async (data: CategoryFormData) => {
    await onSubmit(data);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {category ? "Editar Categoria" : "Nova Categoria"}
          </DialogTitle>
          <DialogDescription>
            {category
              ? "Atualize as informações da categoria"
              : "Adicione uma nova categoria de acomodação"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Suíte Master" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacidade (Pessoas)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Ex: 2"
                        {...field}
                        min={1}
                        max={10}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="basePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço Base</FormLabel>
                    <FormControl>
                      <InputMoney {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="extraPersonPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço Pessoa Extra (R$)</FormLabel>
                    <FormControl>
                      <InputMoney {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Descrição da categoria" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
