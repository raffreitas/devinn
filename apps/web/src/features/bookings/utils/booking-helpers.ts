import type {
  Booking,
  BookingReconciliationStatus,
  BookingSource,
} from "../types";

export function isBlock(booking: Booking): boolean {
  return booking.guest === null;
}

export function isRealBooking(booking: Booking): boolean {
  return booking.guest !== null;
}

export function isICalSource(source: BookingSource): boolean {
  return source === "BookingIcal" || source === "AirbnbIcal";
}

export function isImportedUnpricedBlock(booking: Booking): boolean {
  return needsReconciliation(booking);
}

export function needsReconciliation(booking: Booking): boolean {
  return booking.reconciliationStatus === "NeedsReview";
}

export function isIgnoredExternalBlock(booking: Booking): boolean {
  return booking.reconciliationStatus === "IgnoredExternalBlock";
}

export function isFinanciallyReconciled(booking: Booking): boolean {
  return (
    booking.reconciliationStatus === undefined ||
    booking.reconciliationStatus === null ||
    booking.reconciliationStatus === "Reconciled"
  );
}

export function getReconciliationStatusLabel(
  status: BookingReconciliationStatus,
): string {
  const labels: Record<BookingReconciliationStatus, string> = {
    Imported: "Importada",
    NeedsReview: "Revisar",
    Reconciled: "Conciliada",
    IgnoredExternalBlock: "Bloqueio ignorado",
  };
  return labels[status];
}

export function getBookingSourceLabel(source: BookingSource): string {
  const labels: Record<BookingSource, string> = {
    Manual: "Manual",
    BookingApi: "Booking.com",
    BookingIcal: "Booking.com (iCal)",
    AirbnbIcal: "Airbnb (iCal)",
    DirectWebsite: "Website Direto",
  };
  return labels[source];
}

export function getBlockLabel(source: BookingSource): string {
  const labels: Record<BookingSource, string> = {
    Manual: "Bloqueio Manual",
    BookingApi: "Bloqueio Booking.com",
    BookingIcal: "Bloqueio Booking.com",
    AirbnbIcal: "Bloqueio Airbnb",
    DirectWebsite: "Bloqueio Website",
  };
  return labels[source];
}

export function getSourceColor(source: BookingSource): string {
  const colors: Record<BookingSource, string> = {
    Manual: "secondary",
    BookingApi: "#0071C2",
    BookingIcal: "#0071C2",
    AirbnbIcal: "#FF385C",
    DirectWebsite: "primary",
  };
  return colors[source];
}
