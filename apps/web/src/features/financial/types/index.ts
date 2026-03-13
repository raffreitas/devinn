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
  status: string;
}

export interface CreateExpenseRequest {
  categoryId: string;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  dueDate: string; // ISO date string (YYYY-MM-DD)
  paymentDate?: string; // ISO date string (YYYY-MM-DD)
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
