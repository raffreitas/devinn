import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CalculatorIcon,
  CalendarIcon,
  InfoIcon,
  LinkIcon,
  UsersIcon,
} from "lucide-react";
import { useEffect } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { useCalculatePriceBreakdown } from "@/features/bookings/hooks/use-calculate-price-breakdown";
import { useRooms } from "@/features/inventory/hooks";
import { InputCpf } from "@/shared/components/input-cpf";
import { InputMoney } from "@/shared/components/input-money";
import { InputNumber } from "@/shared/components/input-number";
import { InputPhone } from "@/shared/components/input-phone";
import { Button } from "@/shared/components/ui/button";
import { Calendar } from "@/shared/components/ui/calendar";
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
import { cn } from "@/shared/lib/utils";
import {
  type BookingFormData,
  type BookingFormInput,
  bookingSchema,
} from "../types";

type BookingFormProps = {
  initialData?: BookingFormInput & { id?: string };
  isSubmitting?: boolean;
  isICalBlock?: boolean;
  onSubmit: (data: BookingFormData) => void | Promise<void>;
  onCancel: () => void;
  preSelectedRoom?: string;
  preSelectedDate?: Date;
};

export function BookingForm({
  initialData,
  isSubmitting,
  isICalBlock = false,
  onCancel,
  onSubmit,
  preSelectedRoom,
  preSelectedDate,
}: BookingFormProps) {
  const form = useForm<BookingFormInput, undefined, BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      roomId: preSelectedRoom ? preSelectedRoom : initialData?.roomId || "",
      checkIn: preSelectedDate
        ? preSelectedDate
        : initialData
          ? new Date(initialData.checkIn)
          : undefined,
      checkOut: initialData ? new Date(initialData.checkOut) : undefined,
      adults: initialData?.adults || 2,
      children: initialData?.children || 0,
      childrenAges: initialData?.childrenAges || [],
      guestName: initialData?.guestName || "",
      guestEmail: initialData?.guestEmail || "",
      guestPhone: initialData?.guestPhone || "",
      guestDocument: initialData?.guestDocument || "",
      guestBirthDate: initialData?.guestBirthDate || "",
      notes: initialData?.notes || "",
      paidAmount: initialData?.paidAmount || 0,
      paymentMethod: initialData?.paymentMethod || "Pix",
      paymentNotes: initialData?.paymentNotes || "",
    },
  });

  const { fields: childrenAgeFields, replace: replaceChildrenAges } =
    useFieldArray({
      control: form.control,
      name: "childrenAges",
    });

  const selectedRoomId = useWatch({
    control: form.control,
    name: "roomId",
    defaultValue: form.getValues("roomId"),
  });
  const checkIn = useWatch({
    control: form.control,
    name: "checkIn",
    defaultValue: form.getValues("checkIn"),
  });
  const checkOut = useWatch({
    control: form.control,
    name: "checkOut",
    defaultValue: form.getValues("checkOut"),
  });
  const childrenCount = useWatch({
    control: form.control,
    name: "children",
    defaultValue: form.getValues("children"),
  });
  const adults = useWatch({
    control: form.control,
    name: "adults",
    defaultValue: form.getValues("adults"),
  });
  const childrenAges =
    useWatch({
      control: form.control,
      name: "childrenAges",
      defaultValue: form.getValues("childrenAges"),
    }) || [];
  const paidAmount = useWatch({
    control: form.control,
    name: "paidAmount",
    defaultValue: form.getValues("paidAmount"),
  });

  const { data: roomsData } = useRooms({ pageSize: 100 });

  const selectedRoom = roomsData?.items.find((r) => r.id === selectedRoomId);

  // Buscar breakdown de preços do backend
  const { priceBreakdown, isLoading: isPricingLoading } =
    useCalculatePriceBreakdown({
      roomCategoryId: selectedRoom?.categoryId,
      checkIn,
      checkOut,
      adults,
      children: childrenCount,
      childrenAges,
    });

  // Preparar dados para exibição
  const displayData = priceBreakdown
    ? {
        basePrice: selectedRoom?.basePrice || 0,
        payingUnits: priceBreakdown.payingUnits,
        perPersonPrice: selectedRoom?.extraGuestPrice || 0,
        childrenCost: priceBreakdown.childrenCost,
        childrenDetails: childrenAges.map((child, i) => {
          const age = child.age || 0;
          let label = "";
          if (age < 5) {
            label = "Grátis";
          } else if (age <= 10) {
            label = `R$ ${((selectedRoom?.extraGuestPrice || 0) * 0.5).toFixed(2)}`;
          } else {
            label = `R$ ${(selectedRoom?.extraGuestPrice || 0).toFixed(2)}`;
          }
          return `Criança ${i + 1} (${age} anos): ${label}`;
        }),
        dailyTotal: priceBreakdown.dailyTotal,
        nights: priceBreakdown.nights,
        total: priceBreakdown.total,
      }
    : null;

  const maxCapacity = selectedRoom?.capacity || 10;
  const totalPeople = adults + childrenCount;

  const remainingAmount = displayData
    ? displayData.total - (paidAmount ?? 0)
    : 0;

  // Calcular noites
  const nights = (() => {
    if (!checkIn || !checkOut) return 0;
    const diff = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
    );
    return diff > 0 ? diff : 0;
  })();

  // Sync children ages fields with children count
  useEffect(() => {
    const currentAges = form.getValues("childrenAges") || [];
    if (childrenCount > currentAges.length) {
      const toAdd = childrenCount - currentAges.length;
      const newAges = [
        ...currentAges,
        ...Array.from({ length: toAdd }, () => ({ age: 0 })),
      ];
      replaceChildrenAges(newAges);
    } else if (childrenCount < currentAges.length) {
      const newAges = currentAges.slice(0, childrenCount);
      replaceChildrenAges(newAges);
    }
  }, [childrenCount, replaceChildrenAges, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Banner de aviso para blocos iCAL */}
        {isICalBlock && (
          <div className="flex items-start gap-3 rounded-lg border border-dashed border-primary/40 bg-primary/5 p-3">
            <LinkIcon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-primary">
                Reserva via sincronização iCAL
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Quarto e datas são controlados pela sincronização externa e não
                podem ser alterados. Preencha os dados do hóspede para
                enriquecer esta reserva.
              </p>
            </div>
          </div>
        )}

        {/* Quarto e Datas */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium border-b pb-2">
            Informações da Reserva
          </h3>

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
                    disabled={isICalBlock}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione um quarto" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roomsData?.items
                        .filter((room) => room.status === "Active")
                        .map((room) => (
                          <SelectItem key={room.id} value={room.id}>
                            Quarto {room.number} - {room.categoryName} (
                            {room.capacity}p)
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {selectedRoom && (
                    <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <UsersIcon className="w-3 h-3" />
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
                          disabled={isICalBlock}
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
                        autoFocus
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
                          disabled={isICalBlock}
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
                        autoFocus
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
                        <InputNumber {...field} min={1} max={maxCapacity} />
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
                        <InputNumber
                          {...field}
                          min={0}
                          max={Math.max(0, maxCapacity - adults)}
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
                      : "bg-muted/50 text-muted-foreground",
                  )}
                >
                  <UsersIcon className="w-4 h-4 inline mr-1" />
                  Total: <span className="font-semibold">{totalPeople}</span> de{" "}
                  {maxCapacity} pessoas
                  {totalPeople > maxCapacity && " - Excede a capacidade!"}
                </div>
              )}
            </div>
          </div>

          {childrenCount > 0 && (
            <div className="space-y-2 p-3 border rounded-lg bg-muted/20">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <InfoIcon className="w-4 h-4" />
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
                              <SelectValue
                                placeholder={`Criança ${index + 1}`}
                              />
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
        {displayData && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium border-b pb-2 flex items-center gap-2">
              <CalculatorIcon className="w-4 h-4 text-primary" />
              Cálculo Automático
              {isPricingLoading && (
                <span className="text-xs text-muted-foreground ml-auto">
                  Carregando...
                </span>
              )}
            </h3>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Diária base (quarto {selectedRoom?.number}):
                </span>
                <span className="font-medium">
                  R$ {displayData.basePrice.toFixed(2)}
                </span>
              </div>

              {/* Show which pricing rule is applied for transparency */}
              {displayData.payingUnits <= 2 ? (
                <div className="text-xs text-muted-foreground italic mt-1">
                  Regra aplicada: Diária base (cobre até 2 pessoas).
                </div>
              ) : (
                <div className="text-xs text-muted-foreground italic mt-1">
                  Regra aplicada: Preço por pessoa × unidades pagantes — R${" "}
                  {displayData.perPersonPrice.toFixed(2)} ×{" "}
                  {Number(displayData.payingUnits).toFixed(2)} = R${" "}
                  {displayData.dailyTotal.toFixed(2)} por diária
                </div>
              )}

              {displayData.childrenDetails.map((detail, i) => (
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
                    R$ {displayData.dailyTotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Número de noites:
                  </span>
                  <span className="font-medium">{displayData.nights}</span>
                </div>
              </div>

              <div className="border-t border-border pt-2 mt-2">
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">VALOR TOTAL:</span>
                  <span className="font-bold text-primary">
                    R$ {displayData.total.toFixed(2)}
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
                    <InputPhone placeholder="(11) 98765-4321" {...field} />
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
                  <FormLabel>CPF</FormLabel>
                  <FormControl>
                    <InputCpf placeholder="123.456.789-00" {...field} />
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
        {displayData && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium border-b pb-2">Pagamento</h3>
            <p className="text-sm text-muted-foreground">
              Registre o valor pago no momento da reserva, se houver.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="paidAmount"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Valor Pago</FormLabel>
                    <FormControl>
                      <InputMoney
                        min={0}
                        max={displayData.total}
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
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

            {displayData.total > 0 && (
              <div className="mt-2 p-2 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Saldo devedor:{" "}
                  <span
                    className={`font-semibold ${
                      remainingAmount > 0
                        ? "text-rose-600"
                        : remainingAmount < 0
                          ? "text-blue-600"
                          : "text-emerald-600"
                    }`}
                  >
                    {remainingAmount > 0
                      ? `R$ ${remainingAmount.toFixed(2)}`
                      : remainingAmount < 0
                        ? `R$ ${Math.abs(remainingAmount).toFixed(2)} (Pago a mais)`
                        : "Pago integralmente"}
                  </span>
                </p>
              </div>
            )}
          </div>
        )}

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
