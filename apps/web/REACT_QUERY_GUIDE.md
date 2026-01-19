#!/usr/bin/env node

# React Query - Guia de Implementação para Evitar "Flashing"

## ✅ Alterações Implementadas

### 1. **react-query.ts** - Configuração Otimizada
```typescript
// ✨ Adicionado: refetchOnMount: false
// Impede refetch ao componente montar novamente
// Mantém cache ao trocar de rotas
defaultOptions: {
  queries: {
    staleTime: 5 * 60 * 1000,      // 5 min
    gcTime: 10 * 60 * 1000,         // 10 min (antes: padrão 5 min)
    refetchOnMount: false,           // 🔑 Novo
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  }
}
```

### 2. **use-inn-data.ts** - Hook Compartilhado
Novo hook que centraliza a query para dados da pousada:
```typescript
export function useInnData(innId?: string) {
  // Usa query factory (queryKeys)
  // Reutilizável em AppHeader, pages, componentes
  // Impede múltiplas requisições
}
```

**Usar em qualquer componente:**
```typescript
import { useInnData } from "@/shared/hooks/use-inn-data";

function MyComponent() {
  const { data: inn, isLoading } = useInnData();
  // ...
}
```

### 3. **query-keys.ts** - Factory Pattern (IMPORTANTE)
Centraliza todas as chaves de cache:
```typescript
export const queryKeys = {
  inns: {
    all: ["inns"] as const,
    detail: (id: string) => [...queryKeys.inns.all, "detail", id],
  },
  bookings: { /* ... */ },
  financial: { /* ... */ },
  // ...
}
```

**Benefícios:**
- Evita typos em cache keys
- Facilita invalidação de cache
- Permite sincronizar múltiplas queries

**Exemplo de uso em mutations:**
```typescript
onSuccess: () => {
  queryClient.invalidateQueries({
    queryKey: queryKeys.inns.all,  // Invalida todas as queries de inns
  });
}
```

### 4. **query-utils.ts** - Utilitários
Funções prontas para prefetch e invalidação:
```typescript
// Pré-carregar dados
await prefetchInnData(queryClient, innId);

// Invalidar cache (útil em mutations)
invalidateInnData(queryClient, innId);
invalidateBookings(queryClient, innId);
```

### 5. **app-layout.tsx** - Memoização de Providers
Providers agora são memoizados com `useMemo`:
```typescript
const layout = useMemo(() => (
  <TenantProvider>
    <SidebarProvider>
      {/* ... */}
    </SidebarProvider>
  </TenantProvider>
), []);
```

**Por que?**
- Evita remount ao navegar (RouteChange > Outlet remonta)
- AppHeader não pisca mais
- Cache do TanStack Query é preservado

---

## 📋 Próximas Implementações (Opcional)

### Em qualquer página que busca dados:

```typescript
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/shared/lib/query-keys";
import { bookingService } from "@/features/bookings/services/booking-service";

export function BookingsPage() {
  const { innId } = useTenant();

  const { data: bookings, isLoading } = useQuery({
    queryKey: queryKeys.bookings.list(innId!),
    enabled: !!innId,
    queryFn: () => bookingService.listBookings(innId!),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // ...
}
```

### Em mutations (criar/atualizar):

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invalidateBookings } from "@/shared/lib/query-utils";

function useCreateBooking() {
  const queryClient = useQueryClient();
  const { innId } = useTenant();

  return useMutation({
    mutationFn: (booking) => bookingService.create(booking),
    onSuccess: () => {
      // Invalida cache de bookings
      invalidateBookings(queryClient, innId);
      toast.success("Reserva criada!");
    },
    onError: () => {
      toast.error("Erro ao criar reserva");
    },
  });
}
```

---

## 🧪 Como Testar

1. **Antes (com flashing):**
   - Navegar entre rotas → Header pisca
   - Dados do header recarregam visualmente

2. **Depois (sem flashing):**
   - Navegar entre rotas → Header mantém dados
   - Sem loading skeleton desnecessário
   - Transição suave

**Teste no DevTools:**
```
Network tab > Slow 3G
Navegue entre rotas
Observe que /inns/:id não aparece novamente
```

---

## 🔗 Referências

- [TanStack Query Docs - Important Defaults](https://tanstack.com/query/latest/docs/react/guides/important-defaults)
- [Query Key Factory Pattern](https://tanstack.com/query/latest/docs/react/community/tkdodos-blog)
- [React Best Practices - Waterfalls](d:\repos\projects\devinn\.github\skills\react-best-practices\SKILL.md)

---

## ⚠️ Pontos Críticos

| Ponto | Antes | Depois |
|-------|-------|--------|
| `refetchOnMount` | padrão (true) | **false** ✅ |
| `gcTime` | 5 min | 10 min |
| Header flashing | ✅ Sim | ❌ Não |
| Cache compartilhado | ❌ Não | ✅ Sim |
| Query deduplication | ❌ Não | ✅ Sim |
| Memoized Layout | ❌ Não | ✅ Sim |
