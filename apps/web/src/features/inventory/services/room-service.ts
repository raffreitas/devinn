import { api } from "@/shared/lib/http-client";
import type { ApiResponse, PaginatedResponse } from "@/shared/types";
import type { CreateRoomRequest, Room, UpdateRoomRequest } from "../types";

interface GetRoomsParams {
  page?: number;
  pageSize?: number;
  categoryId?: string;
  status?: string;
}

export const roomService = {
  getAll: async (params?: GetRoomsParams): Promise<PaginatedResponse<Room>> => {
    // Mapear 'page' para 'pageNumber' conforme esperado pela API
    const apiParams = {
      pageNumber: params?.page ?? 1,
      pageSize: params?.pageSize ?? 10,
      categoryId: params?.categoryId,
      status: params?.status,
    };

    const response = await api.get<ApiResponse<Room[]>>("/api/v1/rooms", {
      params: apiParams,
    });

    const items = response.data.data;
    const totalCount = response.data.meta?.totalCount ?? 0;
    const page = response.data.meta?.page ?? 1;
    const pageSize = response.data.meta?.pageSize ?? 20;
    const totalPages = response.data.meta?.totalPages ?? 1;

    return {
      items,
      totalCount,
      page,
      pageSize,
      totalPages,
    };
  },

  getById: async (id: string): Promise<Room> => {
    const response = await api.get<Room>(`/api/v1/rooms/${id}`);
    return response.data;
  },

  create: async (data: CreateRoomRequest): Promise<{ id: string }> => {
    const response = await api.post<ApiResponse<string>>("/api/v1/rooms", data);
    return { id: response.data.data };
  },

  update: async (id: string, data: UpdateRoomRequest): Promise<Room> => {
    const response = await api.put<Room>(`/api/v1/rooms/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/rooms/${id}`);
  },
};
