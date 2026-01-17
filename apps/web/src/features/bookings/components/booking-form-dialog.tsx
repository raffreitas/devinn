import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { roomService } from "@/features/inventory/services/room-service";
import { Button } from "@/shared/components/ui/button";
import { Calendar } from "@/shared/components/ui/calendar";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useTenant } from "@/shared/contexts/tenant-context";
import { cn } from "@/shared/lib/utils";
import { bookingService } from "../services/booking-service";
import type {
  Booking,
  CreateBookingRequest,
  UpdateBookingRequest,
} from "../types";

const bookingSchema = z
  .object({
    roomId: z.string().min(1, "Quarto é obrigatório"),
    checkIn: z.date({ error: "Data de check-in é obrigatória" }),
    checkOut: z.date({ error: "Data de check-out é obrigatória" }),
    adults: z.number().int().min(1, "Mínimo 1 adulto"),
    children: z.number().int().min(0, "Mínimo 0"),
    childrenAges: z
      .array(z.object({ age: z.number().min(0, "Idade inválida") }))
      .optional(),
    guestName: z.string().min(1, "Nome do hóspede é obrigatório"),
    guestEmail: z.email("E-mail inválido").optional().or(z.literal("")),
    guestPhone: z.string().min(10, "Telefone deve ter no mínimo 10 dígitos"),
    guestDocument: z.string().optional(),
    guestBirthDate: z.string().optional(), // YYYY-MM-DD
    notes: z.string().optional(),
  })
  .refine((data) => data.checkOut > data.checkIn, {
    message: "Data de check-out deve ser posterior ao check-in",
    path: ["checkOut"],
  });

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateBookingRequest) => Promise<void>;
  onUpdate?: (id: string, data: UpdateBookingRequest) => Promise<void>;
  booking?: Booking;
  preselectedRoom?: string;
  preselectedDate?: Date;
}

export function BookingFormDialog({
  open,
  onOpenChange,
  onSubmit,
  onUpdate,
  booking,
  preselectedRoom,
  preselectedDate,
}: BookingFormDialogProps) {
  const { innId } = useTenant();

  const { data: roomsData } = useQuery({
    queryKey: ["rooms"],
    queryFn: () => roomService.getAll(),
  });

  console.log(booking);

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      roomId: preselectedRoom || booking?.roomId || "",
      checkIn:
        preselectedDate || (booking ? new Date(booking.checkIn) : undefined),
      checkOut: booking ? new Date(booking.checkOut) : undefined,
      adults: booking?.adults || 2,
      children: booking?.children || 0,
      childrenAges: booking?.childrenAges?.map((age) => ({ age })) || [],
      guestName: booking?.guest.name || "",
      guestEmail: booking?.guest.email || "",
      guestPhone: booking?.guest.phone || "",
      guestDocument: booking?.guest.document || "",
      guestBirthDate: booking?.guest.birthDate || "",
      notes: booking?.notes || "",
    },
  });

  const { fields: childrenAgeFields, replace: replaceChildrenAges } =
    useFieldArray({
      control: form.control,
      name: "childrenAges",
    });

  const selectedRoomId = form.watch("roomId");
  const checkIn = form.watch("checkIn");
  const checkOut = form.watch("checkOut");
  const childrenCount = form.watch("children");

  const selectedRoom = roomsData?.items.find((r) => r.id === selectedRoomId);

  // Sync children ages fields with children count
  useEffect(() => {
    const currentAges = form.getValues("childrenAges") || [];
    if (childrenCount > currentAges.length) {
      const toAdd = childrenCount - currentAges.length;
      const newAges = [...currentAges, ...Array(toAdd).fill({ age: 0 })];
      replaceChildrenAges(newAges);
    } else if (childrenCount < currentAges.length) {
      const newAges = currentAges.slice(0, childrenCount);
      replaceChildrenAges(newAges);
    }
  }, [childrenCount, replaceChildrenAges, form]);

  // When opening the dialog in edit mode or with preselected values, reset the form
  useEffect(() => {
    form.reset({
      roomId: booking?.roomId || preselectedRoom || "",
      checkIn: booking
        ? new Date(booking.checkIn)
        : preselectedDate || undefined,
      checkOut: booking ? new Date(booking.checkOut) : undefined,
      adults: booking?.adults || 2,
      children: booking?.children || 0,
      childrenAges: booking?.childrenAges?.map((age) => ({ age })) || [],
      guestName: booking?.guest.name || "",
      guestEmail: booking?.guest.email || "",
      guestPhone: booking?.guest.phone || "",
      guestDocument: booking?.guest.document || "",
      guestBirthDate: booking?.guest.birthDate || "",
      notes: booking?.notes || "",
    });
  }, [booking, preselectedRoom, preselectedDate, form]);

  const handleSubmit = async (data: BookingFormData) => {
    // Validate conflict
    const formattedCheckIn = format(data.checkIn, "yyyy-MM-dd");
    const formattedCheckOut = format(data.checkOut, "yyyy-MM-dd");

    if (innId && checkIn && checkOut) {
      const hasConflict = await bookingService.checkConflict(
        data.roomId,
        formattedCheckIn,
        formattedCheckOut,
        booking?.id,
      );

      if (hasConflict) {
        form.setError("checkIn", {
          message: "Já existe reserva neste período",
        });
        return;
      }
    }

    const request: CreateBookingRequest = {
      roomId: data.roomId,
      guest: {
        name: data.guestName,
        email: data.guestEmail || undefined,
        phone: data.guestPhone,
        document: data.guestDocument || undefined,
        birthDate: data.guestBirthDate || undefined,
      },
      checkIn: formattedCheckIn,
      checkOut: formattedCheckOut,
      adults: data.adults,
      children: data.children,
      childrenAges:
        data.children > 0 && data.childrenAges
          ? data.childrenAges.map((x) => x.age)
          : undefined,
      notes: data.notes,
    };

    if (booking && onUpdate) {
      await onUpdate(booking.id, {
        checkIn: request.checkIn,
        checkOut: request.checkOut,
        guest: request.guest,
        adults: request.adults,
        children: request.children,
        childrenAges: request.childrenAges,
        notes: request.notes,
        roomId: request.roomId,
      });
    } else {
      await onSubmit(request);
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {booking ? "Editar Reserva" : "Nova Reserva"}
          </DialogTitle>
          <DialogDescription>
            {booking
              ? "Atualize as informações da reserva"
              : "Criar uma nova reserva"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Room and Dates Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Informações da Reserva</h3>

              <FormField
                control={form.control}
                name="roomId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quarto</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um quarto" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roomsData?.items
                          .filter((room) => room.status === "Active")
                          .map((room) => (
                            <SelectItem key={room.id} value={room.id}>
                              {room.number} - {room.categoryName} (R${" "}
                              {room.basePrice.toFixed(2)})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="checkIn"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Check-in</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: ptBR })
                              ) : (
                                <span>Selecione a data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="checkOut"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Check-out</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: ptBR })
                              ) : (
                                <span>Selecione a data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => !checkIn || date <= checkIn}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="adults"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adultos</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={selectedRoom?.capacity || 10}
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
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
                          <Input
                            type="number"
                            min={0}
                            max={10}
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {childrenCount > 0 && (
                <div className="space-y-2 p-4 border rounded-md bg-muted/20">
                  <h4 className="text-sm font-medium">Idade das Crianças</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {childrenAgeFields.map((field, index) => (
                      <FormField
                        key={field.id}
                        control={form.control}
                        name={`childrenAges.${index}.age`}
                        render={({ field: subField }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder={`Idade ${index + 1}`}
                                min={0}
                                max={17}
                                {...subField}
                                onChange={(e) =>
                                  subField.onChange(Number(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Guest Information Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Dados do Hóspede</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="guestName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="João Silva" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="guestBirthDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Nascimento</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="guestEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="joao@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="guestPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input placeholder="(11) 98765-4321" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="guestDocument"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF/RG</FormLabel>
                      <FormControl>
                        <Input placeholder="123.456.789-00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Informações adicionais" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Salvando..." : "Salvar Reserva"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
