import type { Booking, BookingSource } from "../types";

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
  return (
    isBlock(booking) &&
    isICalSource(booking.source) &&
    booking.pricing.total === 0
  );
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
