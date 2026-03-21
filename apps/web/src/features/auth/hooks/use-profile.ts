import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { name: string; email?: string }) => {
      return authService.updateProfile(payload);
    },
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(["profile"], updatedProfile);
    },
  });
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: (payload: { currentPassword: string; newPassword: string }) => {
      return authService.updatePassword(payload);
    },
  });
}
