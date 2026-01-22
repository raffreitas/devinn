import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/contexts/auth-context";
import { expenseService } from "../services/expense-service";
import type { ExpenseFilters, UpdateExpenseRequest } from "../types";

export function useExpenses(filters?: ExpenseFilters) {
  const { innId } = useAuth();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["expenses", innId, filters],
    queryFn: () => expenseService.getAll(filters),
    enabled: !!innId,
    staleTime: 30_000, // 30 seconds
  });

  return {
    expenses: data,
    isLoading,
    refetch,
  };
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  const { innId } = useAuth();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: expenseService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", innId] });
      toast.success("Despesa criada com sucesso");
    },
    onError: () => {
      toast.error("Erro ao criar despesa");
    },
  });

  return {
    createExpense: mutateAsync,
    isLoading: isPending,
  };
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();
  const { innId } = useAuth();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExpenseRequest }) =>
      expenseService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", innId] });
      toast.success("Despesa atualizada com sucesso");
    },
    onError: () => {
      toast.error("Erro ao atualizar despesa");
    },
  });

  return {
    updateExpense: mutateAsync,
    isLoading: isPending,
  };
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  const { innId } = useAuth();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: expenseService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", innId] });
      toast.success("Despesa excluída com sucesso");
    },
    onError: () => {
      toast.error("Erro ao excluir despesa");
    },
  });

  return {
    deleteExpense: mutateAsync,
    isLoading: isPending,
  };
}
