import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { tenantService } from "../services/inn-service";
import type { Inn } from "../types";

export function useInns() {
  const { data, isLoading } = useQuery({
    queryKey: ["inns"],
    queryFn: tenantService.listInns,
  });

  return {
    data: data,
    isLoading: isLoading,
  };
}

export function useInn(id: string) {
  const { data, isLoading } = useQuery({
    queryKey: ["inn", id],
    queryFn: () => {
      return tenantService.getInnById(id);
    },
    enabled: !!id,
  });

  return {
    data: data,
    isLoading: isLoading,
  };
}

export function useUpdateInn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Inn> }) => {
      return tenantService.updateInn(id, payload);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["inn", id] });
      queryClient.invalidateQueries({ queryKey: ["inns"] });
    },
  });
}
