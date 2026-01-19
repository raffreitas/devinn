/**
 * Exemplo de uso do novo sistema de React Query
 * Este arquivo mostra como implementar queries em pages/componentes
 * para evitar flashing e refetch desnecessário
 */

// ❌ ANTES (PROBLEMA: Refetch ao montar, sem cache compartilhado)
/*
import { useQuery } from "@tanstack/react-query";
import { bookingService } from "@/features/bookings/services/booking-service";

export function BookingsListPage() {
  const { innId } = useTenant();

  // ❌ Problema:
  // 1. queryKey não é centralizado (typo é possível)
  // 2. Cada componente faz sua própria requisição
  // 3. refetchOnMount é true por padrão
  // 4. Ao trocar de rota, remonta e refetch novamente
  const { data: bookings } = useQuery({
    queryKey: ["bookings", innId],  // ❌ Typo aqui causa cache miss!
    queryFn: () => bookingService.listBookings(innId!),
  });
}
*/

// ✅ DEPOIS (OTIMIZADO: Cache compartilhado, sem flashing)

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTenant } from "@/shared/contexts/tenant-context";
import { queryKeys } from "@/shared/lib/query-keys";
import { invalidateBookings } from "@/shared/lib/query-utils";
import { bookingService } from "@/features/bookings/services/booking-service";
import { toast } from "sonner";

/**
 * Page: Lista de Reservas
 * ✅ Usa query factory para cache key
 * ✅ Sem flashing ao navegar
 * ✅ Cache compartilhado com outros componentes
 */
export function BookingsListPageExample() {
  const { innId } = useTenant();

  // ✅ Benefícios:
  // 1. Query key centralizada em queryKeys (evita typos)
  // 2. refetchOnMount: false (da configuração global)
  // 3. Cache compartilhado automaticamente
  // 4. Se outro componente usa a mesma queryKey, reutiliza dados
  const { data: bookings, isLoading } = useQuery({
    queryKey: queryKeys.bookings.list(innId!),
    enabled: !!innId,
    queryFn: () => bookingService.listBookings(innId!),
    // ✅ Herda configurações do queryClient (refetchOnMount: false, staleTime, etc)
  });

  if (isLoading) return <div>Carregando...</div>;
  if (!bookings) return <div>Sem reservas</div>;

  return (
    <div>
      <h1>Reservas</h1>
      <ul>
        {bookings.map((booking) => (
          <li key={booking.id}>{booking.id}</li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Hook: Criar Reserva
 * ✅ Invalida cache corretamente ao criar
 * ✅ Usa query keys centralizadas
 */
export function useCreateBooking() {
  const queryClient = useQueryClient();
  const { innId } = useTenant();

  return useMutation({
    mutationFn: (data: Parameters<typeof bookingService.create>[0]) =>
      bookingService.create(data),
    onSuccess: () => {
      // ✅ Invalida cache de forma centralizada
      invalidateBookings(queryClient, innId);
      toast.success("Reserva criada com sucesso!");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Erro ao criar reserva",
      );
    },
  });
}

/**
 * Hook: Usar Dados de Inn
 * ✅ Reutilizável em qualquer componente
 * ✅ Cache compartilhado automaticamente
 */
export function useInnDataExample(innId?: string) {
  // Simplesmente importar e usar:
  // const { data: inn } = useInnData(innId);
  // Isso é tudo que você precisa!
}

/**
 * ANTES vs DEPOIS: Comparação
 *
 * ANTES:
 * ❌ Múltiplas requisições para mesmos dados
 * ❌ Header pisca ao trocar de rota
 * ❌ Sem sincronização entre queries
 * ❌ Typos em cache keys causam cache miss
 * ❌ Difícil de invalidar cache
 *
 * DEPOIS:
 * ✅ Cache compartilhado automaticamente
 * ✅ Header mantém dados ao trocar de rota
 * ✅ Queries sincronizadas via factory
 * ✅ Cache keys centralizadas e tipadas
 * ✅ Fácil invalidar com invalidateBookings()
 */
