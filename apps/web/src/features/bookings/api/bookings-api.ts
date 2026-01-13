import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Booking } from '@/types';

export function useBookings(filters?: { status?: string; month?: string }) {
  return useQuery({
    queryKey: ['bookings', filters],
    queryFn: async () => {
      const { data } = await api.get<Booking[]>('/bookings', { params: filters });
      return data;
    },
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: ['bookings', id],
    queryFn: async () => {
      const { data } = await api.get<Booking>(`/bookings/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (booking: Omit<Booking, 'id' | 'inn_id' | 'created_at' | 'updated_at'>) => {
      const { data } = await api.post<Booking>('/bookings', booking);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useUpdateBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...booking }: Partial<Booking> & { id: string }) => {
      const { data } = await api.put<Booking>(`/bookings/${id}`, booking);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useDeleteBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/bookings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, cancellation_fee }: { id: string; cancellation_fee?: number }) => {
      const { data } = await api.post<Booking>(`/bookings/${id}/cancel`, { cancellation_fee });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useAddPayment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      amount, 
      method, 
      date 
    }: { 
      id: string; 
      amount: number; 
      method: string; 
      date: string;
    }) => {
      const { data } = await api.post<Booking>(`/bookings/${id}/payments`, {
        amount,
        method,
        date,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}
