import { useMutation } from "@tanstack/react-query";
import { authService } from "../services/auth-service";

export function useSignIn() {
  const { mutateAsync, isError } = useMutation({
    mutationFn: authService.signIn,
  });

  return {
    signIn: mutateAsync,
    isError,
  };
}
