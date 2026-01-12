"use client"

import {
  User,
  Phone,
  Mail,
  CalendarDays,
  Users,
  Baby,
  FileText,
  Trash2,
  Bed,
  CakeIcon,
  Pencil,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
} from "lucide-react"
import type { Booking } from "@/app/page"
import { getRoomCapacity, getRoomBasePrice, getRoomExtraPersonPrice, getChildPrice } from "@/app/page"

interface GuestDetailsProps {
  bookings: Booking[]
  selectedBooking: Booking | null
  onSelectBooking: (booking: Booking | null) => void
  onDeleteBooking: (id: string) => void
  onEditBooking: (booking: Booking) => void
}

export function GuestDetails({
  bookings,
  selectedBooking,
  onSelectBooking,
  onDeleteBooking,
  onEditBooking,
}: GuestDetailsProps) {
  const sortedBookings = [...bookings].sort((a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime())

  const today = new Date().toISOString().split("T")[0]

  const getStatus = (booking: Booking) => {
    const checkIn = new Date(booking.checkIn)
    const checkOut = new Date(booking.checkOut)
    const todayDate = new Date(today)

    if (todayDate >= checkIn && todayDate < checkOut) {
      return { label: "Hospedado", className: "bg-emerald-500/20 text-emerald-700" }
    } else if (todayDate >= checkOut) {
      return { label: "Concluída", className: "bg-muted text-muted-foreground" }
    } else {
      return { label: "Agendada", className: "bg-blue-500/20 text-blue-700" }
    }
  }

  const getPaymentStatus = (booking: Booking) => {
    const remaining = booking.totalValue - booking.paidValue
    if (remaining <= 0) {
      return {
        label: "Pago",
        className: "bg-emerald-500/20 text-emerald-700",
        icon: <CheckCircle2 className="w-4 h-4" />,
      }
    } else if (booking.paidValue > 0) {
      return {
        label: "Parcial",
        className: "bg-amber-500/20 text-amber-700",
        icon: <AlertTriangle className="w-4 h-4" />,
      }
    } else {
      return {
        label: "Pendente",
        className: "bg-rose-500/20 text-rose-700",
        icon: <XCircle className="w-4 h-4" />,
      }
    }
  }

  const calculateNights = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  }

  const getPriceBreakdown = (booking: Booking) => {
    const nights = calculateNights(booking.checkIn, booking.checkOut)
    const basePrice = getRoomBasePrice(booking.roomNumber)
    const extraPrice = getRoomExtraPersonPrice(booking.roomNumber)

    const extraAdults = Math.max(0, booking.adults - 2)
    const adultsExtraCost = extraAdults * extraPrice

    let childrenCost = 0
    const childrenDetails: { age: number; cost: number }[] = []

    if (booking.childrenAgesList) {
      for (const age of booking.childrenAgesList) {
        const cost = getChildPrice(age, extraPrice)
        childrenCost += cost
        childrenDetails.push({ age, cost })
      }
    }

    const dailyTotal = basePrice + adultsExtraCost + childrenCost

    return {
      basePrice,
      extraAdults,
      adultsExtraCost,
      childrenDetails,
      childrenCost,
      dailyTotal,
      nights,
      total: dailyTotal * nights,
    }
  }

  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Lista de Hóspedes */}
      <div className="lg:col-span-1">
        <h2 className="text-xl font-serif font-semibold text-foreground mb-4">Hóspedes ({bookings.length})</h2>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="max-h-[500px] overflow-y-auto">
            {sortedBookings.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <User className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>Nenhum hóspede cadastrado</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {sortedBookings.map((booking) => {
                  const status = getStatus(booking)
                  const paymentStatus = getPaymentStatus(booking)
                  const isSelected = selectedBooking?.id === booking.id
                  const remaining = booking.totalValue - booking.paidValue

                  return (
                    <div
                      key={booking.id}
                      onClick={() => onSelectBooking(booking)}
                      className={`p-3 cursor-pointer transition-colors ${
                        isSelected ? "bg-primary/10" : "hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-foreground truncate">{booking.guestName}</span>
                        <div className="flex items-center gap-1">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${status.className}`}>
                            {status.label}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Bed className="w-3 h-3" />Q{booking.roomNumber}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {booking.adults + booking.children}
                        </span>
                        <span>
                          {new Date(booking.checkIn).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${paymentStatus.className}`}
                        >
                          {paymentStatus.icon}
                          {paymentStatus.label}
                        </span>
                        {remaining > 0 && (
                          <span className="text-xs font-medium text-rose-600">Falta: {formatCurrency(remaining)}</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detalhes do Hóspede Selecionado */}
      <div className="lg:col-span-2">
        <h2 className="text-xl font-serif font-semibold text-foreground mb-4">Dados do Hóspede</h2>

        {selectedBooking ? (
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="text-xl font-semibold text-foreground">{selectedBooking.guestName}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${getStatus(selectedBooking).className}`}
                  >
                    {getStatus(selectedBooking).label}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${getPaymentStatus(selectedBooking).className}`}
                  >
                    {getPaymentStatus(selectedBooking).icon}
                    {getPaymentStatus(selectedBooking).label}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEditBooking(selectedBooking)}
                  className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                  title="Editar reserva"
                >
                  <Pencil className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onDeleteBooking(selectedBooking.id)}
                  className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  title="Excluir reserva"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="bg-muted/30 rounded-xl p-4 mb-5 border border-border">
              <h4 className="font-semibold text-foreground text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                Pagamento
              </h4>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-background rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Valor Total</p>
                  <p className="text-lg font-bold text-foreground">{formatCurrency(selectedBooking.totalValue)}</p>
                </div>
                <div className="text-center p-3 bg-background rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Valor Pago</p>
                  <p className="text-lg font-bold text-emerald-600">{formatCurrency(selectedBooking.paidValue)}</p>
                </div>
                <div className="text-center p-3 bg-background rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Saldo Devedor</p>
                  <p
                    className={`text-lg font-bold ${selectedBooking.totalValue - selectedBooking.paidValue > 0 ? "text-rose-600" : "text-emerald-600"}`}
                  >
                    {formatCurrency(selectedBooking.totalValue - selectedBooking.paidValue)}
                  </p>
                </div>
              </div>

              {(() => {
                const breakdown = getPriceBreakdown(selectedBooking)
                const extraPrice = getRoomExtraPersonPrice(selectedBooking.roomNumber)
                return (
                  <div className="bg-background rounded-lg p-3 text-xs space-y-1">
                    <div className="flex items-center gap-1 text-muted-foreground mb-2">
                      <Info className="w-3 h-3" />
                      <span className="font-medium">Detalhamento do cálculo:</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Diária base (Q{selectedBooking.roomNumber}):</span>
                      <span>{formatCurrency(breakdown.basePrice)}</span>
                    </div>
                    {breakdown.extraAdults > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{breakdown.extraAdults} adulto(s) adicional(is):</span>
                        <span>{formatCurrency(breakdown.adultsExtraCost)}</span>
                      </div>
                    )}
                    {breakdown.childrenDetails.map((child, i) => (
                      <div key={i} className="flex justify-between">
                        <span className="text-muted-foreground">
                          Criança {child.age} anos ({child.age < 5 ? "grátis" : child.age <= 10 ? "metade" : "inteiro"}
                          ):
                        </span>
                        <span>{child.cost === 0 ? "Grátis" : formatCurrency(child.cost)}</span>
                      </div>
                    ))}
                    <div className="border-t border-border pt-1 mt-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total/dia:</span>
                        <span className="font-medium">{formatCurrency(breakdown.dailyTotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">× {breakdown.nights} noites =</span>
                        <span className="font-bold text-primary">{formatCurrency(breakdown.total)}</span>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Informações da Reserva */}
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground text-sm uppercase tracking-wide border-b border-border pb-2">
                  Reserva
                </h4>

                <div className="flex items-center gap-3">
                  <Bed className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Quarto</p>
                    <p className="font-medium text-foreground">
                      Quarto {selectedBooking.roomNumber}
                      <span className="text-muted-foreground font-normal ml-2">
                        (capacidade: {getRoomCapacity(selectedBooking.roomNumber)} pessoas)
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      R$ {getRoomBasePrice(selectedBooking.roomNumber)}/dia + R${" "}
                      {getRoomExtraPersonPrice(selectedBooking.roomNumber)}/pessoa extra
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CalendarDays className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Período</p>
                    <p className="font-medium text-foreground">
                      {new Date(selectedBooking.checkIn).toLocaleDateString("pt-BR")} até{" "}
                      {new Date(selectedBooking.checkOut).toLocaleDateString("pt-BR")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {calculateNights(selectedBooking.checkIn, selectedBooking.checkOut)} noite(s)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Hóspedes</p>
                    <p className="font-medium text-foreground">
                      {selectedBooking.adults} adulto(s)
                      {selectedBooking.children > 0 && `, ${selectedBooking.children} criança(s)`}
                    </p>
                  </div>
                </div>

                {selectedBooking.children > 0 && selectedBooking.childrenAges && (
                  <div className="flex items-center gap-3">
                    <Baby className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Idade das Crianças</p>
                      <p className="font-medium text-foreground">{selectedBooking.childrenAges}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Informações Pessoais */}
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground text-sm uppercase tracking-wide border-b border-border pb-2">
                  Dados Pessoais
                </h4>

                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Telefone</p>
                    <p className="font-medium text-foreground">{selectedBooking.phone}</p>
                  </div>
                </div>

                {selectedBooking.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">E-mail</p>
                      <p className="font-medium text-foreground">{selectedBooking.email}</p>
                    </div>
                  </div>
                )}

                {selectedBooking.birthDate && (
                  <div className="flex items-center gap-3">
                    <CakeIcon className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Data de Nascimento</p>
                      <p className="font-medium text-foreground">
                        {new Date(selectedBooking.birthDate).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                )}

                {selectedBooking.document && (
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">CPF</p>
                      <p className="font-medium text-foreground">{selectedBooking.document}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Observações */}
            {selectedBooking.notes && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-start gap-3">
                  <FileText className="w-4 h-4 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Observações</p>
                    <p className="text-foreground bg-muted/50 p-3 rounded-lg text-sm">{selectedBooking.notes}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <User className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              Selecione um hóspede na lista ou clique em uma reserva no calendário
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
