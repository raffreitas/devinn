import { QueryClient } from "@tanstack/react-query";
import { tenantService } from "@/features/tenants/services/tenant-service";
import { queryKeys } from "@/shared/lib/query-keys";

/**
 * Funções de prefetch para popular cache proativamente
 * Útil para evitar waterfall de requisições e melhorar UX
 */

export async function prefetchInnData(queryClient: QueryClient, innId: string) {
  await queryClient.prefetchQuery({
    queryKey: queryKeys.inns.detail(innId),
    queryFn: () => tenantService.getInnById(innId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Invalida cache de uma pousada quando dados mudam
 * Use após mutações (criar, atualizar, deletar)
 */
export function invalidateInnData(queryClient: QueryClient, innId?: string) {
  if (innId) {
    queryClient.invalidateQueries({
      queryKey: queryKeys.inns.detail(innId),
      exact: true,
    });
  } else {
    // Invalida todas as queries de pousadas
    queryClient.invalidateQueries({
      queryKey: queryKeys.inns.all,
    });
  }
}

/**
 * Invalida cache de reservas (útil após mudanças)
 */
export function invalidateBookings(queryClient: QueryClient, innId?: string) {
  if (innId) {
    queryClient.invalidateQueries({
      queryKey: queryKeys.bookings.list(innId),
    });
  } else {
    queryClient.invalidateQueries({
      queryKey: queryKeys.bookings.all,
    });
  }
}
