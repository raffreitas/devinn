import { api } from "@/shared/lib/http-client";
import type {
  Room,
  CreateRoomRequest,
  UpdateRoomRequest,
  PaginatedResponse,
} from "../types";

interface GetRoomsParams {
  page?: number;
  pageSize?: number;
  categoryId?: string;
  status?: string;
}

export const roomService = {
  getAll: async (params?: GetRoomsParams): Promise<PaginatedResponse<Room>> => {
    const response = await api.get<PaginatedResponse<Room>>("/api/v1/rooms", {
      params,
    });
    return response.data;
  },

  getById: async (id: string): Promise<Room> => {
    const response = await api.get<Room>(`/api/v1/rooms/${id}`);
    return response.data;
  },

  create: async (data: CreateRoomRequest): Promise<Room> => {
    const response = await api.post<Room>("/api/v1/rooms", data);
    return response.data;
  },

  update: async (id: string, data: UpdateRoomRequest): Promise<Room> => {
    const response = await api.put<Room>(`/api/v1/rooms/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/rooms/${id}`);
  },
};
