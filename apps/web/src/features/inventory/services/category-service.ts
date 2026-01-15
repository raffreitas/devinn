import { api } from "@/shared/lib/http-client";
import type { ApiResponse } from "@/shared/types";
import type { Category, CreateCategoryRequest } from "../types";

export const categoryService = {
  create: async (data: CreateCategoryRequest) => {
    const response = await api.post<ApiResponse<string>>(
      "/api/v1/room-categories",
      data,
    );
    return response.data;
  },

  getAll: async () => {
    const response = await api.get<ApiResponse<Category[]>>(
      "/api/v1/room-categories",
    );
    return response.data.data;
  },

  update: async (id: string, data: CreateCategoryRequest) => {
    const response = await api.put<ApiResponse<void>>(
      `/api/v1/room-categories/${id}`,
      data,
    );
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/api/v1/room-categories/${id}`);
  },
};
