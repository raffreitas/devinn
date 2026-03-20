import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names using clsx and tailwind-merge.
 * @param inputs - The class names to combine
 * @returns The merged class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number or string into Brazilian Real currency format.
 * @param value - The numeric value or string to format
 * @returns The formatted currency string in BRL
 */
export const formatMoney = (value: number | string | undefined) => {
  if (value === undefined || value === null) return "";

  const formatter = new Intl.NumberFormat("pt-br", {
    style: "currency",
    currency: "BRL",
  });

  // If a number is provided, treat it as a value in reais already
  // (e.g. 2 -> R$ 2,00). If a string is provided (from raw input),
  // strip non-digits, parse cents and divide by 100.
  if (typeof value === "number") {
    return formatter.format(value);
  }

  const valueWithoutChars = removeChars(value.toString()).trim() || "0";
  const numericValue = Number.parseInt(valueWithoutChars, 10) / 100;

  return formatter.format(numericValue);
};

/**
 * Removes all non-digit characters from the input string.
 * @param value - The string from which to remove non-digit characters
 * @returns The string containing only digit characters
 */
export const removeChars = (value: string) => {
  return value.replace(/\D/g, "");
};

export const formatCpf = (value: string | undefined) => {
  const digits = removeChars(value ?? "").slice(0, 11);

  if (!digits) return "";
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) {
    return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  }
  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

export const formatPhone = (value: string | undefined) => {
  const digits = removeChars(value ?? "").slice(0, 11);

  if (!digits) return "";
  if (digits.length <= 2) return `(${digits}`;

  const areaCode = digits.slice(0, 2);
  const number = digits.slice(2);

  if (digits.length <= 10) {
    const prefix = number.slice(0, 4);
    const suffix = number.slice(4, 8);

    return suffix
      ? `(${areaCode}) ${prefix}-${suffix}`
      : `(${areaCode}) ${prefix}`;
  }

  const prefix = number.slice(0, 5);
  const suffix = number.slice(5, 9);

  return suffix
    ? `(${areaCode}) ${prefix}-${suffix}`
    : `(${areaCode}) ${prefix}`;
};
