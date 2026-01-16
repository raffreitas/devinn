import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Mail, Phone, FileText, Calendar, Users } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import type { Booking, PaymentStatus } from "../types";

const paymentStatusConfig: Record<
  PaymentStatus,
  { label: string; variant: "default" | "secondary" | "destructive" }
> = {
  paid: { label: "Pago", variant: "default" },
  partial: { label: "Parcial", variant: "secondary" },
  pending: { label: "Pendente", variant: "destructive" },
};

interface GuestDetailsPanelProps {
  booking: Booking;
}

export function GuestDetailsPanel({ booking }: GuestDetailsPanelProps) {
  const { guest, pricing, paymentStatus, totalPaid, payments } = booking;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Dados do Hóspede</CardTitle>
          <CardDescription>
            Informações de contato e documentação
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">{guest.name}</p>
              <p className="text-xs text-muted-foreground">Nome completo</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">{guest.email}</p>
              <p className="text-xs text-muted-foreground">E-mail</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">{guest.phone}</p>
              <p className="text-xs text-muted-foreground">Telefone</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">{guest.document}</p>
              <p className="text-xs text-muted-foreground">Documento</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes da Reserva</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium">
                {format(new Date(booking.checkIn), "PPP", { locale: ptBR })} até{" "}
                {format(new Date(booking.checkOut), "PPP", { locale: ptBR })}
              </p>
              <p className="text-xs text-muted-foreground">
                {pricing.numberOfNights}{" "}
                {pricing.numberOfNights === 1 ? "diária" : "diárias"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">
                {booking.adults + booking.children} hóspedes
              </p>
              {pricing.numberOfExtraGuests > 0 && (
                <p className="text-xs text-muted-foreground">
                  {pricing.numberOfExtraGuests} pessoa(s) extra
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Detalhamento de Preço</CardTitle>
          <Badge variant={paymentStatusConfig[paymentStatus].variant}>
            {paymentStatusConfig[paymentStatus].label}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Preço base ({pricing.numberOfNights}x)
              </span>
              <span>
                R$ {(pricing.basePrice * pricing.numberOfNights).toFixed(2)}
              </span>
            </div>

            {pricing.numberOfExtraGuests > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Pessoa extra ({pricing.numberOfExtraGuests}x
                  {pricing.numberOfNights})
                </span>
                <span>
                  R${" "}
                  {(
                    pricing.extraGuestPrice *
                    pricing.numberOfExtraGuests *
                    pricing.numberOfNights
                  ).toFixed(2)}
                </span>
              </div>
            )}

            {pricing.discounts > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Descontos</span>
                <span>- R$ {pricing.discounts.toFixed(2)}</span>
              </div>
            )}

            <Separator />

            <div className="flex justify-between font-semibold text-base">
              <span>Total</span>
              <span>R$ {pricing.total.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Pago</span>
              <span className="text-green-600 font-medium">
                R$ {totalPaid.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Restante</span>
              <span className="text-destructive font-medium">
                R$ {(pricing.total - totalPaid).toFixed(2)}
              </span>
            </div>
          </div>

          {payments.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm font-medium">Histórico de Pagamentos</p>
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex justify-between text-xs text-muted-foreground"
                  >
                    <span>
                      {format(new Date(payment.date), "dd/MM/yyyy")} -{" "}
                      {payment.method}
                    </span>
                    <span>R$ {payment.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
