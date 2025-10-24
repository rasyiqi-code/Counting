import { z } from 'zod';
import { DepreciationMethod } from '@/shared/types';

/**
 * Fixed Assets Module Types
 */

export interface CreateFixedAssetInput {
  name: string;
  description?: string;
  category: string;
  purchaseDate: Date | string;
  purchasePrice: number;
  residualValue?: number;
  usefulLife: number; // in months
  depreciationMethod: string;
  assetAccountId: string;
  depreciationExpenseAccountId: string;
  accumulatedDepreciationAccountId: string;
}

export interface UpdateFixedAssetInput {
  id: string;
  name?: string;
  description?: string;
  category?: string;
  residualValue?: number;
  usefulLife?: number;
  status?: string;
}

export interface CalculateDepreciationInput {
  assetId: string;
  period: Date | string; // Month/Year
}

export interface DisposalAssetInput {
  assetId: string;
  disposalDate: Date | string;
  disposalAmount: number;
}

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

export const createFixedAssetSchema = z.object({
  name: z.string().min(1, 'Asset name is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  purchaseDate: z.coerce.date(),
  purchasePrice: z.number().min(0.01, 'Purchase price must be greater than 0'),
  residualValue: z.number().min(0).default(0),
  usefulLife: z.number().int().min(1, 'Useful life must be at least 1 month'),
  depreciationMethod: z.enum([
    DepreciationMethod.STRAIGHT_LINE,
    DepreciationMethod.DECLINING_BALANCE,
  ]),
  assetAccountId: z.string().uuid(),
  depreciationExpenseAccountId: z.string().uuid(),
  accumulatedDepreciationAccountId: z.string().uuid(),
});

export const updateFixedAssetSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  residualValue: z.number().min(0).optional(),
  usefulLife: z.number().int().min(1).optional(),
  status: z.string().optional(),
});

export const calculateDepreciationSchema = z.object({
  assetId: z.string().uuid(),
  period: z.coerce.date(),
});

export const disposalAssetSchema = z.object({
  assetId: z.string().uuid(),
  disposalDate: z.coerce.date(),
  disposalAmount: z.number().min(0),
});

export const getFixedAssetSchema = z.object({
  id: z.string().uuid(),
});

export const deleteFixedAssetSchema = z.object({
  id: z.string().uuid(),
});

