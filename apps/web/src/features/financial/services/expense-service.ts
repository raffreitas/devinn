import { api } from "@/shared/lib/http-client";
import type { ApiResponse } from "@/shared/types";
import type {
  CreateExpenseRequest,
  CreateRecurringExpenseRequest,
  Expense,
  ExpenseFilters,
  UpdateExpenseRequest,
} from "../types";

export const expenseService = {
  getAll: async (filters?: ExpenseFilters): Promise<Expense[]> => {
    const params = new URLSearchParams();

    if (filters?.categoryId) params.append("categoryId", filters.categoryId);
    if (filters?.paymentMethod)
      params.append("paymentMethod", filters.paymentMethod.toString());
    if (filters?.status) params.append("status", filters.status);
    if (filters?.dueDateFrom) params.append("dueDateFrom", filters.dueDateFrom);
    if (filters?.dueDateTo) params.append("dueDateTo", filters.dueDateTo);
    if (filters?.pageNumber)
      params.append("pageNumber", filters.pageNumber.toString());
    if (filters?.pageSize)
      params.append("pageSize", filters.pageSize.toString());

    const response = await api.get<ApiResponse<Expense[]>>("/api/v1/expenses", {
      params,
    });
    return response.data.data;
  },

  create: async (data: CreateExpenseRequest): Promise<{ id: string }> => {
    const response = await api.post<ApiResponse<{ id: string }>>(
      "/api/v1/expenses",
      data,
    );
    return response.data.data;
  },

  createRecurring: async (
    data: CreateRecurringExpenseRequest,
  ): Promise<{ id: string }> => {
    const response = await api.post<ApiResponse<{ id: string }>>(
      "/api/v1/recurring-expenses",
      data,
    );
    return response.data.data;
  },

  update: async (
    id: string,
    data: UpdateExpenseRequest,
  ): Promise<{ id: string }> => {
    const response = await api.put<ApiResponse<{ id: string }>>(
      `/api/v1/expenses/${id}`,
      data,
    );
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/expenses/${id}`);
  },
};
