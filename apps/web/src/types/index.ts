export type UUID = string;

export interface Inn {
  id: UUID;
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface RoomCategory {
  id: UUID;
  inn_id: UUID;
  name: string;
  description?: string;
  max_capacity: number;
  base_price: number;
  extra_person_price: number;
  created_at: string;
  updated_at: string;
}

export type RoomStatus = 'active' | 'maintenance' | 'inactive';

export interface Room {
  id: UUID;
  inn_id: UUID;
  category_id: UUID;
  number: number;
  name?: string;
  status: RoomStatus;
  created_at: string;
  updated_at: string;
  category?: RoomCategory;
}

export type BookingSource = 'manual' | 'booking_api' | 'airbnb_ical' | 'direct_website';
export type BookingStatus = 'scheduled' | 'checked_in' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'partial' | 'paid';

export interface Booking {
  id: UUID;
  inn_id: UUID;
  room_id: UUID;
  guest_name: string;
  phone: string;
  email?: string;
  document?: string;
  birth_date?: string;
  check_in: string;
  check_out: string;
  adults: number;
  children: number;
  children_ages?: number[];
  ages_text?: string;
  notes?: string;
  total_value: number;
  paid_value: number;
  source: BookingSource;
  cancellation_status: boolean;
  created_at: string;
  updated_at: string;
  
  // Campos calculados
  booking_status?: BookingStatus;
  payment_status?: PaymentStatus;
  number_of_nights?: number;
  balance_due?: number;
  
  // Relacionamentos
  room?: Room;
}

export type ExpenseCategory = 
  | 'water' 
  | 'electricity' 
  | 'internet' 
  | 'staff' 
  | 'maintenance' 
  | 'cleaning' 
  | 'food' 
  | 'marketing' 
  | 'taxes' 
  | 'ota_commissions' 
  | 'other';

export type PaymentMethod = 'cash' | 'pix' | 'debit_card' | 'credit_card' | 'bank_transfer';

export interface Expense {
  id: UUID;
  inn_id: UUID;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  payment_method: PaymentMethod;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: UUID;
  name: string;
  email: string;
  role: 'super_admin' | 'inn_admin';
  inn_id?: UUID;
  inn?: Inn;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
}

export interface DashboardMetrics {
  total_revenue: number;
  received_revenue: number;
  pending_revenue: number;
  total_expenses: number;
  real_balance: number;
  projected_balance: number;
  ota_commissions: number;
  expenses_by_category: Record<ExpenseCategory, number>;
}
