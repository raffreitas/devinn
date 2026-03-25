import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/contexts/auth-context";
import { expenseService } from "../services/expense-service";
import type {
  ExpenseFilters,
  RecurringExpenseFilters,
  UpdateExpenseRequest,
  UpdateRecurringExpenseRequest,
} from "../types";

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

export function useCreateRecurringExpense() {
  const queryClient = useQueryClient();
  const { innId } = useAuth();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: expenseService.createRecurring,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", innId] });
      queryClient.invalidateQueries({
        queryKey: ["recurring-expenses", innId],
      });
      toast.success("Despesa recorrente criada com sucesso");
    },
    onError: () => {
      toast.error("Erro ao criar despesa recorrente");
    },
  });

  return {
    createRecurringExpense: mutateAsync,
    isLoading: isPending,
  };
}

export function useRecurringExpenses(filters?: RecurringExpenseFilters) {
  const { innId } = useAuth();

  return useQuery({
    queryKey: ["recurring-expenses", innId, filters],
    queryFn: () => expenseService.getRecurring(filters),
    enabled: !!innId,
    staleTime: 30_000,
  });
}

export function useRecurringExpenseById(id?: string | null) {
  const { innId } = useAuth();

  return useQuery({
    queryKey: ["recurring-expense", innId, id],
    queryFn: () => expenseService.getRecurringById(id as string),
    enabled: !!innId && !!id,
    staleTime: 30_000,
  });
}

export function useUpdateRecurringExpense() {
  const queryClient = useQueryClient();
  const { innId } = useAuth();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateRecurringExpenseRequest;
    }) => expenseService.updateRecurring(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["recurring-expenses", innId],
      });
      queryClient.invalidateQueries({ queryKey: ["recurring-expense", innId] });
      queryClient.invalidateQueries({ queryKey: ["expenses", innId] });
      toast.success("Recorrência atualizada com sucesso");
    },
    onError: () => {
      toast.error("Erro ao atualizar recorrência");
    },
  });

  return {
    updateRecurringExpense: mutateAsync,
    isLoading: isPending,
  };
}

export function useCancelRecurringExpense() {
  const queryClient = useQueryClient();
  const { innId } = useAuth();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: expenseService.cancelRecurring,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["recurring-expenses", innId],
      });
      queryClient.invalidateQueries({ queryKey: ["recurring-expense", innId] });
      queryClient.invalidateQueries({ queryKey: ["expenses", innId] });
      toast.success("Recorrência cancelada com sucesso");
    },
    onError: () => {
      toast.error("Erro ao cancelar recorrência");
    },
  });

  return {
    cancelRecurringExpense: mutateAsync,
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
