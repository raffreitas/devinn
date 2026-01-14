import type { SignInRequest } from "@/features/auth/types";

export const authService = {
  signIn: async ({ email, password }: SignInRequest) => {
    console.log({ email, password });

    // Simulate an API call
    return new Promise<{ token: string }>((resolve) => {
      setTimeout(() => {
        resolve({ token: "fake-jwt-token" });
      }, 1000);
    });
  },
};
