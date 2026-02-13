import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/contexts/auth-context";
import { roomService } from "../services/room-service";
import type { CreateRoomRequest, RoomStatus } from "../types";

type RoomsFilters = {
  categoryId?: string;
  status?: RoomStatus;
  page?: number;
  pageSize?: number;
};

export function useRooms({
  categoryId,
  status,
  page = 1,
  pageSize = 10,
}: RoomsFilters = {}) {
  const { innId } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["rooms", innId, categoryId, status, page, pageSize],
    queryFn: () =>
      roomService.getAll({
        categoryId,
        status,
        page,
        pageSize,
      }),
    enabled: !!innId,
    staleTime: 30_000,
  });

  return {
    data,
    isLoading,
  };
}

export function useCreateRoom() {
  const queryClient = useQueryClient();
  const { innId } = useAuth();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: roomService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms", innId] });
      toast.success("Quarto criado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao criar quarto");
    },
  });

  return {
    createRoom: mutateAsync,
    isLoading: isPending,
  };
}

export function useUpdateRoom() {
  const queryClient = useQueryClient();
  const { innId } = useAuth();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateRoomRequest }) =>
      roomService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms", innId] });
      toast.success("Quarto atualizado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao atualizar quarto");
    },
  });

  return {
    updateRoom: mutateAsync,
    isLoading: isPending,
  };
}
