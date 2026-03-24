import { api } from "@/shared/lib/http-client";
import type { ApiResponse } from "@/shared/types";

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResult = {
  accessToken: string;
};

export type Profile = {
  name: string;
  email: string;
};

export const authService = {
  login: async (payload: LoginRequest): Promise<LoginResult> => {
    const response = await api.post<ApiResponse<LoginResult>>(
      "/api/v1/auth/login",
      payload,
    );

    return response.data.data;
  },

  getProfile: async (): Promise<Profile> => {
    const response = await api.get<ApiResponse<Profile>>("/api/v1/auth/me");

    return response.data.data;
  },

  updateProfile: async (payload: {
    name: string;
    email?: string;
  }): Promise<void> => {
    await api.put<ApiResponse<Profile>>("/api/v1/auth/me", payload);
  },

  updatePassword: async (payload: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> => {
    await api.put("/api/v1/auth/me/password", payload);
  },

  forgotPassword: async (payload: { email: string }): Promise<void> => {
    await api.post("/api/v1/auth/forgot-password", payload);
  },

  resetPassword: async (payload: {
    userId: string;
    token: string;
    newPassword: string;
  }): Promise<void> => {
    await api.post("/api/v1/auth/reset-password", payload);
  },
};
