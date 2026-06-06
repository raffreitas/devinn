import type { Booking } from "../../bookings/types";
import { isImportedUnpricedBlock } from "../../bookings/utils/booking-helpers.ts";

export interface FinancialSummary {
  reconciledRevenue: number;
  receivedRevenue: number;
  receivableRevenue: number;
  pendingPricingCount: number;
  reconciledBookingsCount: number;
}

export function calculateFinancialSummary(
  bookings: Booking[],
): FinancialSummary {
  const summary = bookings.reduce<FinancialSummary>(
    (summary, booking) => {
      if (isImportedUnpricedBlock(booking)) {
        summary.pendingPricingCount += 1;
        return summary;
      }

      summary.reconciledRevenue += booking.pricing.total;
      summary.receivedRevenue += booking.totalPaid;
      summary.reconciledBookingsCount += 1;

      return summary;
    },
    {
      reconciledRevenue: 0,
      receivedRevenue: 0,
      receivableRevenue: 0,
      pendingPricingCount: 0,
      reconciledBookingsCount: 0,
    },
  );

  return {
    ...summary,
    receivableRevenue: Math.max(
      0,
      summary.reconciledRevenue - summary.receivedRevenue,
    ),
  };
}

export function getReceivedRevenueMessage(
  summary: FinancialSummary,
  formatCurrency: (value: number) => string,
): string {
  if (summary.reconciledRevenue === 0) {
    return summary.pendingPricingCount > 0
      ? "Conciliação pendente"
      : "Sem receita conciliada";
  }

  if (summary.receivableRevenue > 0) {
    return `${formatCurrency(summary.receivableRevenue)} a receber`;
  }

  return "100% recebido";
}
