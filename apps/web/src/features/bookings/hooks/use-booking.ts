import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/contexts/auth-context";
import { getHttpErrorMessage } from "@/shared/lib/http-error";
import { bookingService } from "../services/booking-service";
import type {
  BookingStatus,
  PaymentStatus,
  UpdateBookingRequest,
} from "../types";

type UseBookingsParams = {
  status?: BookingStatus;
  paymentStatus?: PaymentStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
};

export function useBookings({
  status,
  paymentStatus,
  startDate,
  endDate,
  page = 1,
  pageSize = 20,
}: UseBookingsParams = {}) {
  const { innId } = useAuth();

  const { data, refetch, isLoading } = useQuery({
    queryKey: [
      "bookings",
      innId,
      status,
      paymentStatus,
      startDate,
      endDate,
      page,
      pageSize,
    ],
    queryFn: () => {
      return bookingService.getAll({
        status: status,
        paymentStatus: paymentStatus,
        startDate,
        endDate,
        page,
        pageSize,
      });
    },
    enabled: !!innId,
    staleTime: 30_000,
  });

  return {
    data,
    isLoading,
    refetch,
  };
}

export function useAllBookings({
  status,
  paymentStatus,
  startDate,
  endDate,
}: Omit<UseBookingsParams, "page" | "pageSize"> = {}) {
  const { innId } = useAuth();

  const { data, refetch, isLoading } = useQuery({
    queryKey: [
      "bookings",
      innId,
      "all",
      status,
      paymentStatus,
      startDate,
      endDate,
    ],
    queryFn: () => {
      return bookingService.getAllPages({
        status: status,
        paymentStatus: paymentStatus,
        startDate,
        endDate,
      });
    },
    enabled: !!innId,
    staleTime: 30_000,
  });

  return {
    data,
    isLoading,
    refetch,
  };
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  const { innId } = useAuth();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: bookingService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings", innId] });
      toast.success("Reserva criada com sucesso");
    },
    onError: (error) => {
      toast.error(getHttpErrorMessage(error, "Erro ao criar reserva"));
    },
  });

  return {
    createBooking: mutateAsync,
    isLoading: isPending,
  };
}

export function useUpdateBooking() {
  const queryClient = useQueryClient();
  const { innId } = useAuth();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBookingRequest }) =>
      bookingService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings", innId] });
      toast.success("Reserva atualizada com sucesso");
    },
    onError: (error) => {
      toast.error(getHttpErrorMessage(error, "Erro ao atualizar reserva"));
    },
  });

  return {
    updateBooking: mutateAsync,
    isLoading: isPending,
  };
}

export function useDeleteBooking() {
  const queryClient = useQueryClient();
  const { innId } = useAuth();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: bookingService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings", innId] });
      toast.success("Reserva removida das listagens ativas");
    },
    onError: (error) => {
      toast.error(getHttpErrorMessage(error, "Erro ao excluir reserva"));
    },
  });

  return {
    deleteBooking: mutateAsync,
    isLoading: isPending,
  };
}
