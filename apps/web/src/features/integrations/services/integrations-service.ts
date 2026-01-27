import { api } from "@/shared/lib/http-client";
import type { ApiResponse } from "@/shared/types";
import type {
  ChannelIntegration,
  CreateChannelIntegrationRequest,
  UpdateChannelIntegrationRequest,
} from "../types";

export const integrationsService = {
  getAll: async (): Promise<ChannelIntegration[]> => {
    const response = await api.get<ApiResponse<ChannelIntegration[]>>(
      "/api/v1/integrations",
    );
    return response.data.data;
  },

  getById: async (id: string): Promise<ChannelIntegration> => {
    const response = await api.get<ApiResponse<ChannelIntegration>>(
      `/api/v1/integrations/${id}`,
    );
    return response.data.data;
  },

  create: async (
    data: CreateChannelIntegrationRequest,
  ): Promise<{ id: string }> => {
    const response = await api.post<ApiResponse<{ id: string }>>(
      "/api/v1/integrations",
      data,
    );
    return response.data.data;
  },

  update: async (
    id: string,
    data: UpdateChannelIntegrationRequest,
  ): Promise<void> => {
    await api.put(`/api/v1/integrations/${id}`, { id, ...data });
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/integrations/${id}`);
  },

  sync: async (id: string): Promise<{ importedCount: number }> => {
    const response = await api.post<ApiResponse<{ importedCount: number }>>(
      `/api/v1/integrations/${id}/sync`,
    );
    return response.data.data;
  },
};
