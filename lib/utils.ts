import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === 0 || day === 6 // Sunday or Saturday
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return formatDate(date1) === formatDate(date2)
}

/**
 * Parsira datum string (YYYY-MM-DD) kao lokalno vreme, ne UTC
 * Ovo sprečava problem gdje se prikazuje pogrešan dan zbog timezone razlika
 */
export function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number)
  // Mjesec je 0-indexed u JavaScript Date objektu
  return new Date(year, month - 1, day)
}

