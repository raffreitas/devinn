import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Room, RoomCategory } from '@/types';

// Room Categories
export function useRoomCategories() {
  return useQuery({
    queryKey: ['room-categories'],
    queryFn: async () => {
      const { data } = await api.get<RoomCategory[]>('/room-categories');
      return data;
    },
  });
}

export function useCreateRoomCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (category: Omit<RoomCategory, 'id' | 'inn_id' | 'created_at' | 'updated_at'>) => {
      const { data } = await api.post<RoomCategory>('/room-categories', category);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['room-categories'] });
    },
  });
}

export function useUpdateRoomCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...category }: Partial<RoomCategory> & { id: string }) => {
      const { data } = await api.put<RoomCategory>(`/room-categories/${id}`, category);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['room-categories'] });
    },
  });
}

export function useDeleteRoomCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/room-categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['room-categories'] });
    },
  });
}

// Rooms
export function useRooms() {
  return useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const { data } = await api.get<Room[]>('/rooms');
      return data;
    },
  });
}

export function useCreateRoom() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (room: Omit<Room, 'id' | 'inn_id' | 'created_at' | 'updated_at'>) => {
      const { data } = await api.post<Room>('/rooms', room);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}

export function useUpdateRoom() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...room }: Partial<Room> & { id: string }) => {
      const { data } = await api.put<Room>(`/rooms/${id}`, room);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}

export function useDeleteRoom() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/rooms/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}
