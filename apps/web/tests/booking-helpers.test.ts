import assert from "node:assert/strict";
import test from "node:test";
import type { Booking } from "../src/features/bookings/types/index.ts";
import {
  getBookingCalendarPresentation,
  getBookingDisplayTitle,
  getBookingSourceLabel,
  getFriendlyICalNote,
  getImportedBookingActionLabel,
  getImportedBookingTechnicalNote,
} from "../src/features/bookings/utils/booking-helpers.ts";

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

test("presents Booking.com iCal reservations pending review as imported reservations", () => {
  const importedBooking = booking({
    guest: null,
    source: "BookingIcal",
    reconciliationStatus: "NeedsReview",
    notes: "Guest name missing",
  });

  assert.equal(getBookingDisplayTitle(importedBooking), "Reserva importada");
  assert.equal(
    getBookingSourceLabel(importedBooking.source),
    "Booking.com (iCal)",
  );
  assert.equal(
    getImportedBookingActionLabel(importedBooking),
    "Completar financeiro",
  );
  assert.equal(
    getImportedBookingTechnicalNote(importedBooking),
    "Guest name missing",
  );
});

test("presents Airbnb iCal reservations pending review as imported reservations", () => {
  const importedBooking = booking({
    guest: null,
    source: "AirbnbIcal",
    reconciliationStatus: "NeedsReview",
  });

  assert.equal(getBookingDisplayTitle(importedBooking), "Reserva importada");
  assert.equal(getBookingSourceLabel(importedBooking.source), "Airbnb (iCal)");
  assert.equal(
    getImportedBookingActionLabel(importedBooking),
    "Completar financeiro",
  );
});

test("translates known raw iCal closed note to a friendly message", () => {
  assert.equal(
    getFriendlyICalNote("CLOSED - Not available"),
    "Indisponível no canal externo",
  );
});

test("keeps manual blocks labeled as blocks without a reconciliation action", () => {
  const manualBlock = booking({
    guest: null,
    source: "Manual",
    reconciliationStatus: "NeedsReview",
  });

  assert.equal(getBookingDisplayTitle(manualBlock), "Bloqueio Manual");
  assert.equal(getImportedBookingActionLabel(manualBlock), undefined);
});

test("presents pending iCal reservations with a distinct calendar color flow", () => {
  const importedBooking = booking({
    guest: null,
    source: "BookingIcal",
    reconciliationStatus: "NeedsReview",
  });

  const presentation = getBookingCalendarPresentation(importedBooking);

  assert.equal(presentation.label, "iCal pendente");
  assert.equal(
    presentation.colorClassName,
    "bg-cyan-600 hover:bg-cyan-500 ring-1 ring-cyan-300/50",
  );
  assert.equal(presentation.icon, "link");
});

test("keeps external blocks gray in the calendar color flow", () => {
  const ignoredBlock = booking({
    guest: null,
    source: "AirbnbIcal",
    reconciliationStatus: "IgnoredExternalBlock",
  });

  const presentation = getBookingCalendarPresentation(ignoredBlock);

  assert.equal(presentation.label, "Bloqueio");
  assert.equal(presentation.colorClassName, "bg-gray-500/85 hover:bg-gray-500");
  assert.equal(presentation.icon, "link");
});

test("keeps payment and canceled statuses mapped to calendar colors", () => {
  assert.equal(
    getBookingCalendarPresentation(booking({ paymentStatus: "Paid" }))
      .colorClassName,
    "bg-emerald-500 hover:bg-emerald-600",
  );
  assert.equal(
    getBookingCalendarPresentation(booking({ paymentStatus: "Partial" }))
      .colorClassName,
    "bg-amber-500 hover:bg-amber-600",
  );
  assert.equal(
    getBookingCalendarPresentation(booking({ status: "Canceled" }))
      .colorClassName,
    "bg-red-600 hover:bg-red-700",
  );
});
