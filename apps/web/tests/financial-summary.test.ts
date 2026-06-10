import assert from "node:assert/strict";
import test from "node:test";
import type { Booking } from "../src/features/bookings/types/index.ts";
import {
  calculateFinancialSummary,
  getReceivedRevenueMessage,
} from "../src/features/financial/utils/financial-summary.ts";

function booking(overrides: Partial<Booking>): Booking {
  return {
    id: "booking-id",
    innId: "inn-id",
    roomId: "room-id",
    number: "101",
    categoryName: "Standard",
    guest: {
      name: "Guest",
    },
    source: "Manual",
    checkIn: new Date("2026-06-01"),
    checkOut: new Date("2026-06-02"),
    adults: 2,
    children: 0,
    pricing: {
      basePrice: 100,
      extraGuestPrice: 0,
      numberOfNights: 1,
      numberOfExtraGuests: 0,
      subtotal: 100,
      discounts: 0,
      total: 100,
    },
    status: "Scheduled",
    paymentStatus: "Pending",
    payments: [],
    totalPaid: 0,
    balanceDue: 100,
    createdAt: "2026-06-01T00:00:00Z",
    updatedAt: "2026-06-01T00:00:00Z",
    ...overrides,
  };
}

const formatCurrency = (value: number) => `R$ ${value.toFixed(2)}`;

test("marks iCal blocks with NeedsReview as pending financial reconciliation", () => {
  const summary = calculateFinancialSummary([
    booking({
      guest: null,
      source: "BookingIcal",
      reconciliationStatus: "NeedsReview",
      pricing: {
        basePrice: 0,
        extraGuestPrice: 0,
        numberOfNights: 1,
        numberOfExtraGuests: 0,
        subtotal: 0,
        discounts: 0,
        total: 0,
      },
      balanceDue: 0,
    }),
  ]);

  assert.equal(summary.reconciledRevenue, 0);
  assert.equal(summary.receivedRevenue, 0);
  assert.equal(summary.receivableRevenue, 0);
  assert.equal(summary.pendingPricingCount, 1);
  assert.equal(
    getReceivedRevenueMessage(summary, formatCurrency),
    "Conciliação pendente",
  );
});

test("sums only reconciled bookings while preserving pending iCal count", () => {
  const summary = calculateFinancialSummary([
    booking({
      pricing: { ...booking({}).pricing, total: 300 },
      totalPaid: 100,
    }),
    booking({
      guest: null,
      source: "AirbnbIcal",
      reconciliationStatus: "NeedsReview",
      pricing: { ...booking({}).pricing, total: 0 },
      balanceDue: 0,
    }),
  ]);

  assert.equal(summary.reconciledRevenue, 300);
  assert.equal(summary.receivedRevenue, 100);
  assert.equal(summary.receivableRevenue, 200);
  assert.equal(summary.pendingPricingCount, 1);
  assert.equal(
    getReceivedRevenueMessage(summary, formatCurrency),
    "R$ 200.00 a receber",
  );
});

test("ignores external blocks marked as ignored in financial summary", () => {
  const summary = calculateFinancialSummary([
    booking({
      guest: null,
      source: "BookingIcal",
      reconciliationStatus: "IgnoredExternalBlock",
      pricing: { ...booking({}).pricing, total: 500 },
      totalPaid: 500,
      balanceDue: 0,
    }),
  ]);

  assert.equal(summary.reconciledRevenue, 0);
  assert.equal(summary.receivedRevenue, 0);
  assert.equal(summary.pendingPricingCount, 0);
});

test("allows fully received message only when reconciled revenue exists", () => {
  const summary = calculateFinancialSummary([
    booking({
      pricing: { ...booking({}).pricing, total: 150 },
      totalPaid: 150,
    }),
  ]);

  assert.equal(summary.reconciledRevenue, 150);
  assert.equal(summary.receivableRevenue, 0);
  assert.equal(
    getReceivedRevenueMessage(summary, formatCurrency),
    "100% recebido",
  );
});

test("shows open amount for partially received reconciled bookings", () => {
  const summary = calculateFinancialSummary([
    booking({ pricing: { ...booking({}).pricing, total: 250 }, totalPaid: 75 }),
  ]);

  assert.equal(summary.receivableRevenue, 175);
  assert.equal(
    getReceivedRevenueMessage(summary, formatCurrency),
    "R$ 175.00 a receber",
  );
});
