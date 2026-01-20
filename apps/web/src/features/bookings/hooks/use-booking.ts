import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
};

export function useBookings({ status, paymentStatus }: UseBookingsParams = {}) {
  const { data, refetch, isLoading } = useQuery({
    queryKey: ["bookings", status, paymentStatus],
    queryFn: () => {
      return bookingService.getAll({
        status: status,
        paymentStatus: paymentStatus,
      });
    },
  });

  return {
    data,
    isLoading,
    refetch,
  };
}

export function useCreateBooking() {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: bookingService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast.success("Reserva criada com sucesso");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao criar reserva");
    },
  });

  return {
    createBooking: mutateAsync,
    isLoading: isPending,
  };
}

export function useUpdateBooking() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBookingRequest }) =>
      bookingService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast.success("Reserva atualizada com sucesso");
    },
    onError: () => {
      toast.error("Erro ao atualizar reserva");
    },
  });

  return {
    updateBooking: mutateAsync,
    isLoading: isPending,
  };
}

export function useDeleteBooking() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: bookingService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast.success("Reserva excluída com sucesso");
    },
    onError: () => {
      toast.error("Erro ao excluir reserva");
    },
  });

  return {
    deleteBooking: mutateAsync,
    isLoading: isPending,
  };
}
