import { api } from "@/shared/lib/http-client";
import type { SignInRequest } from "@/features/auth/types";
import type { ApiResponse } from "@/shared/types";

interface SignInResponse {
  accessToken: string;
}

export const authService = {
  signIn: async ({ email, password }: SignInRequest) => {
    const response = await api.post<ApiResponse<SignInResponse>>(
      "/api/v1/auth/login",
      {
        email,
        password,
      },
    );

    const token = response.data.data?.accessToken!;
    localStorage.setItem("token", token);

    return { token };
  },

  signOut: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("selected_inn_id");
  },
};
