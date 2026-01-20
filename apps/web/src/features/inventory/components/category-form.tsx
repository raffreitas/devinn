import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { InputMoney } from "@/shared/components/input-money";
import { InputNumber } from "@/shared/components/input-number";
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
import { type CategoryFormData, categorySchema } from "../types";

export type CategoryFormProps = {
  initialData: (CategoryFormData & { id?: string }) | null;
  isSubmitting?: boolean;
  onSubmit: (data: CategoryFormData) => void | Promise<void>;
  onCancel: () => void;
};

export function CategoryForm({
  initialData,
  isSubmitting,
  onCancel,
  onSubmit,
}: CategoryFormProps) {
  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      basePrice: initialData?.basePrice ?? 0,
      capacity: initialData?.capacity ?? 1,
      extraPersonPrice: initialData?.extraPersonPrice ?? 0,
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Chalé Individual" {...field} />
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
                  <InputNumber {...field} min={1} max={10} />
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
                <FormLabel>Preço Pessoa Extra</FormLabel>
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

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
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
