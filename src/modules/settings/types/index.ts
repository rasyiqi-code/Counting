import { z } from 'zod';

/**
 * Settings Module Types
 */

export interface UpdateCompanyInput {
  name?: string;
  legalName?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  npwp?: string;
  baseCurrency?: string;
}

export interface GetAuditLogsInput {
  entityType?: string;
  entityId?: string;
  userId?: string;
  action?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  page?: number;
  limit?: number;
}

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

export const updateCompanySchema = z.object({
  name: z.string().min(1).optional(),
  legalName: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  postalCode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  npwp: z.string().optional(),
  baseCurrency: z.string().length(3).optional(),
});

export const getAuditLogsSchema = z.object({
  entityType: z.string().optional(),
  entityId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  action: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(50),
});

