import { differenceInDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertTriangle,
  Ban,
  Bed,
  CakeIcon,
  CalendarDays,
  CheckCircle2,
  DollarSign,
  FileText,
  Info,
  LinkIcon,
  Mail,
  Pencil,
  Phone,
  Trash2,
  User,
  Users,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/features/auth/contexts/auth-context";
import { useInn } from "@/features/inns/hooks/use-inns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { formatCpf, formatPhone } from "@/shared/lib/utils";
import type {
  Booking,
  BookingReconciliationStatus,
  BookingStatus,
  PaymentMethod,
  PaymentStatus,
} from "../types";
import {
  getBookingDisplayTitle,
  getBookingSourceLabel,
  getFriendlyICalNote,
  getImportedBookingActionLabel,
  getImportedBookingTechnicalNote,
  getReconciliationStatusLabel,
  isBlock,
  isICalSource,
  isPendingImportedICalBooking,
} from "../utils/booking-helpers";
import { BookingReceiptPrinter } from "./booking-receipt-printer";
import { BookingSourceBadge } from "./booking-source-badge";

interface BookingDetailsProps {
  booking: Booking;
  onEdit: (booking: Booking) => void;
  onDelete: (id: string) => void;
  onIgnoreExternalBlock?: (id: string) => void;
  isIgnoringExternalBlock?: boolean;
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
    className:
      "bg-blue-500/20 text-blue-700 hover:bg-blue-500/30 border-none dark:bg-blue-500/10 dark:text-blue-400",
  },
  CheckedIn: {
    label: "Hospedado",
    variant: "secondary",
    className:
      "bg-emerald-500/20 text-emerald-700 hover:bg-emerald-500/30 border-none dark:bg-emerald-500/10 dark:text-emerald-400",
  },
  Completed: {
    label: "Concluída",
    variant: "outline",
    className:
      "bg-muted text-muted-foreground border-none dark:bg-muted/10 dark:text-muted-foreground/40",
  },
  Canceled: {
    label: "Cancelada",
    variant: "destructive",
    className:
      "bg-rose-500/20 text-rose-700 hover:bg-rose-500/30 border-none dark:bg-rose-500/10 dark:text-rose-400",
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
      "bg-emerald-500/20 text-emerald-700 hover:bg-emerald-500/30 border-none dark:bg-emerald-500/10 dark:text-emerald-400",
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  Partial: {
    label: "Parcial",
    variant: "secondary",
    className:
      "bg-amber-500/20 text-amber-700 hover:bg-amber-500/30 border-none dark:bg-amber-500/10 dark:text-amber-400",
    icon: <AlertTriangle className="w-4 h-4" />,
  },
  Pending: {
    label: "Pendente",
    variant: "destructive",
    className:
      "bg-rose-500/20 text-rose-700 hover:bg-rose-500/30 border-none dark:bg-rose-500/10 dark:text-rose-400",
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

const reconciliationStatusConfig: Record<
  BookingReconciliationStatus,
  { className: string }
> = {
  Imported: {
    className:
      "bg-sky-500/20 text-sky-700 hover:bg-sky-500/30 border-none dark:bg-sky-500/10 dark:text-sky-400",
  },
  NeedsReview: {
    className:
      "bg-amber-500/20 text-amber-700 hover:bg-amber-500/30 border-none dark:bg-amber-500/10 dark:text-amber-400",
  },
  Reconciled: {
    className:
      "bg-emerald-500/20 text-emerald-700 hover:bg-emerald-500/30 border-none dark:bg-emerald-500/10 dark:text-emerald-400",
  },
  IgnoredExternalBlock: {
    className:
      "bg-muted text-muted-foreground border-none dark:bg-muted/10 dark:text-muted-foreground/60",
  },
};

const auditActionLabels: Record<string, string> = {
  Created: "Criação",
  Updated: "Atualização",
  SoftDeleted: "Exclusão lógica",
  Deleted: "Exclusão",
};

export function BookingDetails({
  booking,
  onEdit,
  onDelete,
  onIgnoreExternalBlock,
  isIgnoringExternalBlock = false,
}: BookingDetailsProps) {
  const { innId } = useAuth();
  const { data: innData } = useInn(innId || "");

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

  const bookingIsBlock = isBlock(booking);
  const bookingIsPendingImportedICal = isPendingImportedICalBooking(booking);
  const importedActionLabel = getImportedBookingActionLabel(booking);
  const friendlyICalNote = getFriendlyICalNote(booking.notes);
  const technicalICalNote = getImportedBookingTechnicalNote(booking);
  const canIgnoreExternalBlock =
    bookingIsBlock &&
    isICalSource(booking.source) &&
    booking.reconciliationStatus !== "IgnoredExternalBlock";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2 min-w-0">
          <h3 className="text-2xl font-bold tracking-tight text-foreground wrap-break-word">
            {getBookingDisplayTitle(booking)}
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <BookingSourceBadge source={booking.source} />
            {booking.reconciliationStatus && (
              <Badge
                className={
                  reconciliationStatusConfig[booking.reconciliationStatus]
                    .className
                }
              >
                {getReconciliationStatusLabel(booking.reconciliationStatus)}
              </Badge>
            )}
            {!bookingIsBlock && (
              <>
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
              </>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end sm:justify-start shrink-0">
          {!bookingIsBlock && (
            <BookingReceiptPrinter booking={booking} innName={innData?.name} />
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onEdit(booking)}
                  title={
                    importedActionLabel ??
                    (bookingIsBlock
                      ? "Adicionar dados ao bloqueio iCAL"
                      : "Editar reserva")
                  }
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              {bookingIsBlock && (
                <TooltipContent>
                  <p>{importedActionLabel ?? "Adicionar dados do hóspede"}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
          {canIgnoreExternalBlock && onIgnoreExternalBlock && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  title="Ignorar no financeiro"
                  disabled={isIgnoringExternalBlock}
                >
                  <Ban className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Ignorar este bloqueio no financeiro?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    O período continuará ocupando o calendário, mas deixará de
                    aparecer como pendência de conciliação financeira.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onIgnoreExternalBlock(booking.id)}
                  >
                    Ignorar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                title={bookingIsBlock ? "Excluir bloqueio" : "Excluir reserva"}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {bookingIsBlock
                    ? "Tem certeza que deseja excluir este bloqueio?"
                    : "Tem certeza que deseja excluir esta reserva?"}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Essa ação removerá{" "}
                  {bookingIsBlock ? "o bloqueio" : "a reserva"} das listagens
                  ativas, preservando o histórico operacional para auditoria.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(booking.id)}>
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {!bookingIsBlock && booking.lastAudit && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              Última atualização operacional
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              {auditActionLabels[booking.lastAudit.action] ??
                booking.lastAudit.action}
            </p>
            <p className="text-sm text-muted-foreground">
              {booking.lastAudit.summary}
            </p>
            <p className="text-xs text-muted-foreground">
              {format(
                new Date(booking.lastAudit.occurredAt),
                "dd/MM/yyyy 'às' HH:mm",
                {
                  locale: ptBR,
                },
              )}
            </p>
          </CardContent>
        </Card>
      )}

      {bookingIsBlock && (
        <Card className="border-2 border-dashed border-muted-foreground/30">
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-primary" />
              {bookingIsPendingImportedICal
                ? "Reserva importada"
                : "Bloqueio Externo"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                <Info className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm">
                  {bookingIsPendingImportedICal
                    ? "Esta reserva foi importada via iCal e ainda não tem dados financeiros completos."
                    : "Este período está bloqueado via sincronização com "}
                  {!bookingIsPendingImportedICal && (
                    <span className="font-semibold">
                      {getBookingSourceLabel(booking.source)}
                    </span>
                  )}
                </p>
                {bookingIsPendingImportedICal ? (
                  <p className="text-xs text-muted-foreground mt-1">
                    Clique em editar para completar hóspede, pagamento e
                    observações.
                  </p>
                ) : (
                  isICalSource(booking.source) && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Clique em editar para adicionar dados do hóspede,
                      pagamento e observações, ou ignore no financeiro quando
                      for apenas um bloqueio externo.
                    </p>
                  )
                )}
                {bookingIsPendingImportedICal && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Origem: {getBookingSourceLabel(booking.source)}
                  </p>
                )}
              </div>
            </div>

            {friendlyICalNote && (
              <div className="mt-4 p-3 bg-muted/50 rounded-lg border border-dashed">
                <p className="text-xs text-muted-foreground font-medium mb-1">
                  Detalhe do canal:
                </p>
                <p className="text-sm">{friendlyICalNote}</p>
                {technicalICalNote &&
                  technicalICalNote !== friendlyICalNote && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Nota técnica: {technicalICalNote}
                    </p>
                  )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pagamento e Valores */}
        {!bookingIsBlock && (
          <Card className="md:col-span-2 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                Financeiro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-background border rounded-xl space-y-1 min-w-0">
                  <p className="text-xs text-muted-foreground truncate">
                    Valor Total
                  </p>
                  <p className="text-xl font-bold wrap-break-word">
                    {formatCurrency(booking.pricing.total)}
                  </p>
                </div>
                <div className="p-4 bg-background border rounded-xl space-y-1 min-w-0">
                  <p className="text-xs text-muted-foreground truncate">
                    Valor Pago
                  </p>
                  <p className="text-xl font-bold text-emerald-600 wrap-break-word">
                    {formatCurrency(booking.totalPaid)}
                  </p>
                </div>
                <div className="p-4 bg-background border rounded-xl space-y-1 min-w-0">
                  <p className="text-xs text-muted-foreground truncate">
                    Saldo Devedor
                  </p>
                  <p
                    className={`text-xl font-bold wrap-break-word ${booking.balanceDue > 0 ? "text-rose-600" : "text-emerald-600"}`}
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
                  <div className="flex justify-between items-start gap-4 text-muted-foreground">
                    <span className="wrap-break-word">
                      Diária base ({booking.categoryName})
                    </span>
                    <span className="text-foreground whitespace-nowrap shrink-0">
                      {formatCurrency(booking.pricing.basePrice)}
                    </span>
                  </div>
                  {booking.pricing.numberOfExtraGuests > 0 && (
                    <div className="flex justify-between items-start gap-4 text-muted-foreground">
                      <span className="wrap-break-word">
                        {booking.pricing.numberOfExtraGuests} hóspede(s)
                        extra(s)
                      </span>
                      <span className="text-foreground whitespace-nowrap shrink-0">
                        {formatCurrency(
                          booking.pricing.extraGuestPrice *
                            booking.pricing.numberOfExtraGuests,
                        )}
                      </span>
                    </div>
                  )}
                  <Separator className="my-2" />
                  <div className="flex justify-between items-start gap-4 text-muted-foreground">
                    <span className="wrap-break-word">Subtotal por diária</span>
                    <span className="text-foreground whitespace-nowrap shrink-0">
                      {formatCurrency(
                        booking.pricing.basePrice +
                          booking.pricing.extraGuestPrice *
                            booking.pricing.numberOfExtraGuests,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-start gap-4 text-muted-foreground">
                    <span className="wrap-break-word">
                      Total por {booking.pricing.numberOfNights} noites
                    </span>
                    <span className="text-foreground font-semibold whitespace-nowrap shrink-0">
                      {formatCurrency(booking.pricing.subtotal)}
                    </span>
                  </div>
                  {booking.pricing.discounts > 0 && (
                    <div className="flex justify-between items-start gap-4 text-rose-600">
                      <span className="wrap-break-word">Descontos</span>
                      <span className="whitespace-nowrap shrink-0">
                        - {formatCurrency(booking.pricing.discounts)}
                      </span>
                    </div>
                  )}
                  <Separator className="my-2" />
                  <div className="flex justify-between items-start gap-4">
                    <span className="font-bold wrap-break-word">
                      Total da Reserva
                    </span>
                    <span className="font-bold text-primary text-lg whitespace-nowrap shrink-0">
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
                        className="flex items-center justify-between gap-4 p-3 bg-background border rounded-lg text-sm"
                      >
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium truncate">
                            {paymentMethodLabels[payment.method]}
                          </span>
                          {payment.date && (
                            <span className="text-xs text-muted-foreground truncate">
                              {format(
                                new Date(payment.date),
                                "dd/MM/yyyy HH:mm",
                              )}
                            </span>
                          )}
                        </div>
                        <span className="font-bold text-emerald-600 whitespace-nowrap shrink-0">
                          {formatCurrency(payment.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Informações da Reserva */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              Reserva
            </h4>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg shrink-0">
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
                <div className="p-2 bg-primary/10 rounded-lg shrink-0">
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
                <div className="p-2 bg-primary/10 rounded-lg shrink-0">
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
        {!bookingIsBlock && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <User className="w-4 h-4" />
                Hóspede Responsável
              </h4>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                    <Phone className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">
                      Telefone
                    </p>
                    <p className="text-sm font-semibold">
                      {formatPhone(booking.guest?.phone)}
                    </p>
                  </div>
                </div>

                {booking.guest?.email && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                      <Mail className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">
                        E-mail
                      </p>
                      <p className="text-sm font-semibold">
                        {booking.guest?.email}
                      </p>
                    </div>
                  </div>
                )}

                {booking.guest?.birthDate && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                      <CakeIcon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">
                        Data de Nascimento
                      </p>
                      <p className="text-sm font-semibold">
                        {format(
                          new Date(booking.guest.birthDate),
                          "dd/MM/yyyy",
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {booking.guest?.document && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">
                        Documento (CPF/RG)
                      </p>
                      <p className="text-sm font-semibold">
                        {formatCpf(booking.guest.document)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Observações */}
        {!bookingIsBlock && booking.notes && (
          <div className="md:col-span-2 mt-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4" />
              Observações
            </h4>
            <div className="p-4 bg-muted/50 rounded-xl border border-dashed border-muted-foreground/20 text-sm text-foreground italic wrap-break-word">
              "{booking.notes}"
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
