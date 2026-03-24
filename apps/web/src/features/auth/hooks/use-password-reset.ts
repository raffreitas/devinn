import { useMutation } from "@tanstack/react-query";
import { authService } from "../services/auth-service";

export function useForgotPassword() {
  return useMutation({
    mutationFn: (payload: { email: string }) =>
      authService.forgotPassword(payload),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (payload: {
      userId: string;
      token: string;
      newPassword: string;
    }) => authService.resetPassword(payload),
  });
}
