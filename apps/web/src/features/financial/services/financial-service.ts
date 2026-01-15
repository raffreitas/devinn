import { startOfMonth, endOfMonth, parseISO } from "date-fns";
import { bookingService } from "@/features/bookings/services/booking-service";
import { expenseService } from "./expense-service";
import type {
  FinancialMetrics,
  MonthlyFinancialData,
  ExpenseCategory,
} from "../types";

export const financialService = {
  getMonthlyData: async (
    innId: string,
    year: number,
    month: number,
  ): Promise<MonthlyFinancialData> => {
    const date = new Date(year, month - 1, 1);
    const startDate = startOfMonth(date).toISOString();
    const endDate = endOfMonth(date).toISOString();

    // Get bookings for revenue calculation
    const bookings = await bookingService.getAll(innId, {
      startDate,
      endDate,
    });

    // Get expenses
    const expenses = await expenseService.getAll(innId, startDate, endDate);

    // Calculate revenue from bookings (check-in or check-out in the month)
    const totalRevenue = bookings
      .filter((booking) => {
        const checkIn = parseISO(booking.checkIn);
        const checkOut = parseISO(booking.checkOut);
        const monthStart = parseISO(startDate);
        const monthEnd = parseISO(endDate);

        return (
          (checkIn >= monthStart && checkIn <= monthEnd) ||
          (checkOut >= monthStart && checkOut <= monthEnd)
        );
      })
      .reduce((sum, booking) => sum + booking.totalPaid, 0);

    // Calculate total expenses
    const totalExpenses = expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0,
    );

    // Calculate expenses by category
    const expensesByCategory: Record<ExpenseCategory, number> = {
      water: 0,
      electricity: 0,
      gas: 0,
      internet: 0,
      maintenance: 0,
      salaries: 0,
      supplies: 0,
      marketing: 0,
      taxes: 0,
      other: 0,
    };

    for (const expense of expenses) {
      expensesByCategory[expense.category] += expense.amount;
    }

    const metrics: FinancialMetrics = {
      totalRevenue,
      totalExpenses,
      balance: totalRevenue - totalExpenses,
      expensesByCategory,
    };

    return {
      year,
      month,
      metrics,
      expenses,
    };
  },
};
