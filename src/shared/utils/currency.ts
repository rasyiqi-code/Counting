import { Decimal } from 'decimal.js';

/**
 * Format angka ke format currency Indonesia (IDR)
 */
export function formatCurrency(
  amount: number | string | Decimal,
  options?: {
    showSymbol?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }
): string {
  const {
    showSymbol = true,
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
  } = options || {};

  const numericAmount = typeof amount === 'string' 
    ? parseFloat(amount) 
    : amount instanceof Decimal 
    ? amount.toNumber() 
    : amount;

  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(numericAmount);

  if (!showSymbol) {
    return formatted.replace(/Rp\s?/, '').trim();
  }

  return formatted;
}

/**
 * Format angka biasa (non-currency)
 */
export function formatNumber(
  value: number | string | Decimal,
  decimals: number = 2
): string {
  const numericValue = typeof value === 'string' 
    ? parseFloat(value) 
    : value instanceof Decimal 
    ? value.toNumber() 
    : value;

  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numericValue);
}

/**
 * Parse string currency ke number
 */
export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^\d,-]/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
}

/**
 * Konversi ke Decimal.js untuk perhitungan presisi tinggi
 */
export function toDecimal(value: number | string | Decimal): Decimal {
  if (value instanceof Decimal) {
    return value;
  }
  return new Decimal(value || 0);
}

/**
 * Format persentase
 */
export function formatPercentage(
  value: number | string | Decimal,
  decimals: number = 2
): string {
  const numericValue = typeof value === 'string' 
    ? parseFloat(value) 
    : value instanceof Decimal 
    ? value.toNumber() 
    : value;

  return `${numericValue.toFixed(decimals)}%`;
}

