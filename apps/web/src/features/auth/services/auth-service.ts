import type { SignInRequest } from "@/features/auth/types";
import { api } from "@/shared/lib/http-client";
import { STORAGE_KEYS, storage } from "@/shared/lib/storage";
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

    const token = response.data.data?.accessToken;
    if (!token) {
      throw new Error("No access token received");
    }
    storage.set(STORAGE_KEYS.TOKEN, token);

    return { token };
  },

  signOut: () => {
    storage.remove(STORAGE_KEYS.TOKEN);
    storage.remove(STORAGE_KEYS.TENANT_ID);

    // Limpa o cache do React Query
    window.location.href = "/sign-in";
  },
};
