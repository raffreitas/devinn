export type PaymentMethod =
  | "Cash"
  | "Pix"
  | "DebitCard"
  | "CreditCard"
  | "BankTransfer";

export const PaymentMethod = {
  Cash: "Cash" as PaymentMethod,
  Pix: "Pix" as PaymentMethod,
  DebitCard: "DebitCard" as PaymentMethod,
  CreditCard: "CreditCard" as PaymentMethod,
  BankTransfer: "BankTransfer" as PaymentMethod,
} as const;

export const ExpenseStatus = {
  PAID: "Paid",
  PENDING: "Pending",
  OVERDUE: "Overdue",
  DUE_TODAY: "DueToday",
  CANCELLED: "Cancelled",
} as const;

export type ExpenseStatus = (typeof ExpenseStatus)[keyof typeof ExpenseStatus];

export const RecurringExpenseStatus = {
  ACTIVE: "Active",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
} as const;

export type RecurringExpenseStatus =
  (typeof RecurringExpenseStatus)[keyof typeof RecurringExpenseStatus];

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  Cash: "Dinheiro",
  Pix: "PIX",
  DebitCard: "Cartão de Débito",
  CreditCard: "Cartão de Crédito",
  BankTransfer: "Transferência Bancária",
};

export interface ExpenseCategory {
  id: string;
  name: string;
}

export interface Expense {
  id: string;
  categoryId: string;
  categoryName: string;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  dueDate: string; // ISO date string
  paymentDate: string | null; // ISO date string
  status: ExpenseStatus;
  recurringExpenseId: string | null;
  recurringExpenseDescription: string | null;
}

export interface RecurringExpense {
  id: string;
  categoryId: string;
  categoryName: string;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  startDate: string;
  dayOfMonth: number;
  endDate: string | null;
  maxOccurrences: number | null;
  lastGeneratedDueDate: string | null;
  generatedOccurrencesCount: number;
  status: RecurringExpenseStatus;
  nextDueDate: string | null;
}

export interface CreateExpenseRequest {
  categoryId: string;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  dueDate: string; // ISO date string (YYYY-MM-DD)
  paymentDate?: string; // ISO date string (YYYY-MM-DD)
}

export interface CreateRecurringExpenseRequest {
  categoryId: string;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  startDate: string; // ISO date string (YYYY-MM-DD)
  endDate?: string; // ISO date string (YYYY-MM-DD)
}

export interface UpdateExpenseRequest {
  categoryId: string;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  dueDate: string; // ISO date string (YYYY-MM-DD)
  paymentDate?: string; // ISO date string (YYYY-MM-DD)
}

export interface ExpenseFilters {
  categoryId?: string;
  paymentMethod?: PaymentMethod;
  status?: string;
  dueDateFrom?: string; // ISO date string (YYYY-MM-DD)
  dueDateTo?: string; // ISO date string (YYYY-MM-DD)
  pageNumber?: number;
  pageSize?: number;
}

export interface RecurringExpenseFilters {
  status?: RecurringExpenseStatus;
  page?: number;
  pageSize?: number;
}

export interface UpdateRecurringExpenseRequest {
  categoryId: string;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  startDate: string;
  endDate?: string;
}
