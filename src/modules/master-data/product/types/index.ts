import { z } from 'zod';
import { ProductType, StockMethod } from '@/shared/types';

/**
 * Product Types
 */

export interface CreateProductInput {
  type: string; // ProductType: GOODS, SERVICE
  sku: string;
  name: string;
  description?: string;
  category?: string;
  salePrice: number;
  purchasePrice: number;
  unit: string;
  trackInventory: boolean;
  stockMethod?: string; // StockMethod: FIFO, AVERAGE
  minStock?: number;
  maxStock?: number;
  incomeAccountId?: string;
  expenseAccountId?: string;
  assetAccountId?: string;
  taxable: boolean;
  taxRateId?: string;
}

export interface UpdateProductInput {
  id: string;
  sku?: string;
  name?: string;
  description?: string;
  category?: string;
  salePrice?: number;
  purchasePrice?: number;
  unit?: string;
  trackInventory?: boolean;
  stockMethod?: string;
  minStock?: number;
  maxStock?: number;
  incomeAccountId?: string;
  expenseAccountId?: string;
  assetAccountId?: string;
  taxable?: boolean;
  taxRateId?: string;
  isActive?: boolean;
}

export interface GetProductsInput {
  type?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

export const createProductSchema = z.object({
  type: z.enum([ProductType.GOODS, ProductType.SERVICE]),
  sku: z.string().min(1, 'SKU is required'),
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  category: z.string().optional(),
  salePrice: z.number().min(0, 'Sale price must be positive'),
  purchasePrice: z.number().min(0, 'Purchase price must be positive'),
  unit: z.string().default('pcs'),
  trackInventory: z.boolean().default(false),
  stockMethod: z.enum([StockMethod.FIFO, StockMethod.AVERAGE]).default(StockMethod.FIFO),
  minStock: z.number().min(0).optional(),
  maxStock: z.number().min(0).optional(),
  incomeAccountId: z.string().uuid().optional(),
  expenseAccountId: z.string().uuid().optional(),
  assetAccountId: z.string().uuid().optional(),
  taxable: z.boolean().default(true),
  taxRateId: z.string().uuid().optional(),
});

export const updateProductSchema = z.object({
  id: z.string().uuid(),
  sku: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  salePrice: z.number().min(0).optional(),
  purchasePrice: z.number().min(0).optional(),
  unit: z.string().optional(),
  trackInventory: z.boolean().optional(),
  stockMethod: z.enum([StockMethod.FIFO, StockMethod.AVERAGE]).optional(),
  minStock: z.number().min(0).optional(),
  maxStock: z.number().min(0).optional(),
  incomeAccountId: z.string().uuid().optional(),
  expenseAccountId: z.string().uuid().optional(),
  assetAccountId: z.string().uuid().optional(),
  taxable: z.boolean().optional(),
  taxRateId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
});

export const getProductsSchema = z.object({
  type: z.string().optional(),
  category: z.string().optional(),
  search: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export const deleteProductSchema = z.object({
  id: z.string().uuid(),
});

export const getProductSchema = z.object({
  id: z.string().uuid(),
});

