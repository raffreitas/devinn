import type {
  Expense,
  CreateExpenseRequest,
  UpdateExpenseRequest,
} from "../types";

const STORAGE_KEY_PREFIX = "expenses_";

function getStorageKey(innId: string): string {
  return `${STORAGE_KEY_PREFIX}${innId}`;
}

function getExpenses(innId: string): Expense[] {
  const data = localStorage.getItem(getStorageKey(innId));
  return data ? JSON.parse(data) : [];
}

function saveExpenses(innId: string, expenses: Expense[]): void {
  localStorage.setItem(getStorageKey(innId), JSON.stringify(expenses));
}

export const expenseService = {
  getAll: async (
    innId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<Expense[]> => {
    let expenses = getExpenses(innId);

    if (startDate) {
      expenses = expenses.filter(
        (e) => new Date(e.date) >= new Date(startDate),
      );
    }

    if (endDate) {
      expenses = expenses.filter((e) => new Date(e.date) <= new Date(endDate));
    }

    return expenses.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  },

  getById: async (innId: string, id: string): Promise<Expense | null> => {
    const expenses = getExpenses(innId);
    return expenses.find((e) => e.id === id) || null;
  },

  create: async (
    innId: string,
    data: CreateExpenseRequest,
  ): Promise<Expense> => {
    const expense: Expense = {
      id: crypto.randomUUID(),
      innId,
      category: data.category,
      description: data.description,
      amount: data.amount,
      date: data.date,
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const expenses = getExpenses(innId);
    expenses.push(expense);
    saveExpenses(innId, expenses);

    return expense;
  },

  update: async (
    innId: string,
    id: string,
    data: UpdateExpenseRequest,
  ): Promise<Expense> => {
    const expenses = getExpenses(innId);
    const index = expenses.findIndex((e) => e.id === id);

    if (index === -1) {
      throw new Error("Despesa não encontrada");
    }

    const expense = expenses[index];

    const updatedExpense: Expense = {
      ...expense,
      category: data.category || expense.category,
      description: data.description || expense.description,
      amount: data.amount !== undefined ? data.amount : expense.amount,
      date: data.date || expense.date,
      notes: data.notes !== undefined ? data.notes : expense.notes,
      updatedAt: new Date().toISOString(),
    };

    expenses[index] = updatedExpense;
    saveExpenses(innId, expenses);

    return updatedExpense;
  },

  delete: async (innId: string, id: string): Promise<void> => {
    const expenses = getExpenses(innId);
    const filtered = expenses.filter((e) => e.id !== id);
    saveExpenses(innId, filtered);
  },
};
