import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Booking, PaymentStatus, BookingStatus } from '@/types';

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
}

export function formatDateShort(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'dd/MM/yyyy', { locale: ptBR });
}

export function calculateNights(checkIn: string | Date, checkOut: string | Date): number {
  const start = typeof checkIn === 'string' ? new Date(checkIn) : checkIn;
  const end = typeof checkOut === 'string' ? new Date(checkOut) : checkOut;
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function calculateBookingStatus(checkIn: string, checkOut: string, cancelled: boolean): BookingStatus {
  if (cancelled) return 'cancelled';
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const checkInDate = new Date(checkIn);
  checkInDate.setHours(0, 0, 0, 0);
  
  const checkOutDate = new Date(checkOut);
  checkOutDate.setHours(0, 0, 0, 0);
  
  if (today < checkInDate) return 'scheduled';
  if (today >= checkInDate && today < checkOutDate) return 'checked_in';
  if (today >= checkOutDate) return 'completed';
  
  return 'scheduled';
}

export function calculatePaymentStatus(totalValue: number, paidValue: number): PaymentStatus {
  if (paidValue === 0) return 'pending';
  if (paidValue < totalValue) return 'partial';
  return 'paid';
}

export function getBookingStatusLabel(status: BookingStatus): string {
  const labels: Record<BookingStatus, string> = {
    scheduled: 'Agendada',
    checked_in: 'Hospedado',
    completed: 'Concluída',
    cancelled: 'Cancelada',
  };
  return labels[status] || status;
}

export function getPaymentStatusLabel(status: PaymentStatus): string {
  const labels: Record<PaymentStatus, string> = {
    pending: 'Pendente',
    partial: 'Parcial',
    paid: 'Pago',
  };
  return labels[status] || status;
}

export function getBookingStatusColor(status: BookingStatus): string {
  const colors: Record<BookingStatus, string> = {
    scheduled: 'bg-blue-100 text-blue-800',
    checked_in: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getPaymentStatusColor(status: PaymentStatus): string {
  const colors: Record<PaymentStatus, string> = {
    pending: 'destructive',
    partial: 'secondary',
    paid: 'default',
  };
  return colors[status] || 'default';
}

interface PricingCalculation {
  basePrice: number;
  extraAdultsCount: number;
  extraAdultsPrice: number;
  childrenPrices: Array<{ age: number; price: number; discount: string }>;
  childrenTotalPrice: number;
  dailyTotal: number;
  nights: number;
  totalValue: number;
}

export function calculateBookingPrice(
  basePrice: number,
  extraPersonPrice: number,
  adults: number,
  childrenAges: number[],
  nights: number
): PricingCalculation {
  // Base: 2 adultos incluídos
  const extraAdultsCount = Math.max(0, adults - 2);
  const extraAdultsPrice = extraAdultsCount * extraPersonPrice;
  
  // Crianças com desconto por idade
  const childrenPrices = childrenAges.map(age => {
    let price = 0;
    let discount = '100%';
    
    if (age >= 0 && age <= 4) {
      price = 0;
      discount = '100%';
    } else if (age >= 5 && age <= 10) {
      price = extraPersonPrice * 0.5;
      discount = '50%';
    } else {
      price = extraPersonPrice;
      discount = '0%';
    }
    
    return { age, price, discount };
  });
  
  const childrenTotalPrice = childrenPrices.reduce((sum, child) => sum + child.price, 0);
  const dailyTotal = basePrice + extraAdultsPrice + childrenTotalPrice;
  const totalValue = dailyTotal * nights;
  
  return {
    basePrice,
    extraAdultsCount,
    extraAdultsPrice,
    childrenPrices,
    childrenTotalPrice,
    dailyTotal,
    nights,
    totalValue,
  };
}
