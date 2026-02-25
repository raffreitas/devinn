import { zodResolver } from "@hookform/resolvers/zod";
import { forwardRef, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useRoomCategories } from "../hooks";
import { type RoomFormData, roomSchema } from "../types";

type RoomFormProps = {
  initialData?: RoomFormData & { id?: string };
  isSubmitting?: boolean;
  onSubmit: (data: RoomFormData) => void | Promise<void>;
  onCancel?: () => void;
  showActions?: boolean;
};

export interface RoomFormRef {
  validate: () => Promise<RoomFormData | null>;
}

export const RoomForm = forwardRef<RoomFormRef, RoomFormProps>(
  function RoomForm(
    { initialData: room, onSubmit, onCancel, showActions = true },
    ref,
  ) {
    const { data: categories } = useRoomCategories();

    const form = useForm<RoomFormData>({
      resolver: zodResolver(roomSchema),
      defaultValues: {
        categoryId: room?.categoryId || "",
        number: room?.number || 1,
        status: room?.status || "Active",
        description: room?.description || "",
      },
    });

    useImperativeHandle(ref, () => ({
      validate: async () => {
        const isValid = await form.trigger();
        return isValid ? form.getValues() : null;
      },
    }));

    return (
      <Form {...form}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (showActions) {
              form.handleSubmit(onSubmit)(e);
            }
          }}
          className="space-y-4"
          id="room-form"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger
                        className="w-full h-9"
                        data-size="default"
                      >
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
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
              name="number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número do Quarto</FormLabel>
                  <FormControl>
                    <InputNumber placeholder="Ex: 101" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full h-9" data-size="default">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Active">Ativo</SelectItem>
                    <SelectItem value="Maintenance">Manutenção</SelectItem>
                    <SelectItem value="Inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição (opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="Descrição do quarto" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {showActions && onCancel && (
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          )}
        </form>
      </Form>
    );
  },
);
