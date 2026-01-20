import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/contexts/auth-context";
import { categoryService } from "../services/category-service";
import type { UpdateCategoryRequest } from "../types";

export function useRoomCategories() {
  const { innId } = useAuth();

  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories", innId],
    queryFn: categoryService.getAll,
    enabled: !!innId,
    staleTime: 5 * 60_000,
  });

  return {
    data: categories || [],
    isLoading,
  };
}

export function useCreateRoomCategory() {
  const queryClient = useQueryClient();
  const { innId } = useAuth();

  const createMutation = useMutation({
    mutationFn: categoryService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories", innId] });
      toast.success("Categoria criada com sucesso");
    },
    onError: () => {
      toast.error("Erro ao criar categoria");
    },
  });

  return {
    createCategory: createMutation.mutateAsync,
    isLoading: createMutation.isPending,
  };
}

export function useUpdateRoomCategory() {
  const queryClient = useQueryClient();
  const { innId } = useAuth();

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: UpdateCategoryRequest) =>
      categoryService.update(id, { ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories", innId] });
      toast.success("Categoria atualizada com sucesso");
    },
    onError: () => {
      toast.error("Erro ao atualizar categoria");
    },
  });

  return {
    updateCategory: updateMutation.mutateAsync,
    isLoading: updateMutation.isPending,
  };
}
