export type ExpenseCategory =
  | 'water'
  | 'electricity'
  | 'gas'
  | 'internet'
  | 'maintenance'
  | 'salaries'
  | 'supplies'
  | 'marketing'
  | 'taxes'
  | 'other';

export interface Expense {
  id: string;
  innId: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  date: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseRequest {
  category: ExpenseCategory;
  description: string;
  amount: number;
  date: string;
  notes?: string;
}

export interface UpdateExpenseRequest {
  category?: ExpenseCategory;
  description?: string;
  amount?: number;
  date?: string;
  notes?: string;
}

export interface FinancialMetrics {
  totalRevenue: number;
  totalExpenses: number;
  balance: number;
  expensesByCategory: Record<ExpenseCategory, number>;
}

export interface MonthlyFinancialData {
  year: number;
  month: number;
  metrics: FinancialMetrics;
  expenses: Expense[];
}
