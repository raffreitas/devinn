import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos - Mantem dados frescos
      gcTime: 10 * 60 * 1000, // 10 minutos - Garbage collection
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: false, // 🔑 IMPORTANTE: não refetch ao montar componente
    },
    mutations: {
      retry: 1,
    },
  },
});
