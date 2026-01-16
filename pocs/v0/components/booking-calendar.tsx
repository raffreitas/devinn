"use client"

import { useState, useMemo } from "react"
import { ChevronLeft, ChevronRight, Check, AlertCircle, Users, Pencil } from "lucide-react"
import type { Booking } from "@/app/page"
import { getRoomCapacity } from "@/app/page"

interface BookingCalendarProps {
  bookings: Booking[]
  onSelectRoom: (number: number, date: string) => void
  onBookingClick: (booking: Booking) => void
}

export function BookingCalendar({ bookings, onSelectRoom, onBookingClick }: BookingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const rooms = [1, 2, 3, 4, 5, 6, 7, 8]

  const { daysInMonth, monthName, year } = useMemo(() => {
    const days = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
    const name = currentDate.toLocaleDateString("pt-BR", { month: "long" })
    return {
      daysInMonth: days,
      monthName: name.charAt(0).toUpperCase() + name.slice(1),
      year: currentDate.getFullYear(),
    }
  }, [currentDate])

  const days = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1)
      return {
        day: i + 1,
        date: date.toISOString().split("T")[0],
        dayOfWeek: date.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", ""),
        isToday: date.toDateString() === new Date().toDateString(),
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
      }
    })
  }, [currentDate, daysInMonth])

  const getBookingBarStyle = (booking: Booking, number: number) => {
    if (booking.number !== number) return null

    const checkIn = new Date(booking.checkIn)
    const checkOut = new Date(booking.checkOut)
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

    if (checkOut < monthStart || checkIn > monthEnd) return null

    const startDay = checkIn < monthStart ? 1 : checkIn.getDate()
    const endDay = checkOut > monthEnd ? daysInMonth : checkOut.getDate() - 1

    const dayWidth = 46
    const left = (startDay - 1) * dayWidth + 4
    const width = (endDay - startDay + 1) * dayWidth - 8

    return { left, width, startDay, endDay }
  }

  const getBookingColor = (booking: Booking) => {
    const remaining = booking.totalValue - booking.paidValue
    if (remaining <= 0) {
      return "bg-emerald-500 hover:bg-emerald-600"
    } else if (booking.paidValue > 0) {
      return "bg-amber-500 hover:bg-amber-600"
    } else {
      return "bg-rose-500 hover:bg-rose-600"
    }
  }

  const getPaymentIcon = (booking: Booking) => {
    const remaining = booking.totalValue - booking.paidValue
    if (remaining <= 0) {
      return <Check className="w-3 h-3" />
    } else {
      return <AlertCircle className="w-3 h-3" />
    }
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  return (
    <section className="mb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <h2 className="text-2xl font-serif font-semibold text-foreground">Calendário de Reservas</h2>

        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-sm bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors font-medium"
          >
            Hoje
          </button>
          <div className="flex items-center bg-card border border-border rounded-lg">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-muted rounded-l-lg transition-colors"
              aria-label="Mês anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-4 py-2 font-semibold min-w-[160px] text-center">
              {monthName} {year}
            </span>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-muted rounded-r-lg transition-colors"
              aria-label="Próximo mês"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendário estilo Booking.com */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            {/* Header com dias */}
            <div className="flex border-b border-border bg-muted/30">
              <div className="w-28 shrink-0 p-3 font-semibold text-sm text-foreground border-r border-border">
                Quartos
              </div>
              <div className="flex">
                {days.map(({ day, dayOfWeek, isToday, isWeekend }) => (
                  <div
                    key={day}
                    className={`w-[46px] shrink-0 py-2 text-center border-r border-border/50 last:border-r-0 ${isToday ? "bg-primary/20" : isWeekend ? "bg-muted/60" : ""
                      }`}
                  >
                    <div className="text-[10px] uppercase font-medium text-muted-foreground">{dayOfWeek}</div>
                    <div className={`text-sm font-bold ${isToday ? "text-primary" : "text-foreground"}`}>{day}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Linhas dos quartos com barras de reserva */}
            {rooms.map((room) => {
              const roomBookings = bookings.filter((b) => b.number === room)
              const capacity = getRoomCapacity(room)

              return (
                <div key={room} className="flex border-b border-border last:border-b-0 hover:bg-muted/20">
                  <div className="w-28 shrink-0 p-3 border-r border-border bg-muted/10">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 flex items-center justify-center bg-primary text-primary-foreground rounded-lg text-sm font-bold">
                          {room}
                        </span>
                        <span className="text-sm font-medium text-foreground">Quarto</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground ml-1">
                        <Users className="w-3 h-3" />
                        <span>{capacity} pessoas</span>
                      </div>
                    </div>
                  </div>

                  <div className="relative flex flex-1">
                    {days.map(({ date, isToday, isWeekend }) => (
                      <div
                        key={date}
                        onClick={() => onSelectRoom(room, date)}
                        className={`w-[46px] h-14 shrink-0 border-r border-border/30 last:border-r-0 cursor-pointer transition-colors hover:bg-primary/10 ${isToday ? "bg-primary/5" : isWeekend ? "bg-muted/30" : ""
                          }`}
                        title={`Quarto ${room} - ${new Date(date).toLocaleDateString("pt-BR")} - Clique para nova reserva`}
                      />
                    ))}

                    {roomBookings.map((booking) => {
                      const style = getBookingBarStyle(booking, room)
                      if (!style) return null

                      const remaining = booking.totalValue - booking.paidValue

                      return (
                        <div
                          key={booking.id}
                          onClick={(e) => {
                            e.stopPropagation()
                            onBookingClick(booking)
                          }}
                          className={`absolute top-2 h-10 ${getBookingColor(booking)} text-white rounded-md cursor-pointer transition-all flex items-center justify-between px-2 overflow-hidden shadow-sm group`}
                          style={{
                            left: `${style.left}px`,
                            width: `${style.width}px`,
                          }}
                          title={`${booking.guestName} - Clique para editar\n${remaining > 0 ? `Falta: ${formatCurrency(remaining)}` : "Pago"}`}
                        >
                          <span className="text-xs font-medium truncate flex-1">{booking.guestName}</span>
                          <div className="flex items-center gap-0.5 ml-1">
                            <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            {getPaymentIcon(booking)}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
        <span className="text-muted-foreground font-medium">Legenda:</span>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-primary/20 border-2 border-primary" />
          <span className="text-muted-foreground">Hoje</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-4 rounded bg-emerald-500" />
          <span className="text-muted-foreground">Pago</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-4 rounded bg-amber-500" />
          <span className="text-muted-foreground">Parcial</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-4 rounded bg-rose-500" />
          <span className="text-muted-foreground">Pendente</span>
        </div>
        <div className="flex items-center gap-2 ml-4 pl-4 border-l border-border">
          <Pencil className="w-3 h-3 text-muted-foreground" />
          <span className="text-muted-foreground">Clique na reserva para editar</span>
        </div>
      </div>
    </section>
  )
}
