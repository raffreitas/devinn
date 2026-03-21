import { api } from "@/shared/lib/http-client";
import type { ApiResponse } from "@/shared/types";
import type { Inn } from "../types";

export const tenantService = {
  listInns: async () => {
    const response = await api.get<ApiResponse<Inn[]>>("/api/v1/inns");
    return response.data?.data ?? [];
  },

  getInnById: async (innId: string) => {
    const response = await api.get<ApiResponse<Inn>>(`/api/v1/inns/${innId}`);
    return response.data.data;
  },

  updateInn: async (innId: string, payload: Partial<Inn>) => {
    const response = await api.put<ApiResponse<Inn>>(`/api/v1/inns/${innId}`, payload);
    return response.data.data;
  },
};
