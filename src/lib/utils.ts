import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"
import { id } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string | { toString(): string }) {
  const value = typeof amount === "number" ? amount : Number(amount)
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDate(date: Date | string, pattern = "dd MMM yyyy") {
  const d = typeof date === "string" ? new Date(date) : date
  return format(d, pattern, { locale: id })
}

export function formatDateTime(date: Date | string) {
  return formatDate(date, "dd MMM yyyy HH:mm")
}

export function decimalToNumber(value: { toString(): string } | number): number {
  return typeof value === "number" ? value : Number(value.toString())
}
