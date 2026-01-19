/**
 * Query Keys Factory
 * Centraliza todas as chaves de cache do react-query para evitar duplicação
 * Referência: https://tanstack.com/query/latest/docs/react/guides/important-defaults
 */

export const queryKeys = {
  inns: {
    all: ["inns"] as const,
    lists: () => [...queryKeys.inns.all, "list"] as const,
    detail: (id: string) => [...queryKeys.inns.all, "detail", id] as const,
  },
  bookings: {
    all: ["bookings"] as const,
    lists: () => [...queryKeys.bookings.all, "list"] as const,
    list: (innId: string) => [...queryKeys.bookings.all, "list", innId] as const,
    detail: (id: string) => [...queryKeys.bookings.all, "detail", id] as const,
  },
  financial: {
    all: ["financial"] as const,
    dashboard: (innId: string) => [...queryKeys.financial.all, "dashboard", innId] as const,
    expenses: (innId: string) => [...queryKeys.financial.all, "expenses", innId] as const,
  },
  inventory: {
    all: ["inventory"] as const,
    categories: (innId: string) => [...queryKeys.inventory.all, "categories", innId] as const,
    rooms: (innId: string) => [...queryKeys.inventory.all, "rooms", innId] as const,
  },
  auth: {
    all: ["auth"] as const,
    profile: () => [...queryKeys.auth.all, "profile"] as const,
    me: () => [...queryKeys.auth.all, "me"] as const,
  },
} as const;
