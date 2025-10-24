import { z } from 'zod';
import { PaymentMethod } from '@/shared/types';

/**
 * Purchases Module Types
 */

export interface CreatePurchaseBillInput {
  contactId: string;
  date: Date | string;
  dueDate: Date | string;
  referenceNo?: string;
  description?: string;
  items: PurchaseBillItemInput[];
  notes?: string;
  terms?: string;
}

export interface PurchaseBillItemInput {
  productId: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  taxRateId?: string;
  discountPercent?: number;
}

export interface UpdatePurchaseBillInput {
  id: string;
  contactId?: string;
  date?: Date | string;
  dueDate?: Date | string;
  referenceNo?: string;
  description?: string;
  status?: string;
  notes?: string;
  terms?: string;
}

export interface MakePaymentInput {
  contactId: string;
  bankAccountId: string;
  date: Date | string;
  amount: number;
  paymentMethod: string;
  referenceNo?: string;
  description?: string;
  allocations: PaymentAllocationInput[];
}

export interface PaymentAllocationInput {
  invoiceId: string;
  amount: number;
}

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

export const purchaseBillItemSchema = z.object({
  productId: z.string().uuid(),
  description: z.string().optional(),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  unitPrice: z.number().min(0, 'Unit price must be positive'),
  taxRateId: z.string().uuid().optional(),
  discountPercent: z.number().min(0).max(100).default(0),
});

export const createPurchaseBillSchema = z.object({
  contactId: z.string().uuid(),
  date: z.coerce.date(),
  dueDate: z.coerce.date(),
  referenceNo: z.string().optional(),
  description: z.string().optional(),
  items: z.array(purchaseBillItemSchema).min(1, 'At least one item required'),
  notes: z.string().optional(),
  terms: z.string().optional(),
}).refine((data) => data.dueDate >= data.date, {
  message: 'Due date must be after or equal to bill date',
  path: ['dueDate'],
});

export const updatePurchaseBillSchema = z.object({
  id: z.string().uuid(),
  contactId: z.string().uuid().optional(),
  date: z.coerce.date().optional(),
  dueDate: z.coerce.date().optional(),
  referenceNo: z.string().optional(),
  description: z.string().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
});

export const paymentAllocationSchema = z.object({
  invoiceId: z.string().uuid(),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
});

export const makePaymentSchema = z.object({
  contactId: z.string().uuid(),
  bankAccountId: z.string().uuid(),
  date: z.coerce.date(),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  paymentMethod: z.enum([
    PaymentMethod.CASH,
    PaymentMethod.BANK_TRANSFER,
    PaymentMethod.CHECK,
    PaymentMethod.CREDIT_CARD,
    PaymentMethod.DEBIT_CARD,
    PaymentMethod.E_WALLET,
    PaymentMethod.OTHER,
  ]),
  referenceNo: z.string().optional(),
  description: z.string().optional(),
  allocations: z.array(paymentAllocationSchema).min(1, 'At least one allocation required'),
}).refine((data) => {
  const totalAllocated = data.allocations.reduce((sum, alloc) => sum + alloc.amount, 0);
  return Math.abs(totalAllocated - data.amount) < 0.01;
}, {
  message: 'Total allocations must equal payment amount',
  path: ['allocations'],
});

export const getPurchaseBillsSchema = z.object({
  status: z.string().optional(),
  contactId: z.string().uuid().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  search: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export const deletePurchaseBillSchema = z.object({
  id: z.string().uuid(),
});

export const getPurchaseBillSchema = z.object({
  id: z.string().uuid(),
});

export const getAPAgingSchema = z.object({
  contactId: z.string().uuid().optional(),
  asOfDate: z.coerce.date().optional(),
});

