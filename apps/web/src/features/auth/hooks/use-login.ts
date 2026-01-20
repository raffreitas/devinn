import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { STORAGE_KEYS, storage } from "@/shared/lib/storage";
import { authService, type LoginRequest } from "../services/auth-service";

export function useLogin() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: LoginRequest) => authService.login(payload),
    onSuccess: ({ accessToken }) => {
      storage.set(STORAGE_KEYS.TOKEN, accessToken);
      toast.success("Login realizado com sucesso");
      navigate("/", { replace: true });
    },
    onError: (error) => {
      toast.error((error as Error).message || "Erro ao fazer login");
    },
  });
}
