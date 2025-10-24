import { z } from 'zod';
import { StockMovementType, StockMethod } from '@/shared/types';

/**
 * Inventory Module Types
 */

export interface CreateStockAdjustmentInput {
  productId: string;
  warehouseId?: string;
  quantity: number; // Positive for increase, negative for decrease
  reason: string;
  notes?: string;
}

export interface CreateStockTransferInput {
  productId: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  quantity: number;
  notes?: string;
}

export interface GetStockCardInput {
  productId: string;
  warehouseId?: string;
  startDate?: Date | string;
  endDate?: Date | string;
}

export interface StockValuationInput {
  productId?: string;
  warehouseId?: string;
  asOfDate?: Date | string;
}

export interface StockMovementDetail {
  date: Date;
  movementType: string;
  referenceNo?: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  balance: number;
  notes?: string;
}

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

export const createStockAdjustmentSchema = z.object({
  productId: z.string().uuid(),
  warehouseId: z.string().default('default'),
  quantity: z.number().refine(val => val !== 0, 'Quantity cannot be zero'),
  reason: z.string().min(1, 'Reason is required'),
  notes: z.string().optional(),
});

export const createStockTransferSchema = z.object({
  productId: z.string().uuid(),
  fromWarehouseId: z.string(),
  toWarehouseId: z.string(),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  notes: z.string().optional(),
}).refine((data) => data.fromWarehouseId !== data.toWarehouseId, {
  message: 'Cannot transfer to same warehouse',
  path: ['toWarehouseId'],
});

export const getStockCardSchema = z.object({
  productId: z.string().uuid(),
  warehouseId: z.string().default('default'),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const stockValuationSchema = z.object({
  productId: z.string().uuid().optional(),
  warehouseId: z.string().optional(),
  asOfDate: z.coerce.date().optional(),
});

export const getStockMovementsSchema = z.object({
  productId: z.string().uuid().optional(),
  warehouseId: z.string().optional(),
  movementType: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(50),
});

