import { api } from '@/shared/lib/http-client';
import type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../types';

export const categoryService = {
  getAll: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/api/v1/room-categories');
    return response.data;
  },

  getById: async (id: string): Promise<Category> => {
    const response = await api.get<Category>(`/api/v1/room-categories/${id}`);
    return response.data;
  },

  create: async (data: CreateCategoryRequest): Promise<Category> => {
    const response = await api.post<Category>('/api/v1/room-categories', data);
    return response.data;
  },

  update: async (id: string, data: UpdateCategoryRequest): Promise<Category> => {
    const response = await api.put<Category>(`/api/v1/room-categories/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/room-categories/${id}`);
  },
};
