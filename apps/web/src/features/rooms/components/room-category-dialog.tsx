import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCreateRoomCategory, useUpdateRoomCategory, useDeleteRoomCategory } from '@/features/rooms/api/rooms-api';
import type { RoomCategory } from '@/types';

const categorySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  max_capacity: z.coerce.number().min(1, 'Capacidade mínima é 1').max(20, 'Capacidade máxima é 20'),
  base_price: z.coerce.number().min(0, 'Preço deve ser positivo'),
  extra_person_price: z.coerce.number().min(0, 'Preço deve ser positivo'),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface RoomCategoryDialogProps {
  open: boolean;
  onClose: () => void;
  category?: RoomCategory;
}

export function RoomCategoryDialog({ open, onClose, category }: RoomCategoryDialogProps) {
  const isEditing = !!category;
  const createMutation = useCreateRoomCategory();
  const updateMutation = useUpdateRoomCategory();
  const deleteMutation = useDeleteRoomCategory();

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      max_capacity: 2,
      base_price: 0,
      extra_person_price: 0,
    },
  });

  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        description: category.description || '',
        max_capacity: category.max_capacity,
        base_price: category.base_price,
        extra_person_price: category.extra_person_price,
      });
    } else {
      form.reset({
        name: '',
        description: '',
        max_capacity: 2,
        base_price: 0,
        extra_person_price: 0,
      });
    }
  }, [category, form]);

  const onSubmit = async (data: CategoryFormData) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: category.id, ...data });
      } else {
        await createMutation.mutateAsync(data);
      }
      onClose();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
    }
  };

  const handleDelete = async () => {
    if (!category) return;
    
    if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
      try {
        await deleteMutation.mutateAsync(category.id);
        onClose();
      } catch (error) {
        console.error('Erro ao excluir categoria:', error);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Categoria' : 'Nova Categoria'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Atualize as informações da categoria de quartos'
              : 'Crie uma nova categoria de quartos para sua pousada'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Categoria</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Chalé Master" {...field} />
                  </FormControl>
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
                    <Input placeholder="Descrição da categoria" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="max_capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacidade Máxima</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" max="20" {...field} />
                  </FormControl>
                  <FormDescription>
                    Número máximo de pessoas que podem se hospedar
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="base_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço Base (2 adultos)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="extra_person_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pessoa Extra</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-between pt-4">
              {isEditing && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? 'Excluindo...' : 'Excluir'}
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? 'Salvando...'
                    : isEditing
                    ? 'Atualizar'
                    : 'Criar'}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
