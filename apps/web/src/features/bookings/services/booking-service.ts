import { differenceInDays } from "date-fns";
import type {
  Booking,
  CreateBookingRequest,
  UpdateBookingRequest,
  BookingFilters,
  PricingBreakdown,
  Payment,
  PaymentMethod,
} from "../types";

const STORAGE_KEY_PREFIX = "bookings_";

function getStorageKey(innId: string): string {
  return `${STORAGE_KEY_PREFIX}${innId}`;
}

function getBookings(innId: string): Booking[] {
  const data = localStorage.getItem(getStorageKey(innId));
  return data ? JSON.parse(data) : [];
}

function saveBookings(innId: string, bookings: Booking[]): void {
  localStorage.setItem(getStorageKey(innId), JSON.stringify(bookings));
}

function calculatePricing(
  checkIn: string,
  checkOut: string,
  numberOfGuests: number,
  basePrice: number,
  extraGuestPrice: number,
  roomCapacity: number,
): PricingBreakdown {
  const nights = differenceInDays(new Date(checkOut), new Date(checkIn));
  const extraGuests = Math.max(0, numberOfGuests - roomCapacity);

  const basePriceTotal = basePrice * nights;
  const extraGuestTotal = extraGuestPrice * extraGuests * nights;
  const subtotal = basePriceTotal + extraGuestTotal;

  return {
    basePrice,
    extraGuestPrice,
    numberOfNights: nights,
    numberOfExtraGuests: extraGuests,
    subtotal,
    discounts: 0,
    total: subtotal,
  };
}

function checkConflict(
  innId: string,
  roomId: string,
  checkIn: string,
  checkOut: string,
  excludeBookingId?: string,
): boolean {
  const bookings = getBookings(innId);
  const newCheckIn = new Date(checkIn);
  const newCheckOut = new Date(checkOut);

  return bookings.some((booking) => {
    if (booking.id === excludeBookingId) return false;
    if (booking.roomId !== roomId) return false;
    if (booking.status === "cancelled") return false;

    const existingCheckIn = new Date(booking.checkIn);
    const existingCheckOut = new Date(booking.checkOut);

    return (
      (newCheckIn >= existingCheckIn && newCheckIn < existingCheckOut) ||
      (newCheckOut > existingCheckIn && newCheckOut <= existingCheckOut) ||
      (newCheckIn <= existingCheckIn && newCheckOut >= existingCheckOut)
    );
  });
}

export const bookingService = {
  getAll: async (
    innId: string,
    filters?: BookingFilters,
  ): Promise<Booking[]> => {
    let bookings = getBookings(innId);

    if (filters?.startDate) {
      bookings = bookings.filter(
        (b) => new Date(b.checkIn) >= new Date(filters.startDate!),
      );
    }

    if (filters?.endDate) {
      bookings = bookings.filter(
        (b) => new Date(b.checkOut) <= new Date(filters.endDate!),
      );
    }

    if (filters?.status) {
      bookings = bookings.filter((b) => b.status === filters.status);
    }

    if (filters?.paymentStatus) {
      bookings = bookings.filter(
        (b) => b.paymentStatus === filters.paymentStatus,
      );
    }

    return bookings.sort(
      (a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime(),
    );
  },

  getById: async (innId: string, id: string): Promise<Booking | null> => {
    const bookings = getBookings(innId);
    return bookings.find((b) => b.id === id) || null;
  },

  create: async (
    innId: string,
    data: CreateBookingRequest,
    room: {
      id: string;
      roomNumber: string;
      categoryName: string;
      capacity: number;
      basePrice: number;
      extraGuestPrice: number;
    },
  ): Promise<Booking> => {
    // Check for conflicts
    const hasConflict = checkConflict(
      innId,
      data.roomId,
      data.checkIn,
      data.checkOut,
    );
    if (hasConflict) {
      throw new Error(
        "Já existe uma reserva para este quarto no período selecionado",
      );
    }

    const pricing = calculatePricing(
      data.checkIn,
      data.checkOut,
      data.numberOfGuests,
      room.basePrice,
      room.extraGuestPrice,
      room.capacity,
    );

    const booking: Booking = {
      id: crypto.randomUUID(),
      innId,
      roomId: data.roomId,
      roomNumber: room.roomNumber,
      categoryName: room.categoryName,
      guest: data.guest,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      numberOfGuests: data.numberOfGuests,
      pricing,
      status: "scheduled",
      paymentStatus: "pending",
      payments: [],
      totalPaid: 0,
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const bookings = getBookings(innId);
    bookings.push(booking);
    saveBookings(innId, bookings);

    return booking;
  },

  update: async (
    innId: string,
    id: string,
    data: UpdateBookingRequest,
    room?: { capacity: number; basePrice: number; extraGuestPrice: number },
  ): Promise<Booking> => {
    const bookings = getBookings(innId);
    const index = bookings.findIndex((b) => b.id === id);

    if (index === -1) {
      throw new Error("Reserva não encontrada");
    }

    const booking = bookings[index];

    // Check for conflicts if dates or room changed
    if (data.checkIn || data.checkOut) {
      const checkIn = data.checkIn || booking.checkIn;
      const checkOut = data.checkOut || booking.checkOut;

      const hasConflict = checkConflict(
        innId,
        booking.roomId,
        checkIn,
        checkOut,
        id,
      );
      if (hasConflict) {
        throw new Error(
          "Já existe uma reserva para este quarto no período selecionado",
        );
      }
    }

    // Update pricing if relevant fields changed
    let pricing = booking.pricing;
    if (data.checkIn || data.checkOut || data.numberOfGuests) {
      if (room) {
        pricing = calculatePricing(
          data.checkIn || booking.checkIn,
          data.checkOut || booking.checkOut,
          data.numberOfGuests || booking.numberOfGuests,
          room.basePrice,
          room.extraGuestPrice,
          room.capacity,
        );
      }
    }

    const updatedBooking: Booking = {
      ...booking,
      guest: data.guest || booking.guest,
      checkIn: data.checkIn || booking.checkIn,
      checkOut: data.checkOut || booking.checkOut,
      numberOfGuests: data.numberOfGuests || booking.numberOfGuests,
      status: data.status || booking.status,
      notes: data.notes !== undefined ? data.notes : booking.notes,
      pricing,
      updatedAt: new Date().toISOString(),
    };

    bookings[index] = updatedBooking;
    saveBookings(innId, bookings);

    return updatedBooking;
  },

  delete: async (innId: string, id: string): Promise<void> => {
    const bookings = getBookings(innId);
    const filtered = bookings.filter((b) => b.id !== id);
    saveBookings(innId, filtered);
  },

  addPayment: async (
    innId: string,
    bookingId: string,
    amount: number,
    method: PaymentMethod,
    notes?: string,
  ): Promise<Booking> => {
    const bookings = getBookings(innId);
    const index = bookings.findIndex((b) => b.id === bookingId);

    if (index === -1) {
      throw new Error("Reserva não encontrada");
    }

    const booking = bookings[index];

    const payment: Payment = {
      id: crypto.randomUUID(),
      amount,
      method,
      date: new Date().toISOString(),
      notes,
    };

    const newTotalPaid = booking.totalPaid + amount;
    let paymentStatus: "pending" | "partial" | "paid" = "pending";

    if (newTotalPaid >= booking.pricing.total) {
      paymentStatus = "paid";
    } else if (newTotalPaid > 0) {
      paymentStatus = "partial";
    }

    const updatedBooking: Booking = {
      ...booking,
      payments: [...booking.payments, payment],
      totalPaid: newTotalPaid,
      paymentStatus,
      updatedAt: new Date().toISOString(),
    };

    bookings[index] = updatedBooking;
    saveBookings(innId, bookings);

    return updatedBooking;
  },

  checkConflict: (
    innId: string,
    roomId: string,
    checkIn: string,
    checkOut: string,
    excludeBookingId?: string,
  ): boolean => {
    return checkConflict(innId, roomId, checkIn, checkOut, excludeBookingId);
  },
};
