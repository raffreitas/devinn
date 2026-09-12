import z from "zod";
import { removeChars } from "@/shared/lib/utils";

const normalizeDigits = (value: string | undefined) => removeChars(value ?? "");

const optionalPhoneSchema = z
  .string()
  .optional()
  .transform((value) => normalizeDigits(value))
  .refine(
    (value) => value === "" || value.length === 10 || value.length === 11,
    {
      message: "Telefone deve ter DDD + número válidos",
    },
  );

const optionalCpfSchema = z
  .string()
  .optional()
  .transform((value) => normalizeDigits(value))
  .refine((value) => value === "" || value.length === 11, {
    message: "CPF deve ter 11 dígitos",
  });

export type BookingStatus =
  | "Scheduled"
  | "CheckedIn"
  | "Completed"
  | "Canceled";
export type PaymentStatus = "Pending" | "Partial" | "Paid";
export type BookingReconciliationStatus =
  | "Imported"
  | "NeedsReview"
  | "Reconciled"
  | "IgnoredExternalBlock";
export type PaymentMethod =
  | "Cash"
  | "Pix"
  | "DebitCard"
  | "CreditCard"
  | "BankTransfer";
export type BookingSource =
  | "Manual"
  | "BookingApi"
  | "BookingIcal"
  | "AirbnbIcal"
  | "DirectWebsite";

export interface Guest {
  name: string;
  email?: string;
  phone?: string;
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

export interface BookingReceiptOptions {
  customAmount?: number;
}

export interface Payment {
  id: string;
  amount: number;
  method: PaymentMethod;
  date: string;
  notes?: string;
}

export interface AuditSummary {
  action: string;
  occurredAt: string;
  summary: string;
}

export interface Booking {
  id: string;
  innId: string;
  roomId: string;
  number: string;
  categoryName: string;
  guest: Guest | null;
  source: BookingSource;
  checkIn: Date;
  checkOut: Date;
  adults: number;
  children: number;
  childrenAges?: number[];
  pricing: PricingBreakdown;
  status: BookingStatus;
  reconciliationStatus?: BookingReconciliationStatus | null;
  paymentStatus: PaymentStatus;
  payments: Payment[];
  totalPaid: number;
  balanceDue: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  lastAudit?: AuditSummary | null;
}

export interface CreateBookingRequest {
  roomId: string;
  guest: Guest;
  checkIn: Date;
  checkOut: Date;
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
  checkIn?: Date;
  checkOut?: Date;
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
  reconciliationStatus?: BookingReconciliationStatus;
  paymentStatus?: PaymentStatus;
  page?: number;
  pageSize?: number;
}

export function mapToFormData(dto?: Booking): BookingFormInput | undefined {
  if (!dto) return undefined;

  return {
    adults: dto.adults,
    children: dto.children,
    childrenAges: dto.childrenAges?.map((age) => ({ age })) || [],
    checkIn: dto.checkIn,
    checkOut: dto.checkOut,
    guestName: dto.guest?.name || "",
    guestEmail: dto.guest?.email || "",
    guestPhone: dto.guest?.phone || "",
    guestBirthDate: dto.guest?.birthDate,
    guestDocument: dto.guest?.document,
    paidAmount: dto.totalPaid,
    paymentMethod: dto.payments[0]?.method,
    paymentNotes: dto.payments[0]?.notes,
    roomId: dto.roomId,
    notes: dto.notes,
  };
}

export const bookingSchema = z
  .object({
    roomId: z.string().min(1, "Quarto é obrigatório"),
    checkIn: z.date({ error: "Data de check-in é obrigatória" }),
    checkOut: z.date({ error: "Data de check-out é obrigatória" }),
    adults: z.number().int().min(1, "Mínimo 1 adulto"),
    children: z.number().int().min(0, "Mínimo 0"),
    childrenAges: z
      .array(z.object({ age: z.number().min(0, "Idade inválida") }))
      .optional(),
    guestName: z.string().min(1, "Nome do hóspede é obrigatório"),
    guestEmail: z.email("E-mail inválido").optional().or(z.literal("")),
    guestPhone: optionalPhoneSchema,
    guestDocument: optionalCpfSchema,
    guestBirthDate: z.string().optional(),
    notes: z.string().optional(),
    paidAmount: z
      .number()
      .min(0, "Valor deve ser maior ou igual a 0")
      .optional(),
    paymentMethod: z
      .enum(["Cash", "Pix", "DebitCard", "CreditCard", "BankTransfer"])
      .optional(),
    paymentNotes: z.string().optional(),
  })
  .refine((data) => data.checkOut > data.checkIn, {
    message: "Data de check-out deve ser posterior ao check-in",
    path: ["checkOut"],
  })
  .refine(
    (data) => {
      if (data.paidAmount && data.paidAmount > 0 && !data.paymentMethod) {
        return false;
      }
      return true;
    },
    {
      message: "Método de pagamento é obrigatório quando há valor pago",
      path: ["paymentMethod"],
    },
  );

export type BookingFormInput = z.input<typeof bookingSchema>;
export type BookingFormData = z.output<typeof bookingSchema>;
