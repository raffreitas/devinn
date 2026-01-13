import { useEffect, useState, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
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
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { useCreateBooking, useUpdateBooking } from '@/features/bookings/api/bookings-api';
import { useRooms, useRoomCategories } from '@/features/rooms/api/rooms-api';
import { calculateBookingPrice, calculateNights, formatCurrency } from '@/lib/booking-utils';
import type { Booking, Room, RoomCategory } from '@/types';

const bookingSchema = z.object({
  guest_name: z.string().min(1, 'Nome é obrigatório'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  document: z.string().optional(),
  birth_date: z.string().optional(),
  room_id: z.string().min(1, 'Quarto é obrigatório'),
  check_in: z.date({ required_error: 'Data de check-in é obrigatória' }),
  check_out: z.date({ required_error: 'Data de check-out é obrigatória' }),
  adults: z.coerce.number().min(1, 'Mínimo 1 adulto'),
  children: z.coerce.number().min(0, 'Não pode ser negativo'),
  children_ages: z.array(z.number().min(0).max(17)),
  notes: z.string().optional(),
}).refine((data) => data.check_out > data.check_in, {
  message: 'Check-out deve ser após o check-in',
  path: ['check_out'],
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingDialogProps {
  open: boolean;
  onClose: () => void;
  booking?: Booking;
  preselectedRoomId?: string;
  preselectedDate?: Date;
}

export function BookingDialog({
  open,
  onClose,
  booking,
  preselectedRoomId,
  preselectedDate,
}: BookingDialogProps) {
  const isEditing = !!booking;
  const { data: rooms = [] } = useRooms();
  const { data: categories = [] } = useRoomCategories();
  const createMutation = useCreateBooking();
  const updateMutation = useUpdateBooking();

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      guest_name: '',
      phone: '',
      email: '',
      document: '',
      birth_date: '',
      room_id: '',
      check_in: undefined,
      check_out: undefined,
      adults: 2,
      children: 0,
      children_ages: [],
      notes: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'children_ages',
  });

  const watchRoomId = form.watch('room_id');
  const watchCheckIn = form.watch('check_in');
  const watchCheckOut = form.watch('check_out');
  const watchAdults = form.watch('adults');
  const watchChildren = form.watch('children');
  const watchChildrenAges = form.watch('children_ages');

  // Ajustar array de idades quando número de crianças muda
  useEffect(() => {
    const currentAges = form.getValues('children_ages') || [];
    const diff = watchChildren - currentAges.length;

    if (diff > 0) {
      for (let i = 0; i < diff; i++) {
        append(0);
      }
    } else if (diff < 0) {
      for (let i = 0; i < Math.abs(diff); i++) {
        remove(currentAges.length - 1 - i);
      }
    }
  }, [watchChildren, append, remove, form]);

  // Resetar form quando abrir/fechar
  useEffect(() => {
    if (booking) {
      form.reset({
        guest_name: booking.guest_name,
        phone: booking.phone,
        email: booking.email || '',
        document: booking.document || '',
        birth_date: booking.birth_date || '',
        room_id: booking.room_id,
        check_in: new Date(booking.check_in),
        check_out: new Date(booking.check_out),
        adults: booking.adults,
        children: booking.children,
        children_ages: booking.children_ages || [],
        notes: booking.notes || '',
      });
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfter = new Date();
      dayAfter.setDate(dayAfter.getDate() + 2);

      form.reset({
        guest_name: '',
        phone: '',
        email: '',
        document: '',
        birth_date: '',
        room_id: preselectedRoomId || '',
        check_in: preselectedDate || tomorrow,
        check_out: dayAfter,
        adults: 2,
        children: 0,
        children_ages: [],
        notes: '',
      });
    }
  }, [booking, preselectedRoomId, preselectedDate, form, open]);

  // Obter categoria do quarto selecionado
  const selectedRoom = useMemo(() => {
    return rooms.find(r => r.id === watchRoomId);
  }, [rooms, watchRoomId]);

  const selectedCategory = useMemo(() => {
    if (!selectedRoom) return null;
    return categories.find(c => c.id === selectedRoom.category_id);
  }, [selectedRoom, categories]);

  // Calcular valores
  const pricing = useMemo(() => {
    if (!selectedCategory || !watchCheckIn || !watchCheckOut) {
      return null;
    }

    const nights = calculateNights(watchCheckIn, watchCheckOut);
    return calculateBookingPrice(
      selectedCategory.base_price,
      selectedCategory.extra_person_price,
      watchAdults,
      watchChildrenAges,
      nights
    );
  }, [selectedCategory, watchCheckIn, watchCheckOut, watchAdults, watchChildrenAges]);

  // Validar capacidade
  const capacityError = useMemo(() => {
    if (!selectedCategory) return null;
    const totalPeople = watchAdults + watchChildren;
    if (totalPeople > selectedCategory.max_capacity) {
      return `Capacidade máxima de ${selectedCategory.max_capacity} pessoas excedida`;
    }
    return null;
  }, [selectedCategory, watchAdults, watchChildren]);

  const onSubmit = async (data: BookingFormData) => {
    if (capacityError || !pricing) {
      return;
    }

    try {
      const payload = {
        ...data,
        check_in: format(data.check_in, 'yyyy-MM-dd'),
        check_out: format(data.check_out, 'yyyy-MM-dd'),
        total_value: pricing.totalValue,
        paid_value: booking?.paid_value || 0,
        source: 'manual' as const,
        cancellation_status: false,
      };

      if (isEditing) {
        await updateMutation.mutateAsync({ id: booking.id, ...payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onClose();
    } catch (error: any) {
      console.error('Erro ao salvar reserva:', error);
      form.setError('root', {
        message: error.response?.data?.message || 'Erro ao salvar reserva',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Reserva' : 'Nova Reserva'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Atualize as informações da reserva'
              : 'Crie uma nova reserva manual'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Dados do Hóspede */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Dados do Hóspede</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="guest_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo *</FormLabel>
                      <FormControl>
                        <Input placeholder="João da Silva" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone *</FormLabel>
                      <FormControl>
                        <Input placeholder="(11) 99999-9999" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="joao@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="document"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF</FormLabel>
                      <FormControl>
                        <Input placeholder="000.000.000-00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Dados da Reserva */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Dados da Reserva</h3>
              
              <FormField
                control={form.control}
                name="room_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quarto *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um quarto" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {rooms
                          .filter(r => r.status === 'active')
                          .map((room) => {
                            const category = categories.find(c => c.id === room.category_id);
                            return (
                              <SelectItem key={room.id} value={room.id}>
                                {room.name || `Quarto ${room.number}`} - {category?.name}
                              </SelectItem>
                            );
                          })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="check_in"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Check-in *</FormLabel>
                      <FormControl>
                        <DatePicker
                          date={field.value}
                          onSelect={field.onChange}
                          placeholder="Selecione a data"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="check_out"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Check-out *</FormLabel>
                      <FormControl>
                        <DatePicker
                          date={field.value}
                          onSelect={field.onChange}
                          placeholder="Selecione a data"
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
                  name="adults"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adultos *</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="children"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Crianças</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {watchChildren > 0 && (
                <div className="space-y-2">
                  <FormLabel>Idades das Crianças</FormLabel>
                  <div className="grid grid-cols-4 gap-2">
                    {fields.map((field, index) => (
                      <FormField
                        key={field.id}
                        control={form.control}
                        name={`children_ages.${index}`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                max="17"
                                placeholder={`Criança ${index + 1}`}
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormDescription>
                    0-4 anos: Gratuito | 5-10 anos: 50% | 11+ anos: Valor integral
                  </FormDescription>
                </div>
              )}

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Observações sobre a reserva..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Resumo de Preços */}
            {pricing && selectedCategory && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="mb-4 text-lg font-semibold">Resumo de Valores</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Preço base (2 adultos):</span>
                      <span className="font-medium">{formatCurrency(pricing.basePrice)}</span>
                    </div>
                    
                    {pricing.extraAdultsCount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          {pricing.extraAdultsCount} adulto(s) extra:
                        </span>
                        <span className="font-medium">{formatCurrency(pricing.extraAdultsPrice)}</span>
                      </div>
                    )}

                    {pricing.childrenPrices.length > 0 && (
                      <div className="space-y-1">
                        {pricing.childrenPrices.map((child, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span className="text-gray-600">
                              Criança {idx + 1} ({child.age} anos, {child.discount} desconto):
                            </span>
                            <span className="font-medium">{formatCurrency(child.price)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="border-t pt-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal por diária:</span>
                        <span className="font-medium">{formatCurrency(pricing.dailyTotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Número de noites:
                        </span>
                        <span className="font-medium">{pricing.nights}</span>
                      </div>
                    </div>

                    <div className="border-t pt-2">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span className="text-green-600">{formatCurrency(pricing.totalValue)}</span>
                      </div>
                    </div>
                  </div>

                  {capacityError && (
                    <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-800">
                      {capacityError}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {form.formState.errors.root && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                {form.formState.errors.root.message}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={
                  createMutation.isPending ||
                  updateMutation.isPending ||
                  !!capacityError ||
                  !pricing
                }
              >
                {createMutation.isPending || updateMutation.isPending
                  ? 'Salvando...'
                  : isEditing
                  ? 'Atualizar'
                  : 'Criar Reserva'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
