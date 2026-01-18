import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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
