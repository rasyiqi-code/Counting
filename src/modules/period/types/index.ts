import { z } from 'zod';

/**
 * Period Module Types
 */

export interface ClosePeriodInput {
  year: number;
  month: number;
}

export interface CloseYearInput {
  year: number;
}

export interface ReopenPeriodInput {
  year: number;
  month: number;
}

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

export const closePeriodSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12),
});

export const closeYearSchema = z.object({
  year: z.number().int().min(2000).max(2100),
});

export const reopenPeriodSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12),
});

