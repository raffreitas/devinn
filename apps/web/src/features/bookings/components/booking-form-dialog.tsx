import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Calculator, Info, Users } from "lucide-react";
import { useEffect, useMemo } from "react";
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
import { InputMoney } from "@/shared/components/input-money";

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
    guestBirthDate: z.string().optional(),
    notes: z.string().optional(),
    paidAmount: z.number().min(0, "Valor deve ser maior ou igual a 0").optional(),
    paymentMethod: z.enum(["Cash", "Pix", "DebitCard", "CreditCard", "BankTransfer"]).optional(),
    paymentNotes: z.string().optional(),
  })
  .refine((data) => data.checkOut > data.checkIn, {
    message: "Data de check-out deve ser posterior ao check-in",
    path: ["checkOut"],
  })
  .refine(
    (data) => {
      if (data.paidAmount && data.paidAmount > 0 && !data.paymentMethod) {
        return false;
      }
      return true;
    },
    {
      message: "Método de pagamento é obrigatório quando há valor pago",
      path: ["paymentMethod"],
    }
  );

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
      paidAmount: undefined,
      paymentMethod: undefined,
      paymentNotes: "",
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
  const adults = form.watch("adults");
  const childrenAges = form.watch("childrenAges");

  const selectedRoom = roomsData?.items.find((r) => r.id === selectedRoomId);

  // Calculate nights
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const diff = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diff > 0 ? diff : 0;
  }, [checkIn, checkOut]);

  // Calculate total
  const priceBreakdown = useMemo(() => {
    if (!selectedRoom || nights <= 0) return null;

    const basePrice = selectedRoom.basePrice;
    const extraPrice = selectedRoom.extraGuestPrice;

    const extraAdults = Math.max(0, adults - 2);
    const adultsExtraCost = extraAdults * extraPrice;

    let childrenCost = 0;
    const childrenDetails: string[] = [];

    if (childrenAges) {
      for (let i = 0; i < childrenAges.length; i++) {
        const age = childrenAges[i]?.age || 0;
        let cost = 0;
        let label = "";

        if (age < 5) {
          cost = 0;
          label = "Grátis";
        } else if (age <= 10) {
          cost = extraPrice * 0.5;
          label = `R$ ${cost.toFixed(2)}`;
        } else {
          cost = extraPrice;
          label = `R$ ${cost.toFixed(2)}`;
        }

        childrenCost += cost;
        childrenDetails.push(`Criança ${i + 1} (${age} anos): ${label}`);
      }
    }

    const dailyTotal = basePrice + adultsExtraCost + childrenCost;
    const total = dailyTotal * nights;

    return {
      basePrice,
      extraAdults,
      adultsExtraCost,
      childrenCost,
      childrenDetails,
      dailyTotal,
      nights,
      total,
    };
  }, [selectedRoom, adults, childrenAges, nights]);

  const totalPeople = adults + childrenCount;
  const maxCapacity = selectedRoom?.capacity || 10;

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
      paidAmount: undefined,
      paymentMethod: undefined,
      paymentNotes: "",
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
        booking?.id
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
      paidAmount:
        data.paidAmount && data.paidAmount > 0 ? data.paidAmount : undefined,
      paymentMethod:
        data.paidAmount && data.paidAmount > 0 ? data.paymentMethod : undefined,
      paymentNotes: data.paymentNotes || undefined,
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
            {/* Quarto e Datas */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium border-b pb-2">Informações da Reserva</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="roomId"
                  render={({ field }) => (
                    <FormItem className="md:col-span-3">
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
                                Quarto {room.number} - {room.categoryName} ({room.capacity}p) - R${" "}
                                {room.basePrice.toFixed(2)}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      {selectedRoom && (
                        <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            Máx: {selectedRoom.capacity} pessoas | Base: R${" "}
                            {selectedRoom.basePrice}/dia | Extra: R${" "}
                            {selectedRoom.extraGuestPrice}/pessoa
                          </span>
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                                !field.value && "text-muted-foreground"
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
                                !field.value && "text-muted-foreground"
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
                      {nights > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {nights} noite(s)
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1">
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
                              max={maxCapacity}
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
                              max={Math.max(0, maxCapacity - adults)}
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

                  {totalPeople > 0 && (
                    <div
                      className={cn(
                        "mt-2 p-2 rounded-lg text-sm",
                        totalPeople > maxCapacity
                          ? "bg-destructive/10 text-destructive"
                          : "bg-muted/50 text-muted-foreground"
                      )}
                    >
                      <Users className="w-4 h-4 inline mr-1" />
                      Total: <span className="font-semibold">{totalPeople}</span>{" "}
                      de {maxCapacity} pessoas
                      {totalPeople > maxCapacity && " - Excede a capacidade!"}
                    </div>
                  )}
                </div>
              </div>

              {childrenCount > 0 && (
                <div className="space-y-2 p-3 border rounded-lg bg-muted/20">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Idade das Crianças
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    <strong>Regras:</strong> Até 4 anos grátis | 5-10 anos pagam
                    metade | Acima de 10 pagam valor inteiro
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {childrenAgeFields.map((field, index) => (
                      <FormField
                        key={field.id}
                        control={form.control}
                        name={`childrenAges.${index}.age`}
                        render={({ field: subField }) => (
                          <FormItem>
                            <FormControl>
                              <Select
                                value={String(subField.value)}
                                onValueChange={(value) =>
                                  subField.onChange(Number(value))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder={`Criança ${index + 1}`} />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 18 }, (_, age) => (
                                    <SelectItem key={age} value={String(age)}>
                                      {age} {age === 1 ? "ano" : "anos"}
                                      {age < 5
                                        ? " (grátis)"
                                        : age <= 10
                                          ? " (metade)"
                                          : ""}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
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

            {/* Cálculo Automático */}
            {priceBreakdown && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium border-b pb-2 flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-primary" />
                  Cálculo Automático
                </h3>

                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Diária base (quarto {selectedRoom?.number}):
                    </span>
                    <span className="font-medium">
                      R$ {priceBreakdown.basePrice.toFixed(2)}
                    </span>
                  </div>

                  {priceBreakdown.extraAdults > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {priceBreakdown.extraAdults} adulto(s) adicional(is) × R${" "}
                        {selectedRoom?.extraGuestPrice}:
                      </span>
                      <span className="font-medium">
                        R$ {priceBreakdown.adultsExtraCost.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {priceBreakdown.childrenDetails.map((detail, i) => (
                    <div key={i} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        {detail.split(":")[0]}:
                      </span>
                      <span className="font-medium">{detail.split(":")[1]}</span>
                    </div>
                  ))}

                  <div className="border-t border-border pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Total por diária:
                      </span>
                      <span className="font-medium">
                        R$ {priceBreakdown.dailyTotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Número de noites:
                      </span>
                      <span className="font-medium">{priceBreakdown.nights}</span>
                    </div>
                  </div>

                  <div className="border-t border-border pt-2 mt-2">
                    <div className="flex justify-between text-lg">
                      <span className="font-semibold">VALOR TOTAL:</span>
                      <span className="font-bold text-primary">
                        R$ {priceBreakdown.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Dados do Hóspede */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium border-b pb-2">
                Dados do Hóspede
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="guestName"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
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

            {/* Payment Section */}
            {!booking && priceBreakdown && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium border-b pb-2">
                  Pagamento Inicial (opcional)
                </h3>
                <p className="text-sm text-muted-foreground">
                  Registre o valor pago no momento da reserva, se houver.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="paidAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor Pago</FormLabel>
                        <FormControl>
                          <InputMoney
                            min={0}
                            max={priceBreakdown.total}
                            placeholder="R$ 0,00"
                            {...field}
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
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o método" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Pix">PIX</SelectItem>
                            <SelectItem value="Cash">Dinheiro</SelectItem>
                            <SelectItem value="CreditCard">
                              Cartão de Crédito
                            </SelectItem>
                            <SelectItem value="DebitCard">
                              Cartão de Débito
                            </SelectItem>
                            <SelectItem value="BankTransfer">
                              Transferência
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="paymentNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações do Pagamento (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Entrada de 50%" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? "Salvando..."
                  : booking
                    ? "Salvar Alterações"
                    : "Confirmar Reserva"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
