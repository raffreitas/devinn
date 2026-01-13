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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCreateRoom, useUpdateRoom, useDeleteRoom } from '@/features/rooms/api/rooms-api';
import type { Room, RoomCategory } from '@/types';

const roomSchema = z.object({
  number: z.coerce.number().min(1, 'Número é obrigatório'),
  name: z.string().optional(),
  category_id: z.string().min(1, 'Categoria é obrigatória'),
  status: z.enum(['active', 'maintenance', 'inactive']),
});

type RoomFormData = z.infer<typeof roomSchema>;

interface RoomDialogProps {
  open: boolean;
  onClose: () => void;
  room?: Room;
  categories: RoomCategory[];
}

export function RoomDialog({ open, onClose, room, categories }: RoomDialogProps) {
  const isEditing = !!room;
  const createMutation = useCreateRoom();
  const updateMutation = useUpdateRoom();
  const deleteMutation = useDeleteRoom();

  const form = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      number: 1,
      name: '',
      category_id: '',
      status: 'active',
    },
  });

  useEffect(() => {
    if (room) {
      form.reset({
        number: room.number,
        name: room.name || '',
        category_id: room.category_id,
        status: room.status,
      });
    } else {
      form.reset({
        number: 1,
        name: '',
        category_id: categories[0]?.id || '',
        status: 'active',
      });
    }
  }, [room, categories, form]);

  const onSubmit = async (data: RoomFormData) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: room.id, ...data });
      } else {
        await createMutation.mutateAsync(data);
      }
      onClose();
    } catch (error) {
      console.error('Erro ao salvar quarto:', error);
    }
  };

  const handleDelete = async () => {
    if (!room) return;

    if (window.confirm('Tem certeza que deseja excluir este quarto?')) {
      try {
        await deleteMutation.mutateAsync(room.id);
        onClose();
      } catch (error) {
        console.error('Erro ao excluir quarto:', error);
      }
    }
  };

  if (categories.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atenção</DialogTitle>
            <DialogDescription>
              Você precisa criar pelo menos uma categoria antes de cadastrar quartos.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={onClose}>Entendi</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Quarto' : 'Novo Quarto'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Atualize as informações do quarto'
              : 'Cadastre um novo quarto vinculado a uma categoria'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Chalé 01" {...field} />
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
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="maintenance">Em Manutenção</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
