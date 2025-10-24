import { format, parseISO, isValid, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { id } from 'date-fns/locale';

/**
 * Format tanggal ke format Indonesia (dd/MM/yyyy)
 */
export function formatDate(
  date: Date | string,
  formatStr: string = 'dd/MM/yyyy'
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) {
    return '-';
  }

  return format(dateObj, formatStr, { locale: id });
}

/**
 * Format tanggal dengan waktu
 */
export function formatDateTime(
  date: Date | string,
  formatStr: string = 'dd/MM/yyyy HH:mm'
): string {
  return formatDate(date, formatStr);
}

/**
 * Format tanggal untuk display bulan
 */
export function formatMonth(date: Date | string): string {
  return formatDate(date, 'MMMM yyyy');
}

/**
 * Format tanggal untuk display tahun
 */
export function formatYear(date: Date | string): string {
  return formatDate(date, 'yyyy');
}

/**
 * Get start of month
 */
export function getStartOfMonth(date: Date = new Date()): Date {
  return startOfMonth(date);
}

/**
 * Get end of month
 */
export function getEndOfMonth(date: Date = new Date()): Date {
  return endOfMonth(date);
}

/**
 * Get start of year
 */
export function getStartOfYear(date: Date = new Date()): Date {
  return startOfYear(date);
}

/**
 * Get end of year
 */
export function getEndOfYear(date: Date = new Date()): Date {
  return endOfYear(date);
}

/**
 * Get current accounting period
 */
export function getCurrentPeriod(): { start: Date; end: Date } {
  const now = new Date();
  return {
    start: getStartOfMonth(now),
    end: getEndOfMonth(now),
  };
}

/**
 * Parse date string safely
 */
export function parseDate(dateString: string): Date | null {
  try {
    const parsed = parseISO(dateString);
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

