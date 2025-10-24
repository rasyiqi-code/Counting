import { z } from 'zod';

/**
 * Validator untuk amount (currency/decimal)
 */
export const amountSchema = z
  .union([z.number(), z.string()])
  .transform((val) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return isNaN(num) ? 0 : num;
  })
  .pipe(z.number().min(0, 'Amount must be positive'));

/**
 * Validator untuk date range
 */
export const dateRangeSchema = z.object({
  from: z.date(),
  to: z.date(),
}).refine((data) => data.from <= data.to, {
  message: 'End date must be after start date',
});

/**
 * Validator untuk pagination
 */
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

/**
 * Validator untuk NPWP (Indonesia Tax ID)
 */
export const npwpSchema = z
  .string()
  .regex(/^\d{2}\.\d{3}\.\d{3}\.\d{1}-\d{3}\.\d{3}$/, {
    message: 'Invalid NPWP format. Expected: XX.XXX.XXX.X-XXX.XXX',
  })
  .optional();

/**
 * Validator untuk email
 */
export const emailSchema = z.string().email('Invalid email address');

/**
 * Validator untuk phone number Indonesia
 */
export const phoneSchema = z
  .string()
  .regex(/^(\+62|62|0)[0-9]{9,12}$/, {
    message: 'Invalid phone number format',
  })
  .optional();

/**
 * Validator untuk NIK (Indonesia ID Number)
 */
export const nikSchema = z
  .string()
  .length(16, 'NIK must be 16 digits')
  .regex(/^\d{16}$/, 'NIK must contain only numbers')
  .optional();

/**
 * Common ID validator
 */
export const idSchema = z.string().uuid('Invalid ID format');

/**
 * Non-empty string validator
 */
export const nonEmptyString = z.string().min(1, 'This field is required');

/**
 * Optional string that can be null or undefined
 */
export const optionalString = z.string().optional().nullable();

