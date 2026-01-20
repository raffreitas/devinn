import { useQuery } from "@tanstack/react-query";
import { authService } from "../services/auth-service";

export function useProfile() {
  const { data, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => {
      return authService.getProfile();
    },
  });

  return {
    data: data,
    isLoading: isLoading,
  };
}
