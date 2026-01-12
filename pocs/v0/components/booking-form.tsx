"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { X, Users, Calculator, Info } from "lucide-react"
import type { Booking } from "@/app/page"
import {
  getRoomCapacity,
  getRoomBasePrice,
  getRoomExtraPersonPrice,
  getChildPrice,
  calculateBookingTotal,
} from "@/app/page"

interface BookingFormProps {
  selectedRoom: number | null
  selectedDate?: string | null
  rooms: number[]
  onSubmit: (booking: Omit<Booking, "id">) => void
  onClose: () => void
  existingBookings: Booking[]
  editingBooking?: Booking | null
}

export function BookingForm({
  selectedRoom,
  selectedDate,
  rooms,
  onSubmit,
  onClose,
  existingBookings,
  editingBooking,
}: BookingFormProps) {
  const [formData, setFormData] = useState({
    roomNumber: editingBooking?.roomNumber || selectedRoom || 1,
    guestName: editingBooking?.guestName || "",
    phone: editingBooking?.phone || "",
    email: editingBooking?.email || "",
    checkIn: editingBooking?.checkIn || selectedDate || "",
    checkOut: editingBooking?.checkOut || "",
    adults: editingBooking?.adults || 1,
    children: editingBooking?.children || 0,
    childrenAges: editingBooking?.childrenAges || "",
    childrenAgesList: editingBooking?.childrenAgesList || ([] as number[]),
    birthDate: editingBooking?.birthDate || "",
    document: editingBooking?.document || "",
    notes: editingBooking?.notes || "",
    totalValue: editingBooking?.totalValue || 0,
    paidValue: editingBooking?.paidValue || 0,
  })
  const [error, setError] = useState("")

  const maxCapacity = getRoomCapacity(formData.roomNumber)
  const totalPeople = formData.adults + formData.children
  const basePrice = getRoomBasePrice(formData.roomNumber)
  const extraPrice = getRoomExtraPersonPrice(formData.roomNumber)

  const nights = useMemo(() => {
    if (!formData.checkIn || !formData.checkOut) return 0
    const start = new Date(formData.checkIn)
    const end = new Date(formData.checkOut)
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    return diff > 0 ? diff : 0
  }, [formData.checkIn, formData.checkOut])

  const calculatedTotal = useMemo(() => {
    if (nights <= 0) return 0
    return calculateBookingTotal(formData.roomNumber, formData.adults, formData.childrenAgesList, nights)
  }, [formData.roomNumber, formData.adults, formData.childrenAgesList, nights])

  useEffect(() => {
    if (calculatedTotal > 0 && !editingBooking) {
      setFormData((prev) => ({ ...prev, totalValue: calculatedTotal }))
    }
  }, [calculatedTotal, editingBooking])

  useEffect(() => {
    if (!editingBooking) {
      setFormData((prev) => ({
        ...prev,
        roomNumber: selectedRoom || prev.roomNumber,
        checkIn: selectedDate || prev.checkIn,
      }))
    }
  }, [selectedRoom, selectedDate, editingBooking])

  useEffect(() => {
    setFormData((prev) => {
      const currentAges = prev.childrenAgesList || []
      if (prev.children > currentAges.length) {
        return {
          ...prev,
          childrenAgesList: [...currentAges, ...Array(prev.children - currentAges.length).fill(0)],
        }
      } else if (prev.children < currentAges.length) {
        return {
          ...prev,
          childrenAgesList: currentAges.slice(0, prev.children),
        }
      }
      return prev
    })
  }, [formData.children])

  const handleChildAgeChange = (index: number, age: number) => {
    setFormData((prev) => {
      const newAges = [...(prev.childrenAgesList || [])]
      newAges[index] = age

      // Atualiza também o campo de texto
      const agesText = newAges.map((a) => `${a} anos`).join(", ")

      return {
        ...prev,
        childrenAgesList: newAges,
        childrenAges: agesText,
      }
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.guestName || !formData.phone || !formData.checkIn || !formData.checkOut) {
      setError("Preencha todos os campos obrigatórios")
      return
    }

    if (new Date(formData.checkOut) <= new Date(formData.checkIn)) {
      setError("A data de saída deve ser após a data de entrada")
      return
    }

    if (totalPeople > maxCapacity) {
      setError(`O quarto ${formData.roomNumber} comporta no máximo ${maxCapacity} pessoas`)
      return
    }

    const hasConflict = existingBookings.some((booking) => {
      if (booking.roomNumber !== formData.roomNumber) return false
      if (editingBooking && booking.id === editingBooking.id) return false

      const existingStart = new Date(booking.checkIn)
      const existingEnd = new Date(booking.checkOut)
      const newStart = new Date(formData.checkIn)
      const newEnd = new Date(formData.checkOut)

      return newStart < existingEnd && newEnd > existingStart
    })

    if (hasConflict) {
      setError("Este quarto já está reservado para este período")
      return
    }

    onSubmit(formData)
  }

  const priceBreakdown = useMemo(() => {
    if (nights <= 0) return null

    const extraAdults = Math.max(0, formData.adults - 2)
    const adultsExtraCost = extraAdults * extraPrice

    let childrenCost = 0
    const childrenDetails: string[] = []

    for (let i = 0; i < formData.childrenAgesList.length; i++) {
      const age = formData.childrenAgesList[i]
      const cost = getChildPrice(age, extraPrice)
      childrenCost += cost

      if (age < 5) {
        childrenDetails.push(`Criança ${i + 1} (${age} anos): Grátis`)
      } else if (age <= 10) {
        childrenDetails.push(
          `Criança ${i + 1} (${age} anos): ${(extraPrice / 2).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`,
        )
      } else {
        childrenDetails.push(
          `Criança ${i + 1} (${age} anos): ${extraPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`,
        )
      }
    }

    const dailyTotal = basePrice + adultsExtraCost + childrenCost

    return {
      basePrice,
      extraAdults,
      adultsExtraCost,
      childrenCost,
      childrenDetails,
      dailyTotal,
      nights,
      total: dailyTotal * nights,
    }
  }, [formData.adults, formData.childrenAgesList, nights, basePrice, extraPrice])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card">
          <h3 className="text-xl font-serif font-semibold text-foreground">
            {editingBooking ? "Editar Reserva" : "Nova Reserva"}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-lg text-sm">{error}</div>}

          {/* Quarto e Datas */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Quarto *</label>
              <select
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {rooms.map((room) => (
                  <option key={room} value={room}>
                    {room} ({getRoomCapacity(room)}p)
                  </option>
                ))}
              </select>
              <div className="flex flex-col gap-0.5 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Máx: {maxCapacity} pessoas
                </span>
                <span>Base: R$ {basePrice}/dia</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Entrada *</label>
              <input
                type="date"
                value={formData.checkIn}
                onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Saída *</label>
              <input
                type="date"
                value={formData.checkOut}
                onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {nights > 0 && <p className="text-xs text-muted-foreground mt-1">{nights} noite(s)</p>}
            </div>
          </div>

          {/* Dados do Hóspede */}
          <div className="border-t border-border pt-4">
            <h4 className="font-medium text-foreground mb-3">Dados do Hóspede</h4>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Nome Completo *</label>
                <input
                  type="text"
                  value={formData.guestName}
                  onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                  placeholder="Nome do hóspede"
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Telefone *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(00) 00000-0000"
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">E-mail</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@exemplo.com"
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Data de Nascimento</label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">CPF</label>
                  <input
                    type="text"
                    value={formData.document}
                    onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                    placeholder="000.000.000-00"
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quantidade de Pessoas */}
          <div className="border-t border-border pt-4">
            <h4 className="font-medium text-foreground mb-3">Quantidade de Pessoas</h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Adultos *</label>
                <select
                  value={formData.adults}
                  onChange={(e) => setFormData({ ...formData, adults: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {Array.from({ length: maxCapacity }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Crianças</label>
                <select
                  value={formData.children}
                  onChange={(e) => setFormData({ ...formData, children: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {Array.from({ length: Math.max(0, maxCapacity - formData.adults) + 1 }, (_, i) => i).map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {totalPeople > 0 && (
              <div className={`mt-2 p-2 rounded-lg ${totalPeople > maxCapacity ? "bg-destructive/10" : "bg-muted/50"}`}>
                <p className={`text-sm ${totalPeople > maxCapacity ? "text-destructive" : "text-muted-foreground"}`}>
                  <Users className="w-4 h-4 inline mr-1" />
                  Total: <span className="font-semibold">{totalPeople}</span> de {maxCapacity} pessoas
                  {totalPeople > maxCapacity && " - Excede a capacidade!"}
                </p>
              </div>
            )}

            {formData.children > 0 && (
              <div className="mt-3 space-y-3">
                <label className="block text-sm font-medium text-foreground">Idade das Crianças *</label>
                <div className="bg-muted/30 p-3 rounded-lg border border-border">
                  <div className="flex items-start gap-2 mb-3 text-xs text-muted-foreground">
                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      <strong>Regras de cobrança:</strong> Menores de 5 anos não pagam | 5 a 10 anos pagam metade (R${" "}
                      {(extraPrice / 2).toFixed(0)}) | Acima de 10 anos pagam valor inteiro (R$ {extraPrice})
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Array.from({ length: formData.children }, (_, i) => (
                      <div key={i}>
                        <label className="block text-xs text-muted-foreground mb-1">Criança {i + 1}</label>
                        <select
                          value={formData.childrenAgesList[i] || 0}
                          onChange={(e) => handleChildAgeChange(i, Number(e.target.value))}
                          className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          {Array.from({ length: 18 }, (_, age) => (
                            <option key={age} value={age}>
                              {age} {age === 1 ? "ano" : "anos"}
                              {age < 5 ? " (grátis)" : age <= 10 ? " (metade)" : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {priceBreakdown && (
            <div className="border-t border-border pt-4">
              <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-primary" />
                Cálculo Automático
              </h4>

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Diária base (quarto {formData.roomNumber}):</span>
                  <span className="font-medium">R$ {basePrice.toFixed(2)}</span>
                </div>

                {priceBreakdown.extraAdults > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {priceBreakdown.extraAdults} adulto(s) adicional(is) × R$ {extraPrice}:
                    </span>
                    <span className="font-medium">R$ {priceBreakdown.adultsExtraCost.toFixed(2)}</span>
                  </div>
                )}

                {priceBreakdown.childrenDetails.map((detail, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{detail.split(":")[0]}:</span>
                    <span className="font-medium">{detail.split(":")[1]}</span>
                  </div>
                ))}

                <div className="border-t border-border pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total por diária:</span>
                    <span className="font-medium">R$ {priceBreakdown.dailyTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Número de noites:</span>
                    <span className="font-medium">{priceBreakdown.nights}</span>
                  </div>
                </div>

                <div className="border-t border-border pt-2 mt-2">
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold text-foreground">VALOR TOTAL:</span>
                    <span className="font-bold text-primary">
                      {priceBreakdown.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pagamento */}
          <div className="border-t border-border pt-4">
            <h4 className="font-medium text-foreground mb-3">Pagamento</h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Valor Total (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.totalValue}
                  onChange={(e) => setFormData({ ...formData, totalValue: Number(e.target.value) })}
                  placeholder="0,00"
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Valor Pago (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.paidValue}
                  onChange={(e) => setFormData({ ...formData, paidValue: Number(e.target.value) })}
                  placeholder="0,00"
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {formData.totalValue > 0 && (
              <div className="mt-2 p-2 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Saldo devedor:{" "}
                  <span
                    className={`font-semibold ${formData.totalValue - formData.paidValue > 0 ? "text-rose-600" : "text-emerald-600"}`}
                  >
                    {(formData.totalValue - formData.paidValue).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Observações</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Informações adicionais, preferências, etc..."
              rows={2}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-input rounded-lg text-foreground hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              {editingBooking ? "Salvar Alterações" : "Confirmar Reserva"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
