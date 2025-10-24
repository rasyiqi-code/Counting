import { z } from 'zod';

/**
 * Cash & Bank Module Types
 */

export interface CreateOtherIncomeInput {
  bankAccountId: string;
  date: Date | string;
  amount: number;
  incomeAccountId: string;
  description: string;
  referenceNo?: string;
}

export interface CreateOtherExpenseInput {
  bankAccountId: string;
  date: Date | string;
  amount: number;
  expenseAccountId: string;
  description: string;
  referenceNo?: string;
  isReimbursement?: boolean;
  employeeId?: string;
}

export interface CreateBankTransferInput {
  fromBankAccountId: string;
  toBankAccountId: string;
  date: Date | string;
  amount: number;
  description: string;
  referenceNo?: string;
}

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

export const createOtherIncomeSchema = z.object({
  bankAccountId: z.string().uuid(),
  date: z.coerce.date(),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  incomeAccountId: z.string().uuid(),
  description: z.string().min(1, 'Description is required'),
  referenceNo: z.string().optional(),
});

export const createOtherExpenseSchema = z.object({
  bankAccountId: z.string().uuid(),
  date: z.coerce.date(),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  expenseAccountId: z.string().uuid(),
  description: z.string().min(1, 'Description is required'),
  referenceNo: z.string().optional(),
  isReimbursement: z.boolean().default(false),
  employeeId: z.string().uuid().optional(),
});

export const createBankTransferSchema = z.object({
  fromBankAccountId: z.string().uuid(),
  toBankAccountId: z.string().uuid(),
  date: z.coerce.date(),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  description: z.string().min(1, 'Description is required'),
  referenceNo: z.string().optional(),
}).refine((data) => data.fromBankAccountId !== data.toBankAccountId, {
  message: 'Cannot transfer to same account',
  path: ['toBankAccountId'],
});

