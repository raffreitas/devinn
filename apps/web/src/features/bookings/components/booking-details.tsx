import { differenceInDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertTriangle,
  Bed,
  CakeIcon,
  CalendarDays,
  CheckCircle2,
  DollarSign,
  FileText,
  Info,
  Mail,
  Pencil,
  Phone,
  User,
  Users,
  XCircle,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import type {
  Booking,
  BookingStatus,
  PaymentMethod,
  PaymentStatus,
} from "../types";

interface BookingDetailsProps {
  booking: Booking;
  onEdit: (booking: Booking) => void;
  onDelete: (id: string) => void;
}

const statusConfig: Record<
  BookingStatus,
  {
    label: string;
    className: string;
    variant: "default" | "secondary" | "outline" | "destructive";
  }
> = {
  Scheduled: {
    label: "Agendada",
    variant: "default",
    className: "bg-blue-500/20 text-blue-700 hover:bg-blue-500/30 border-none",
  },
  CheckedIn: {
    label: "Hospedado",
    variant: "secondary",
    className:
      "bg-emerald-500/20 text-emerald-700 hover:bg-emerald-500/30 border-none",
  },
  Completed: {
    label: "Concluída",
    variant: "outline",
    className: "bg-muted text-muted-foreground border-none",
  },
  Canceled: {
    label: "Cancelada",
    variant: "destructive",
    className: "bg-rose-500/20 text-rose-700 hover:bg-rose-500/30 border-none",
  },
};

const paymentStatusConfig: Record<
  PaymentStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive";
    className: string;
    icon: React.ReactNode;
  }
> = {
  Paid: {
    label: "Pago",
    variant: "default",
    className:
      "bg-emerald-500/20 text-emerald-700 hover:bg-emerald-500/30 border-none",
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  Partial: {
    label: "Parcial",
    variant: "secondary",
    className:
      "bg-amber-500/20 text-amber-700 hover:bg-amber-500/30 border-none",
    icon: <AlertTriangle className="w-4 h-4" />,
  },
  Pending: {
    label: "Pendente",
    variant: "destructive",
    className: "bg-rose-500/20 text-rose-700 hover:bg-rose-500/30 border-none",
    icon: <XCircle className="w-4 h-4" />,
  },
};

const paymentMethodLabels: Record<PaymentMethod, string> = {
  Cash: "Dinheiro",
  Pix: "PIX",
  DebitCard: "Cartão de Débito",
  CreditCard: "Cartão de Crédito",
  BankTransfer: "Transferência Bancária",
};

export function BookingDetails({
  booking,
  onEdit,
}: BookingDetailsProps) {
  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const status = statusConfig[booking.status];
  const paymentStatus = paymentStatusConfig[booking.paymentStatus];

  const checkIn = new Date(booking.checkIn);
  const checkOut = new Date(booking.checkOut);
  const nights = differenceInDays(checkOut, checkIn);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="text-2xl font-bold tracking-tight text-foreground">
            {booking.guest.name}
          </h3>
          <div className="flex items-center gap-2">
            <Badge variant={status.variant} className={status.className}>
              {status.label}
            </Badge>
            <Badge
              variant={paymentStatus.variant}
              className={paymentStatus.className}
            >
              <span className="flex items-center gap-1">
                {paymentStatus.icon}
                {paymentStatus.label}
              </span>
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onEdit(booking)}
            title="Editar reserva"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          {/* <Button
            variant="outline"
            size="icon"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(booking.id)}
            title="Excluir reserva"
          >
            <Trash2 className="w-4 h-4" />
          </Button> */}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pagamento e Valores */}
        <Card className="md:col-span-2 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              Financeiro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-background border rounded-xl space-y-1">
                <p className="text-xs text-muted-foreground">Valor Total</p>
                <p className="text-xl font-bold">
                  {formatCurrency(booking.pricing.total)}
                </p>
              </div>
              <div className="p-4 bg-background border rounded-xl space-y-1">
                <p className="text-xs text-muted-foreground">Valor Pago</p>
                <p className="text-xl font-bold text-emerald-600">
                  {formatCurrency(booking.totalPaid)}
                </p>
              </div>
              <div className="p-4 bg-background border rounded-xl space-y-1">
                <p className="text-xs text-muted-foreground">Saldo Devedor</p>
                <p
                  className={`text-xl font-bold ${booking.balanceDue > 0 ? "text-rose-600" : "text-emerald-600"}`}
                >
                  {formatCurrency(booking.balanceDue)}
                </p>
              </div>
            </div>

            <div className="rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Info className="w-4 h-4 text-primary" />
                Detalhamento do Cálculo
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Diária base ({booking.categoryName})</span>
                  <span className="text-foreground">
                    {formatCurrency(booking.pricing.basePrice)}
                  </span>
                </div>
                {booking.pricing.numberOfExtraGuests > 0 && (
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>
                      {booking.pricing.numberOfExtraGuests} hóspede(s) extra(s)
                    </span>
                    <span className="text-foreground">
                      {formatCurrency(
                        booking.pricing.extraGuestPrice *
                        booking.pricing.numberOfExtraGuests,
                      )}
                    </span>
                  </div>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Subtotal por diária</span>
                  <span className="text-foreground">
                    {formatCurrency(
                      booking.pricing.basePrice +
                      booking.pricing.extraGuestPrice *
                      booking.pricing.numberOfExtraGuests,
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Total por {booking.pricing.numberOfNights} noites</span>
                  <span className="text-foreground font-semibold">
                    {formatCurrency(booking.pricing.subtotal)}
                  </span>
                </div>
                {booking.pricing.discounts > 0 && (
                  <div className="flex justify-between items-center text-rose-600">
                    <span>Descontos</span>
                    <span>- {formatCurrency(booking.pricing.discounts)}</span>
                  </div>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between items-center">
                  <span className="font-bold">Total da Reserva</span>
                  <span className="font-bold text-primary text-lg">
                    {formatCurrency(booking.pricing.total)}
                  </span>
                </div>
              </div>
            </div>

            {booking.payments.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Histórico de Pagamentos
                </h4>
                <div className="space-y-2">
                  {booking.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-3 bg-background border rounded-lg text-sm"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {paymentMethodLabels[payment.method]}
                        </span>
                        {payment.date && (
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(payment.date), "dd/MM/yyyy HH:mm")}
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-emerald-600">
                        {formatCurrency(payment.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informações da Reserva */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              Reserva
            </h4>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Bed className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">
                    Acomodação
                  </p>
                  <p className="text-sm font-semibold">
                    Quarto {booking.number}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {booking.categoryName}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <CalendarDays className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">
                    Período
                  </p>
                  <p className="text-sm font-semibold">
                    {format(checkIn, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                    {format(checkOut, "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {nights} noite(s)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">
                    Hóspedes
                  </p>
                  <p className="text-sm font-semibold">
                    {booking.adults} adulto(s)
                    {booking.children > 0 &&
                      ` e ${booking.children} criança(s)`}
                  </p>
                  {booking.childrenAges && booking.childrenAges.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Idades: {booking.childrenAges.join(", ")} anos
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dados do Hóspede */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <User className="w-4 h-4" />
              Hóspede Responsável
            </h4>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">
                    Telefone
                  </p>
                  <p className="text-sm font-semibold">{booking.guest.phone}</p>
                </div>
              </div>

              {booking.guest.email && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">
                      E-mail
                    </p>
                    <p className="text-sm font-semibold">
                      {booking.guest.email}
                    </p>
                  </div>
                </div>
              )}

              {booking.guest.birthDate && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <CakeIcon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">
                      Data de Nascimento
                    </p>
                    <p className="text-sm font-semibold">
                      {format(new Date(booking.guest.birthDate), "dd/MM/yyyy")}
                    </p>
                  </div>
                </div>
              )}

              {booking.guest.document && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">
                      Documento (CPF/RG)
                    </p>
                    <p className="text-sm font-semibold">
                      {booking.guest.document}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Observações */}
        {booking.notes && (
          <div className="md:col-span-2 mt-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4" />
              Observações
            </h4>
            <div className="p-4 bg-muted/50 rounded-xl border border-dashed border-muted-foreground/20 text-sm text-foreground italic">
              "{booking.notes}"
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
