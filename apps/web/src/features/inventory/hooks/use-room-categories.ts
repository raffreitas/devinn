import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryClient } from "@/shared/lib/react-query";
import { categoryService } from "../services/category-service";
import type { UpdateCategoryRequest } from "../types";

export function useRoomCategories() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryService.getAll,
  });

  return {
    data: categories || [],
    isLoading,
  };
}

export function useCreateRoomCategory() {
  const createMutation = useMutation({
    mutationFn: categoryService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
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
  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: UpdateCategoryRequest) =>
      categoryService.update(id, { ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
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
