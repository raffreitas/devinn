import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/contexts/auth-context";
import { expenseCategoryService } from "../services/expense-category-service";

export function useExpenseCategories() {
  const { innId } = useAuth();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["expense-categories", innId],
    queryFn: expenseCategoryService.getAll,
    enabled: !!innId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    categories: data,
    isLoading,
    refetch,
  };
}

export function useCreateExpenseCategory() {
  const queryClient = useQueryClient();
  const { innId } = useAuth();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: expenseCategoryService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["expense-categories", innId],
      });
      toast.success("Categoria criada com sucesso");
    },
    onError: () => {
      toast.error("Erro ao criar categoria");
    },
  });

  return {
    createCategory: mutateAsync,
    isLoading: isPending,
  };
}
