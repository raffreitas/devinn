import { api } from "@/shared/lib/http-client";
import type { ApiResponse } from "@/shared/types";
import type { ExpenseCategory } from "../types";

export const expenseCategoryService = {
  getAll: async (): Promise<ExpenseCategory[]> => {
    const response = await api.get<ApiResponse<ExpenseCategory[]>>(
      "/api/v1/expense-categories",
    );
    return response.data.data;
  },

  create: async (name: string): Promise<{ id: string }> => {
    const response = await api.post<ApiResponse<{ id: string }>>(
      "/api/v1/expense-categories",
      { name },
    );
    return response.data.data;
  },
};
