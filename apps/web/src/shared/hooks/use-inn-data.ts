import { useQuery } from "@tanstack/react-query";
import { tenantService } from "@/features/tenants/services/tenant-service";
import { useAuth } from "@/shared/contexts/auth-context";
import { queryKeys } from "@/shared/lib/query-keys";

/**
 * Hook compartilhado para dados da pousada (Inn)
 * Previne refetch desnecessário ao trocar de rotas mantendo cache
 * Evita "flashing" do header ao navegar
 *
 * @param innId - ID da pousada (opcional, usa contexto se não fornecido)
 */
export function useInnData(innId?: string) {
  const { innId: contextInnId } = useAuth();
  const id = innId ?? contextInnId;

  return useQuery({
    queryKey: queryKeys.inns.detail(id || ""),
    enabled: !!id,
    queryFn: async () => {
      if (!id) throw new Error("No inn ID");
      return tenantService.getInnById(id);
    },
    // Configurações críticas para evitar flashing
    staleTime: 5 * 60 * 1000, // 5 min - Mantem dados frescos
    gcTime: 10 * 60 * 1000, // 10 min - Garbage collection
    refetchOnMount: false, // 🔑 Não refetch quando componente monta novamente
    refetchOnWindowFocus: false, // Evita refetch ao voltar para aba
  });
}
