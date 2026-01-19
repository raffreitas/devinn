"use client"

import { useState } from "react"
import { BookingForm } from "@/components/booking-form"
import { BookingCalendar } from "@/components/booking-calendar"
import { GuestDetails } from "@/components/guest-details"
import { FinancialControl, type Expense } from "@/components/financial-control"
import { MapPin, Phone, Calendar, Wallet } from "lucide-react"

export interface Booking {
  id: string
  number: number
  guestName: string
  phone: string
  email?: string
  checkIn: string
  checkOut: string
  adults: number
  children: number
  childrenAges?: string
  childrenAgesList?: number[]
  birthDate?: string
  document?: string
  notes?: string
  totalValue: number
  paidValue: number
}

export function getRoomCapacity(number: number): number {
  return number <= 4 ? 5 : 4
}

export function getRoomBasePrice(number: number): number {
  return number <= 4 ? 280 : 300
}

export function getRoomExtraPersonPrice(number: number): number {
  return number <= 4 ? 130 : 120
}

export function getChildPrice(age: number, extraPersonPrice: number): number {
  if (age < 5) return 0
  if (age <= 10) return extraPersonPrice / 2
  return extraPersonPrice
}

export function calculateBookingTotal(
  number: number,
  adults: number,
  childrenAges: number[],
  nights: number,
): number {
  const basePrice = getRoomBasePrice(number)
  const extraPrice = getRoomExtraPersonPrice(number)
  const extraAdults = Math.max(0, adults - 2)
  const adultsExtra = extraAdults * extraPrice

  let childrenTotal = 0
  for (const age of childrenAges) {
    childrenTotal += getChildPrice(age, extraPrice)
  }

  const dailyTotal = basePrice + adultsExtra + childrenTotal
  return dailyTotal * nights
}

const initialBookings: Booking[] = [
  {
    id: "1",
    number: 1,
    guestName: "João Silva",
    phone: "(37) 99888-7766",
    email: "joao.silva@email.com",
    checkIn: "2026-01-10",
    checkOut: "2026-01-15",
    adults: 2,
    children: 1,
    childrenAges: "5 anos",
    childrenAgesList: [5],
    birthDate: "1985-03-15",
    document: "123.456.789-00",
    notes: "Preferência por quarto silencioso",
    totalValue: 1725,
    paidValue: 1725,
  },
  {
    id: "2",
    number: 3,
    guestName: "Maria Santos",
    phone: "(37) 99777-5544",
    email: "maria@email.com",
    checkIn: "2026-01-12",
    checkOut: "2026-01-18",
    adults: 2,
    children: 2,
    childrenAges: "3 e 7 anos",
    childrenAgesList: [3, 7],
    birthDate: "1990-07-22",
    document: "987.654.321-00",
    totalValue: 2070,
    paidValue: 1000,
  },
  {
    id: "3",
    number: 5,
    guestName: "Carlos Oliveira",
    phone: "(31) 98765-4321",
    email: "carlos.oliveira@email.com",
    checkIn: "2026-01-08",
    checkOut: "2026-01-12",
    adults: 1,
    children: 0,
    childrenAgesList: [],
    birthDate: "1978-11-30",
    document: "456.789.123-00",
    notes: "Check-in tardio às 22h",
    totalValue: 1200,
    paidValue: 1200,
  },
  {
    id: "4",
    number: 2,
    guestName: "Ana Paula Ferreira",
    phone: "(37) 99666-3322",
    checkIn: "2026-01-14",
    checkOut: "2026-01-20",
    adults: 2,
    children: 0,
    childrenAgesList: [],
    birthDate: "1992-05-10",
    totalValue: 1680,
    paidValue: 600,
  },
  {
    id: "5",
    number: 7,
    guestName: "Roberto Almeida",
    phone: "(34) 99555-1100",
    email: "roberto@email.com",
    checkIn: "2026-01-16",
    checkOut: "2026-01-22",
    adults: 3,
    children: 1,
    childrenAges: "12 anos",
    childrenAgesList: [12],
    birthDate: "1980-01-25",
    document: "321.654.987-00",
    notes: "Aniversário da esposa no dia 18",
    totalValue: 2880,
    paidValue: 2880,
  },
  {
    id: "6",
    number: 4,
    guestName: "Fernanda Lima",
    phone: "(37) 99444-8877",
    checkIn: "2026-01-20",
    checkOut: "2026-01-25",
    adults: 2,
    children: 3,
    childrenAges: "2, 6 e 9 anos",
    childrenAgesList: [2, 6, 9],
    birthDate: "1988-09-12",
    totalValue: 2075,
    paidValue: 0,
  },
  {
    id: "7",
    number: 8,
    guestName: "Pedro Henrique Costa",
    phone: "(31) 99333-2211",
    email: "pedro.costa@email.com",
    checkIn: "2026-01-11",
    checkOut: "2026-01-14",
    adults: 2,
    children: 0,
    childrenAgesList: [],
    birthDate: "1995-12-03",
    document: "654.321.987-00",
    totalValue: 900,
    paidValue: 450,
  },
  {
    id: "8",
    number: 6,
    guestName: "Luciana Martins",
    phone: "(37) 99222-0099",
    checkIn: "2026-01-18",
    checkOut: "2026-01-23",
    adults: 1,
    children: 1,
    childrenAges: "8 anos",
    childrenAgesList: [8],
    birthDate: "1983-04-18",
    notes: "Vegetariana",
    totalValue: 1800,
    paidValue: 1800,
  },
  {
    id: "9",
    number: 1,
    guestName: "Marcelo Souza",
    phone: "(37) 99111-2233",
    email: "marcelo.souza@email.com",
    checkIn: "2026-01-20",
    checkOut: "2026-01-24",
    adults: 2,
    children: 2,
    childrenAges: "4 e 8 anos",
    childrenAgesList: [4, 8],
    birthDate: "1982-08-20",
    document: "111.222.333-44",
    totalValue: 1380,
    paidValue: 400,
  },
  {
    id: "10",
    number: 3,
    guestName: "Juliana Pereira",
    phone: "(34) 98877-6655",
    checkIn: "2026-01-22",
    checkOut: "2026-01-28",
    adults: 2,
    children: 0,
    childrenAgesList: [],
    birthDate: "1991-02-14",
    notes: "Lua de mel",
    totalValue: 1680,
    paidValue: 1680,
  },
  {
    id: "11",
    number: 5,
    guestName: "Ricardo Mendes",
    phone: "(31) 99444-5566",
    email: "ricardo.mendes@email.com",
    checkIn: "2026-01-15",
    checkOut: "2026-01-19",
    adults: 1,
    children: 0,
    childrenAgesList: [],
    birthDate: "1975-06-30",
    document: "222.333.444-55",
    notes: "Viagem de trabalho",
    totalValue: 1200,
    paidValue: 0,
  },
  {
    id: "12",
    number: 2,
    guestName: "Camila Rodrigues",
    phone: "(37) 98765-1234",
    email: "camila@email.com",
    checkIn: "2026-01-25",
    checkOut: "2026-01-30",
    adults: 3,
    children: 1,
    childrenAges: "6 anos",
    childrenAgesList: [6],
    birthDate: "1987-11-08",
    totalValue: 2700,
    paidValue: 875,
  },
  {
    id: "13",
    number: 8,
    guestName: "Fernando Gomes",
    phone: "(34) 99666-7788",
    checkIn: "2026-01-17",
    checkOut: "2026-01-21",
    adults: 2,
    children: 0,
    childrenAgesList: [],
    birthDate: "1993-04-25",
    document: "333.444.555-66",
    totalValue: 1200,
    paidValue: 1200,
  },
  {
    id: "14",
    number: 6,
    guestName: "Patricia Campos",
    phone: "(37) 99888-1122",
    email: "patricia.campos@email.com",
    checkIn: "2026-01-26",
    checkOut: "2026-01-31",
    adults: 2,
    children: 2,
    childrenAges: "3 e 11 anos",
    childrenAgesList: [3, 11],
    birthDate: "1989-09-17",
    notes: "Aniversário do filho dia 28",
    totalValue: 1800,
    paidValue: 500,
  },
  {
    id: "15",
    number: 4,
    guestName: "Bruno Carvalho",
    phone: "(31) 98888-9999",
    checkIn: "2026-01-10",
    checkOut: "2026-01-13",
    adults: 2,
    children: 1,
    childrenAges: "12 anos",
    childrenAgesList: [12],
    birthDate: "1984-12-05",
    document: "444.555.666-77",
    totalValue: 1230,
    paidValue: 1230,
  },
  {
    id: "16",
    number: 7,
    guestName: "Daniela Nunes",
    phone: "(37) 99777-3344",
    email: "daniela.nunes@email.com",
    checkIn: "2026-01-25",
    checkOut: "2026-01-29",
    adults: 1,
    children: 0,
    childrenAgesList: [],
    birthDate: "1996-03-22",
    notes: "Retiro espiritual",
    totalValue: 1200,
    paidValue: 600,
  },
  {
    id: "17",
    number: 1,
    guestName: "Gustavo Ribeiro",
    phone: "(37) 99123-4567",
    email: "gustavo.r@email.com",
    checkIn: "2026-01-28",
    checkOut: "2026-02-02",
    adults: 4,
    children: 1,
    childrenAges: "7 anos",
    childrenAgesList: [7],
    birthDate: "1979-05-12",
    document: "555.666.777-88",
    totalValue: 3025,
    paidValue: 1000,
  },
  {
    id: "18",
    number: 5,
    guestName: "Beatriz Andrade",
    phone: "(31) 98765-9876",
    checkIn: "2026-01-22",
    checkOut: "2026-01-26",
    adults: 2,
    children: 2,
    childrenAges: "4 e 9 anos",
    childrenAgesList: [4, 9],
    birthDate: "1986-08-30",
    totalValue: 1440,
    paidValue: 1440,
  },
  {
    id: "19",
    number: 2,
    guestName: "Thiago Moreira",
    phone: "(37) 99234-5678",
    email: "thiago.m@email.com",
    checkIn: "2026-01-08",
    checkOut: "2026-01-11",
    adults: 2,
    children: 1,
    childrenAges: "4 anos",
    childrenAgesList: [4],
    birthDate: "1988-06-15",
    document: "666.777.888-99",
    totalValue: 840,
    paidValue: 840,
  },
  {
    id: "20",
    number: 3,
    guestName: "Vanessa Costa",
    phone: "(34) 99345-6789",
    checkIn: "2026-01-08",
    checkOut: "2026-01-10",
    adults: 2,
    children: 0,
    childrenAgesList: [],
    birthDate: "1994-03-20",
    totalValue: 560,
    paidValue: 0,
  },
  {
    id: "21",
    number: 6,
    guestName: "Alexandre Santos",
    phone: "(31) 99456-7890",
    email: "alex.santos@email.com",
    checkIn: "2026-01-10",
    checkOut: "2026-01-15",
    adults: 3,
    children: 1,
    childrenAges: "6 anos",
    childrenAgesList: [6],
    birthDate: "1981-09-10",
    document: "777.888.999-00",
    notes: "Pescaria na Serra da Canastra",
    totalValue: 2400,
    paidValue: 1050,
  },
  {
    id: "22",
    number: 7,
    guestName: "Renata Oliveira",
    phone: "(37) 99567-8901",
    checkIn: "2026-01-08",
    checkOut: "2026-01-13",
    adults: 2,
    children: 2,
    childrenAges: "2 e 8 anos",
    childrenAgesList: [2, 8],
    birthDate: "1990-12-05",
    totalValue: 1800,
    paidValue: 1800,
  },
  {
    id: "23",
    number: 4,
    guestName: "Eduardo Lima",
    phone: "(34) 99678-9012",
    email: "eduardo.lima@email.com",
    checkIn: "2026-01-15",
    checkOut: "2026-01-18",
    adults: 2,
    children: 0,
    childrenAgesList: [],
    birthDate: "1987-04-25",
    document: "888.999.000-11",
    totalValue: 840,
    paidValue: 420,
  },
  {
    id: "24",
    number: 8,
    guestName: "Mariana Ferreira",
    phone: "(37) 99789-0123",
    checkIn: "2026-01-24",
    checkOut: "2026-01-28",
    adults: 1,
    children: 1,
    childrenAges: "10 anos",
    childrenAgesList: [10],
    birthDate: "1992-07-18",
    notes: "Visita às cachoeiras",
    totalValue: 1440,
    paidValue: 0,
  },
]

export default function Home() {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings)
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)
  const [activeTab, setActiveTab] = useState<"reservas" | "financeiro">("reservas")
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: "e1", description: "Conta de Energia", value: 850, category: "Energia", date: "2026-01-05" },
    { id: "e2", description: "Conta de Água", value: 320, category: "Água", date: "2026-01-05" },
    { id: "e3", description: "Internet Fibra", value: 150, category: "Internet", date: "2026-01-10" },
    { id: "e4", description: "Salário - Maria (Limpeza)", value: 1800, category: "Funcionários", date: "2026-01-05" },
    { id: "e5", description: "Salário - José (Manutenção)", value: 1600, category: "Funcionários", date: "2026-01-05" },
    { id: "e6", description: "Produtos de Limpeza", value: 280, category: "Limpeza", date: "2026-01-08" },
    { id: "e7", description: "Conserto Ar Condicionado Q3", value: 450, category: "Manutenção", date: "2026-01-12" },
    { id: "e8", description: "Compras Supermercado", value: 1200, category: "Alimentação", date: "2026-01-07" },
    { id: "e9", description: "Anúncio Booking.com", value: 200, category: "Marketing", date: "2026-01-01" },
    { id: "e10", description: "IPTU Parcela 1", value: 380, category: "Impostos", date: "2026-01-15" },
  ])

  const rooms = [1, 2, 3, 4, 5, 6, 7, 8]

  const handleAddBooking = (booking: Omit<Booking, "id">) => {
    const newBooking: Booking = {
      ...booking,
      id: crypto.randomUUID(),
    }
    setBookings([...bookings, newBooking])
    setShowForm(false)
    setSelectedRoom(null)
    setSelectedDate(null)
  }

  const handleUpdateBooking = (booking: Omit<Booking, "id">) => {
    if (!editingBooking) return

    const updatedBooking: Booking = {
      ...booking,
      id: editingBooking.id,
    }
    setBookings(bookings.map((b) => (b.id === editingBooking.id ? updatedBooking : b)))
    setEditingBooking(null)
    setShowForm(false)
    setSelectedBooking(updatedBooking)
  }

  const handleDeleteBooking = (id: string) => {
    setBookings(bookings.filter((b) => b.id !== id))
    if (selectedBooking?.id === id) {
      setSelectedBooking(null)
    }
  }

  const handleCalendarSelect = (number: number, date: string) => {
    setSelectedRoom(number)
    setSelectedDate(date)
    setEditingBooking(null)
    setShowForm(true)
  }

  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking)
    setEditingBooking(booking)
    setSelectedRoom(booking.number)
    setSelectedDate(booking.checkIn)
    setShowForm(true)
  }

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking)
    setSelectedRoom(booking.number)
    setSelectedDate(booking.checkIn)
    setShowForm(true)
  }

  const handleAddExpense = (expense: Omit<Expense, "id">) => {
    const newExpense: Expense = {
      ...expense,
      id: crypto.randomUUID(),
    }
    setExpenses([...expenses, newExpense])
  }

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter((e) => e.id !== id))
  }

  const handleUpdateExpense = (expense: Expense) => {
    setExpenses(expenses.map((e) => (e.id === expense.id ? expense : e)))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-6 px-4">
        <div className="max-w-[1400px] mx-auto">
          <h1 className="text-3xl md:text-4xl font-serif font-bold">Pousada do Chicó</h1>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-primary-foreground/90">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              São Roque de Minas, MG
            </span>
            <span className="flex items-center gap-1.5">
              <Phone className="w-4 h-4" />
              (37) 99999-9999
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6 border-b border-border">
          <button
            onClick={() => setActiveTab("reservas")}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 -mb-px ${activeTab === "reservas"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
          >
            <Calendar className="w-4 h-4" />
            Reservas
          </button>
          <button
            onClick={() => setActiveTab("financeiro")}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 -mb-px ${activeTab === "financeiro"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
          >
            <Wallet className="w-4 h-4" />
            Financeiro
          </button>
        </div>

        {activeTab === "reservas" ? (
          <>
            {/* Botão Nova Reserva */}
            <div className="flex justify-end mb-4">
              <button
                onClick={() => {
                  setSelectedRoom(null)
                  setSelectedDate(null)
                  setEditingBooking(null)
                  setShowForm(true)
                }}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                <Calendar className="w-4 h-4" />
                Nova Reserva
              </button>
            </div>

            {/* Calendário Estilo Booking */}
            <BookingCalendar
              bookings={bookings}
              onSelectRoom={handleCalendarSelect}
              onBookingClick={handleBookingClick}
            />

            {/* Seção de Dados dos Hóspedes */}
            <GuestDetails
              bookings={bookings}
              selectedBooking={selectedBooking}
              onSelectBooking={setSelectedBooking}
              onDeleteBooking={handleDeleteBooking}
              onEditBooking={handleEditBooking}
            />
          </>
        ) : (
          /* Aba de Controle Financeiro */
          <FinancialControl
            bookings={bookings}
            expenses={expenses}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
            onUpdateExpense={handleUpdateExpense}
          />
        )}

        {/* Formulário de Reserva */}
        {showForm && (
          <BookingForm
            selectedRoom={selectedRoom}
            selectedDate={selectedDate}
            rooms={rooms}
            onSubmit={editingBooking ? handleUpdateBooking : handleAddBooking}
            onClose={() => {
              setShowForm(false)
              setSelectedRoom(null)
              setSelectedDate(null)
              setEditingBooking(null)
            }}
            existingBookings={bookings}
            editingBooking={editingBooking}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-muted py-4 px-4 mt-8">
        <div className="max-w-[1400px] mx-auto text-center text-muted-foreground text-sm">
          <p>Pousada do Chicó - São Roque de Minas, MG</p>
        </div>
      </footer>
    </div>
  )
}
