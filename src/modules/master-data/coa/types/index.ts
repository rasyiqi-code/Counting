import { z } from 'zod';
import { AccountType, AccountCategory } from '@/shared/types';

/**
 * Chart of Accounts Types
 */

export interface CreateAccountInput {
  code: string;
  name: string;
  description?: string;
  accountType: string;
  category: string;
  parentId?: string;
}

export interface UpdateAccountInput {
  id: string;
  code?: string;
  name?: string;
  description?: string;
  accountType?: string;
  category?: string;
  parentId?: string;
  isActive?: boolean;
}

export interface SetOpeningBalanceInput {
  accountId: string;
  balance: number | string;
  date: Date | string;
}

export interface AccountNode {
  id: string;
  code: string;
  name: string;
  accountType: string;
  category: string;
  balance: string;
  isActive: boolean;
  children?: AccountNode[];
}

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

export const createAccountSchema = z.object({
  code: z.string().min(1, 'Account code is required'),
  name: z.string().min(1, 'Account name is required'),
  description: z.string().optional(),
  accountType: z.enum([
    AccountType.ASSET,
    AccountType.LIABILITY,
    AccountType.EQUITY,
    AccountType.REVENUE,
    AccountType.COGS,
    AccountType.EXPENSE,
  ]),
  category: z.string(),
  parentId: z.string().uuid().optional(),
});

export const updateAccountSchema = z.object({
  id: z.string().uuid(),
  code: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  accountType: z.enum([
    AccountType.ASSET,
    AccountType.LIABILITY,
    AccountType.EQUITY,
    AccountType.REVENUE,
    AccountType.COGS,
    AccountType.EXPENSE,
  ]).optional(),
  category: z.string().optional(),
  parentId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
});

export const setOpeningBalanceSchema = z.object({
  accountId: z.string().uuid(),
  balance: z.union([z.number(), z.string()]).transform(val => 
    typeof val === 'string' ? parseFloat(val) : val
  ),
  date: z.coerce.date(),
});

export const deleteAccountSchema = z.object({
  id: z.string().uuid(),
});

export const getAccountSchema = z.object({
  id: z.string().uuid(),
});

