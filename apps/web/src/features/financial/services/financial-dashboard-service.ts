import { api } from "@/shared/lib/http-client";
import type { ApiResponse } from "@/shared/types";
import type { FinancialDashboardMetrics } from "../types";

export const financialDashboardService = {
  getMetrics: async (
    referenceDate?: string,
  ): Promise<FinancialDashboardMetrics> => {
    const params = new URLSearchParams();

    if (referenceDate) {
      params.append("referenceDate", referenceDate);
    }

    const response = await api.get<ApiResponse<FinancialDashboardMetrics>>(
      "/api/v1/financial/dashboard",
      { params },
    );

    return response.data.data;
  },
};
