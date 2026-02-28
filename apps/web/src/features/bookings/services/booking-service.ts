import type { PriceBreakdownResponse } from "@/features/bookings/hooks/use-calculate-price-breakdown.ts";
import { api } from "@/shared/lib/http-client";
import type { ApiResponse, PaginatedResponse } from "@/shared/types";
import type {
  Booking,
  BookingFilters,
  CreateBookingRequest,
  PaymentMethod,
  UpdateBookingRequest,
} from "../types";

export const bookingService = {
  getAll: async (
    filters?: BookingFilters,
  ): Promise<PaginatedResponse<Booking>> => {
    const params = new URLSearchParams();

    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.paymentStatus)
      params.append("paymentStatus", filters.paymentStatus);

    // Mapear 'page' para 'pageNumber' conforme esperado pela API
    params.append("pageNumber", (filters?.page ?? 1).toString());
    params.append("pageSize", (filters?.pageSize ?? 10).toString());

    const response = await api.get<ApiResponse<Booking[]>>("/api/v1/bookings", {
      params,
    });

    const items = response.data.data.map((booking) => {
      return {
        ...booking,
        checkIn: new Date(booking.checkIn),
        checkOut: new Date(booking.checkOut),
      };
    });

    const totalCount = response.data.meta?.totalCount ?? 0;
    const page = response.data.meta?.page ?? 1;
    const pageSize = response.data.meta?.pageSize ?? 10;
    const totalPages = response.data.meta?.totalPages ?? 1;

    return {
      items,
      totalCount,
      page,
      pageSize,
      totalPages,
    };
  },

  getById: async (id: string): Promise<Booking | null> => {
    const response = await api.get<ApiResponse<Booking>>(
      `/api/v1/bookings/${id}`,
    );
    return response.data.data;
  },

  create: async (data: CreateBookingRequest): Promise<Booking> => {
    const response = await api.post<ApiResponse<Booking>>("/api/v1/bookings", {
      ...data,
      guest: {
        ...data.guest,
        birthDate: data.guest.birthDate || undefined,
        document: data.guest.document || undefined,
      },
    });
    return response.data.data;
  },

  update: async (id: string, data: UpdateBookingRequest): Promise<Booking> => {
    const response = await api.put<ApiResponse<Booking>>(
      `/api/v1/bookings/${id}`,
      {
        ...data,
        guest: {
          ...data.guest,
          birthDate: data.guest?.birthDate || undefined,
          document: data.guest?.document || undefined,
        },
      },
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

  calculatePriceBreakdown: async (
    roomCategoryId: string,
    checkIn: Date,
    checkOut: Date,
    adults: number,
    children: number,
    childrenAges: number[],
  ): Promise<PriceBreakdownResponse> => {
    const params = new URLSearchParams({
      roomCategoryId,
      checkIn: checkIn.toISOString(),
      checkOut: checkOut.toISOString(),
      adults: String(adults),
      children: String(children),
    });

    childrenAges.forEach((age) => {
      params.append("childrenAges", String(age));
    });

    const response = await api.get<ApiResponse<PriceBreakdownResponse>>(
      "/api/v1/bookings/price-breakdown",
      { params },
    );

    return response.data.data;
  },
};
