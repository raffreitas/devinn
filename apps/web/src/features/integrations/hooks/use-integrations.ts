import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { integrationsService } from "../services/integrations-service";
import type {
  CreateChannelIntegrationRequest,
  UpdateChannelIntegrationRequest,
} from "../types";

export const INTEGRATIONS_KEYS = {
  all: ["integrations"] as const,
  detail: (id: string) => ["integrations", id] as const,
};

export function useIntegrations() {
  const { data, isLoading } = useQuery({
    queryKey: INTEGRATIONS_KEYS.all,
    queryFn: integrationsService.getAll,
  });

  return { data, isLoading };
}

export function useIntegration(id: string) {
  const { data, isLoading } = useQuery({
    queryKey: INTEGRATIONS_KEYS.detail(id),
    queryFn: () => integrationsService.getById(id),
    enabled: !!id,
  });
  return { data, isLoading };
}

export function useCreateIntegration() {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (data: CreateChannelIntegrationRequest) =>
      integrationsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INTEGRATIONS_KEYS.all });
      toast.success("Integração criada com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao criar integração");
    },
  });

  return { createIntegration: mutateAsync, isPending };
}

export function useUpdateIntegration() {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateChannelIntegrationRequest;
    }) => integrationsService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: INTEGRATIONS_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: INTEGRATIONS_KEYS.detail(variables.id),
      });
      toast.success("Integração atualizada com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao atualizar integração");
    },
  });

  return { updateIntegration: mutateAsync, isPending };
}

export function useDeleteIntegration() {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (id: string) => integrationsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INTEGRATIONS_KEYS.all });
      toast.success("Integração removida com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao remover integração");
    },
  });

  return { deleteIntegration: mutateAsync, isPending };
}

export function useSyncIntegration() {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (id: string) => integrationsService.sync(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: INTEGRATIONS_KEYS.all });
      queryClient.invalidateQueries({ queryKey: INTEGRATIONS_KEYS.detail(id) });
      toast.success(`Sincronização concluída! ${data} reservas importadas.`);
    },
    onError: () => {
      toast.error("Erro ao sincronizar integração");
    },
  });

  return { syncIntegration: mutateAsync, isPending };
}
