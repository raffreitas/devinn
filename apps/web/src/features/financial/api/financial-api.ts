import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Expense, DashboardMetrics } from '@/types';

export function useDashboardMetrics(month: string) {
  return useQuery({
    queryKey: ['dashboard-metrics', month],
    queryFn: async () => {
      const { data } = await api.get<DashboardMetrics>(`/dashboard/metrics`, {
        params: { month },
      });
      return data;
    },
  });
}

export function useExpenses(filters?: { month?: string; category?: string }) {
  return useQuery({
    queryKey: ['expenses', filters],
    queryFn: async () => {
      const { data } = await api.get<Expense[]>('/expenses', { params: filters });
      return data;
    },
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (expense: Omit<Expense, 'id' | 'inn_id' | 'created_at' | 'updated_at'>) => {
      const { data } = await api.post<Expense>('/expenses', expense);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...expense }: Partial<Expense> & { id: string }) => {
      const { data } = await api.put<Expense>(`/expenses/${id}`, expense);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/expenses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
  });
}
