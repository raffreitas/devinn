export type BookingStatus =
  | "Scheduled"
  | "CheckedIn"
  | "Completed"
  | "Canceled";
export type PaymentStatus = "Pending" | "Partial" | "Paid";
export type PaymentMethod =
  | "Cash"
  | "Pix"
  | "DebitCard"
  | "CreditCard"
  | "BankTransfer";

export interface Guest {
  name: string;
  email?: string;
  phone: string;
  document?: string;
  birthDate?: string;
}

export interface PricingBreakdown {
  basePrice: number;
  extraGuestPrice: number;
  numberOfNights: number;
  numberOfExtraGuests: number;
  subtotal: number;
  discounts: number;
  total: number;
}

export interface Payment {
  id: string;
  amount: number;
  method: PaymentMethod;
  date: string;
  notes?: string;
}

export interface Booking {
  id: string;
  innId: string;
  roomId: string;
  number: string;
  categoryName: string;
  guest: Guest;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  childrenAges?: number[];
  pricing: PricingBreakdown;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  payments: Payment[];
  totalPaid: number;
  balanceDue: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingRequest {
  roomId: string;
  guest: Guest;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  childrenAges?: number[];
  notes?: string;
  paidAmount?: number;
  paymentMethod?: PaymentMethod;
  paymentNotes?: string;
}

export interface UpdateBookingRequest {
  guest?: Guest;
  checkIn?: string;
  checkOut?: string;
  adults?: number;
  children?: number;
  childrenAges?: number[];
  status?: BookingStatus;
  notes?: string;
  roomId?: string;
  paidAmount?: number;
  paymentMethod?: PaymentMethod;
  paymentNotes?: string;
}

export interface BookingFilters {
  startDate?: string;
  endDate?: string;
  status?: BookingStatus;
  paymentStatus?: PaymentStatus;
}
