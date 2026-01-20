import { api } from "@/shared/lib/http-client";
import type { ApiResponse } from "@/shared/types";

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResult = {
  accessToken: string;
};

export const authService = {
  login: async (payload: LoginRequest): Promise<LoginResult> => {
    const response = await api.post<ApiResponse<LoginResult>>(
      "/api/v1/auth/login",
      payload,
    );

    return response.data.data;
  },
};
