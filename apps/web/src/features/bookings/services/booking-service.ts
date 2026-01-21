import { api } from "@/shared/lib/http-client";
import type { ApiResponse } from "@/shared/types";
import type {
  Booking,
  BookingFilters,
  CreateBookingRequest,
  PaymentMethod,
  UpdateBookingRequest,
} from "../types";

export const bookingService = {
  getAll: async (filters?: BookingFilters): Promise<Booking[]> => {
    const params = new URLSearchParams();

    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.paymentStatus)
      params.append("paymentStatus", filters.paymentStatus);

    const response = await api.get<ApiResponse<Booking[]>>("/api/v1/bookings", {
      params,
    });
    return response.data.data.map((booking) => {
      return {
        ...booking,
        checkIn: new Date(booking.checkIn),
        checkOut: new Date(booking.checkOut),
      };
    });
  },

  getById: async (id: string): Promise<Booking | null> => {
    const response = await api.get<ApiResponse<Booking>>(
      `/api/v1/bookings/${id}`,
    );
    return response.data.data;
  },

  create: async (data: CreateBookingRequest): Promise<Booking> => {
    const response = await api.post<ApiResponse<Booking>>(
      "/api/v1/bookings",
      {
        ...data,
        guest: {
          ...data.guest,
          birthDate: data.guest.birthDate || undefined,
          document: data.guest.document || undefined,
        }
      },
    );
    return response.data.data;
  },

  update: async (id: string, data: UpdateBookingRequest): Promise<Booking> => {
    const response = await api.put<ApiResponse<Booking>>(
      `/api/v1/bookings/${id}`,
      data,
    );
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/bookings/${id}`);
  },

  addPayment: async (
    bookingId: string,
    amount: number,
    method: PaymentMethod,
    notes?: string,
  ): Promise<Booking> => {
    const response = await api.post<ApiResponse<Booking>>(
      `/api/v1/bookings/${bookingId}/payments`,
      {
        amount,
        method,
        notes,
      },
    );
    return response.data.data;
  },

  checkConflict: async (
    roomId: string,
    checkIn: string,
    checkOut: string,
    excludeBookingId?: string,
  ): Promise<boolean> => {
    const params = new URLSearchParams({
      roomId,
      checkIn,
      checkOut,
    });

    if (excludeBookingId) {
      params.append("excludeBookingId", excludeBookingId);
    }

    const response = await api.get<ApiResponse<{ available: boolean }>>(
      "/api/v1/bookings/availability",
      { params },
    );
    return !response.data.data.available;
  },
};
