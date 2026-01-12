"use client"

import { useState } from "react"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Wallet,
  Receipt,
  PiggyBank,
  Edit2,
  X,
  Check,
} from "lucide-react"
import type { Booking } from "@/app/page"

export interface Expense {
  id: string
  description: string
  value: number
  category: string
  date: string
}

interface FinancialControlProps {
  bookings: Booking[]
  expenses: Expense[]
  onAddExpense: (expense: Omit<Expense, "id">) => void
  onDeleteExpense: (id: string) => void
  onUpdateExpense: (expense: Expense) => void
}

const expenseCategories = [
  "Água",
  "Energia",
  "Internet",
  "Funcionários",
  "Manutenção",
  "Limpeza",
  "Alimentação",
  "Marketing",
  "Impostos",
  "Outros",
]

export function FinancialControl({
  bookings,
  expenses,
  onAddExpense,
  onDeleteExpense,
  onUpdateExpense,
}: FinancialControlProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 0, 1))
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [newExpense, setNewExpense] = useState({
    description: "",
    value: "",
    category: "Outros",
    date: "",
  })

  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ]

  const navigateMonth = (direction: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1))
  }

  // Filtra reservas do mês atual
  const getMonthBookings = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    return bookings.filter((booking) => {
      const checkIn = new Date(booking.checkIn)
      const checkOut = new Date(booking.checkOut)

      // Verifica se a reserva passa pelo mês atual
      const monthStart = new Date(year, month, 1)
      const monthEnd = new Date(year, month + 1, 0)

      return checkIn <= monthEnd && checkOut >= monthStart
    })
  }

  // Filtra despesas do mês atual
  const getMonthExpenses = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    return expenses.filter((expense) => {
      const expenseDate = new Date(expense.date)
      return expenseDate.getFullYear() === year && expenseDate.getMonth() === month
    })
  }

  const monthBookings = getMonthBookings()
  const monthExpenses = getMonthExpenses()

  // Calcula receitas do mês
  const totalRevenue = monthBookings.reduce((sum, b) => sum + b.totalValue, 0)
  const receivedRevenue = monthBookings.reduce((sum, b) => sum + b.paidValue, 0)
  const pendingRevenue = totalRevenue - receivedRevenue

  // Calcula despesas do mês
  const totalExpenses = monthExpenses.reduce((sum, e) => sum + e.value, 0)

  // Balanço
  const balance = receivedRevenue - totalExpenses
  const projectedBalance = totalRevenue - totalExpenses

  // Agrupa despesas por categoria
  const expensesByCategory = monthExpenses.reduce(
    (acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.value
      return acc
    },
    {} as Record<string, number>,
  )

  const handleAddExpense = () => {
    if (!newExpense.description || !newExpense.value || !newExpense.date) return

    onAddExpense({
      description: newExpense.description,
      value: Number.parseFloat(newExpense.value),
      category: newExpense.category,
      date: newExpense.date,
    })

    setNewExpense({ description: "", value: "", category: "Outros", date: "" })
    setShowExpenseForm(false)
  }

  const handleUpdateExpense = () => {
    if (!editingExpense) return
    onUpdateExpense(editingExpense)
    setEditingExpense(null)
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  }

  return (
    <div className="bg-card rounded-xl shadow-lg border border-border mt-6">
      {/* Cabeçalho */}
      <div className="p-4 border-b border-border bg-primary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-serif font-bold text-foreground">Controle Financeiro</h2>
          </div>

          {/* Navegação do Mês */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title="Mês anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-semibold text-lg min-w-[150px] text-center">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title="Próximo mês"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Receita Total */}
        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-emerald-700 font-medium text-sm">Receita Total</span>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-700">{formatCurrency(totalRevenue)}</p>
          <p className="text-xs text-emerald-600 mt-1">{monthBookings.length} reservas no mês</p>
        </div>

        {/* Receita Recebida */}
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-700 font-medium text-sm">Recebido</span>
            <DollarSign className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-700">{formatCurrency(receivedRevenue)}</p>
          <p className="text-xs text-blue-600 mt-1">
            {pendingRevenue > 0 ? `${formatCurrency(pendingRevenue)} pendente` : "Tudo recebido"}
          </p>
        </div>

        {/* Despesas */}
        <div className="bg-red-50 rounded-xl p-4 border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-red-700 font-medium text-sm">Despesas</span>
            <TrendingDown className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-red-700">{formatCurrency(totalExpenses)}</p>
          <p className="text-xs text-red-600 mt-1">{monthExpenses.length} lançamentos</p>
        </div>

        {/* Saldo */}
        <div
          className={`rounded-xl p-4 border ${balance >= 0 ? "bg-primary/10 border-primary/30" : "bg-orange-50 border-orange-200"}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`font-medium text-sm ${balance >= 0 ? "text-primary" : "text-orange-700"}`}>
              Saldo Atual
            </span>
            <PiggyBank className={`w-5 h-5 ${balance >= 0 ? "text-primary" : "text-orange-600"}`} />
          </div>
          <p className={`text-2xl font-bold ${balance >= 0 ? "text-primary" : "text-orange-700"}`}>
            {formatCurrency(balance)}
          </p>
          <p className={`text-xs mt-1 ${balance >= 0 ? "text-primary/80" : "text-orange-600"}`}>
            Projetado: {formatCurrency(projectedBalance)}
          </p>
        </div>
      </div>

      {/* Seções de Receitas e Despesas */}
      <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Receitas do Mês */}
        <div className="border border-border rounded-xl overflow-hidden">
          <div className="bg-emerald-50 px-4 py-3 border-b border-emerald-200">
            <h3 className="font-semibold text-emerald-800 flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              Receitas do Mês
            </h3>
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {monthBookings.length === 0 ? (
              <p className="p-4 text-center text-muted-foreground">Nenhuma reserva neste mês</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    <th className="text-left p-2 font-medium">Hóspede</th>
                    <th className="text-center p-2 font-medium">Quarto</th>
                    <th className="text-right p-2 font-medium">Total</th>
                    <th className="text-right p-2 font-medium">Pago</th>
                  </tr>
                </thead>
                <tbody>
                  {monthBookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-border hover:bg-muted/30">
                      <td className="p-2">{booking.guestName}</td>
                      <td className="p-2 text-center">{booking.roomNumber}</td>
                      <td className="p-2 text-right font-medium">{formatCurrency(booking.totalValue)}</td>
                      <td className="p-2 text-right">
                        <span
                          className={`font-medium ${
                            booking.paidValue >= booking.totalValue
                              ? "text-emerald-600"
                              : booking.paidValue > 0
                                ? "text-amber-600"
                                : "text-red-600"
                          }`}
                        >
                          {formatCurrency(booking.paidValue)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Despesas do Mês */}
        <div className="border border-border rounded-xl overflow-hidden">
          <div className="bg-red-50 px-4 py-3 border-b border-red-200 flex items-center justify-between">
            <h3 className="font-semibold text-red-800 flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Despesas do Mês
            </h3>
            <button
              onClick={() => {
                setNewExpense({
                  ...newExpense,
                  date: `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}-01`,
                })
                setShowExpenseForm(true)
              }}
              className="flex items-center gap-1 text-sm bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Adicionar
            </button>
          </div>

          {/* Formulário de Nova Despesa */}
          {showExpenseForm && (
            <div className="p-4 bg-red-50/50 border-b border-red-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Descrição"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  className="px-3 py-2 border border-border rounded-lg text-sm"
                />
                <input
                  type="number"
                  placeholder="Valor (R$)"
                  value={newExpense.value}
                  onChange={(e) => setNewExpense({ ...newExpense, value: e.target.value })}
                  className="px-3 py-2 border border-border rounded-lg text-sm"
                />
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                  className="px-3 py-2 border border-border rounded-lg text-sm"
                >
                  {expenseCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                  className="px-3 py-2 border border-border rounded-lg text-sm"
                />
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleAddExpense}
                  className="flex items-center gap-1 bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Salvar
                </button>
                <button
                  onClick={() => setShowExpenseForm(false)}
                  className="flex items-center gap-1 bg-muted text-muted-foreground px-4 py-2 rounded-lg text-sm hover:bg-muted/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </button>
              </div>
            </div>
          )}

          <div className="max-h-[300px] overflow-y-auto">
            {monthExpenses.length === 0 ? (
              <p className="p-4 text-center text-muted-foreground">Nenhuma despesa neste mês</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    <th className="text-left p-2 font-medium">Descrição</th>
                    <th className="text-left p-2 font-medium">Categoria</th>
                    <th className="text-center p-2 font-medium">Data</th>
                    <th className="text-right p-2 font-medium">Valor</th>
                    <th className="text-center p-2 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {monthExpenses.map((expense) => (
                    <tr key={expense.id} className="border-b border-border hover:bg-muted/30">
                      {editingExpense?.id === expense.id ? (
                        <>
                          <td className="p-2">
                            <input
                              type="text"
                              value={editingExpense.description}
                              onChange={(e) => setEditingExpense({ ...editingExpense, description: e.target.value })}
                              className="w-full px-2 py-1 border border-border rounded text-sm"
                            />
                          </td>
                          <td className="p-2">
                            <select
                              value={editingExpense.category}
                              onChange={(e) => setEditingExpense({ ...editingExpense, category: e.target.value })}
                              className="w-full px-2 py-1 border border-border rounded text-sm"
                            >
                              {expenseCategories.map((cat) => (
                                <option key={cat} value={cat}>
                                  {cat}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-2">
                            <input
                              type="date"
                              value={editingExpense.date}
                              onChange={(e) => setEditingExpense({ ...editingExpense, date: e.target.value })}
                              className="w-full px-2 py-1 border border-border rounded text-sm"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              value={editingExpense.value}
                              onChange={(e) =>
                                setEditingExpense({ ...editingExpense, value: Number.parseFloat(e.target.value) || 0 })
                              }
                              className="w-full px-2 py-1 border border-border rounded text-sm text-right"
                            />
                          </td>
                          <td className="p-2">
                            <div className="flex justify-center gap-1">
                              <button
                                onClick={handleUpdateExpense}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditingExpense(null)}
                                className="p-1.5 text-muted-foreground hover:bg-muted rounded"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="p-2">{expense.description}</td>
                          <td className="p-2">
                            <span className="px-2 py-0.5 bg-muted rounded-full text-xs">{expense.category}</span>
                          </td>
                          <td className="p-2 text-center">{new Date(expense.date).toLocaleDateString("pt-BR")}</td>
                          <td className="p-2 text-right font-medium text-red-600">{formatCurrency(expense.value)}</td>
                          <td className="p-2">
                            <div className="flex justify-center gap-1">
                              <button
                                onClick={() => setEditingExpense(expense)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onDeleteExpense(expense.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Resumo por Categoria */}
      {Object.keys(expensesByCategory).length > 0 && (
        <div className="p-4 border-t border-border">
          <h3 className="font-semibold mb-3 text-foreground">Despesas por Categoria</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(expensesByCategory)
              .sort(([, a], [, b]) => b - a)
              .map(([category, value]) => (
                <div key={category} className="bg-muted px-3 py-2 rounded-lg flex items-center gap-2">
                  <span className="text-sm font-medium">{category}</span>
                  <span className="text-sm text-red-600 font-semibold">{formatCurrency(value)}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
