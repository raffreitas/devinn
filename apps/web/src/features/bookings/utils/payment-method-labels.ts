import type { PaymentMethod } from "../types";

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  Cash: "Dinheiro",
  Pix: "PIX",
  DebitCard: "Cartão de Débito",
  CreditCard: "Cartão de Crédito",
  BankTransfer: "Transferência",
};

export function getPaymentMethodLabel(method: PaymentMethod): string {
  return paymentMethodLabels[method] || method;
}
