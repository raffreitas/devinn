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

export function useCalculatePriceBreakdown({
  roomCategoryId,
  checkIn,
  checkOut,
  adults,
  children,
  childrenAges,
}: UseCalculatePriceBreakdownParams) {
  const isReady =
    !!roomCategoryId && !!checkIn && !!checkOut && adults > 0 && children >= 0;

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "priceBreakdown",
      roomCategoryId,
      checkIn?.toISOString(),
      checkOut?.toISOString(),
      adults,
      children,
      JSON.stringify(childrenAges),
    ],
    queryFn: async () => {
      if (!isReady) return null;

      const childrenAgesArray = childrenAges
        .map((c) => c.age)
        .filter((age) => age >= 0);

      return await bookingService.calculatePriceBreakdown(
        roomCategoryId,
        checkIn,
        checkOut,
        adults,
        children,
        childrenAgesArray,
      );
    },
    enabled: isReady,
    staleTime: 30_000,
  });

  return {
    priceBreakdown: data,
    isLoading,
    error,
    isReady,
  };
}
