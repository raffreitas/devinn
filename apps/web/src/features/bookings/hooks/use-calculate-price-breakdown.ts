import { useQuery } from "@tanstack/react-query";
import { bookingService } from "@/features/bookings/services/booking-service.ts";

export type PriceBreakdownResponse = {
  basePrice: number;
  perPersonPrice: number;
  payingUnits: number;
  childrenCost: number;
  dailyTotal: number;
  nights: number;
  total: number;
};

type UseCalculatePriceBreakdownParams = {
  roomCategoryId?: string;
  checkIn?: Date;
  checkOut?: Date;
  adults: number;
  children: number;
  childrenAges: { age: number }[];
};

type PriceBreakdownQueryParams = {
  roomCategoryId: string;
  checkInIso: string;
  checkOutIso: string;
  adults: number;
  children: number;
  childrenAges: number[];
};

type PriceBreakdownQueryKey = [
  "priceBreakdown",
  PriceBreakdownQueryParams | null,
];

export function useCalculatePriceBreakdown({
  roomCategoryId,
  checkIn,
  checkOut,
  adults,
  children,
  childrenAges,
}: UseCalculatePriceBreakdownParams) {
  const normalizedChildrenAges = childrenAges
    .map((child) => child.age)
    .filter((age) => Number.isFinite(age) && age >= 0);

  const queryParams =
    roomCategoryId &&
    checkIn &&
    checkOut &&
    adults > 0 &&
    children >= 0 &&
    normalizedChildrenAges.length === children
      ? {
          roomCategoryId,
          checkInIso: checkIn.toISOString(),
          checkOutIso: checkOut.toISOString(),
          adults,
          children,
          childrenAges: normalizedChildrenAges,
        }
      : null;

  const { data, isLoading, error } = useQuery<
    PriceBreakdownResponse,
    Error,
    PriceBreakdownResponse,
    PriceBreakdownQueryKey
  >({
    queryKey: ["priceBreakdown", queryParams],
    queryFn: async ({ queryKey }) => {
      const [, params] = queryKey;

      if (!params) {
        throw new Error("Price breakdown query called without parameters.");
      }

      return await bookingService.calculatePriceBreakdown(
        params.roomCategoryId,
        new Date(params.checkInIso),
        new Date(params.checkOutIso),
        params.adults,
        params.children,
        params.childrenAges,
      );
    },
    enabled: queryParams !== null,
    staleTime: 0,
  });

  return {
    priceBreakdown: data,
    isLoading,
    error,
    isReady: queryParams !== null,
  };
}
