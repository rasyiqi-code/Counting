import { Decimal } from 'decimal.js';
import { z } from 'zod';

/**
 * General Ledger Module Types
 */

export interface JournalEntryDTO {
  accountId: string;
  accountCode?: string;
  accountName?: string;
  debit: Decimal | number | string;
  credit: Decimal | number | string;
  description?: string;
  departmentId?: string;
}

export interface CreateJournalInput {
  date: Date | string;
  description: string;
  referenceNo?: string;
  entries: JournalEntryDTO[];
}

export interface PostJournalInput {
  journalId: string;
}

export interface ReverseJournalInput {
  journalId: string;
  date: Date | string;
  description?: string;
}

export interface GetLedgerInput {
  accountId: string;
  startDate?: Date | string;
  endDate?: Date | string;
}

export interface GetTrialBalanceInput {
  startDate?: Date | string;
  endDate?: Date | string;
}

export interface LedgerEntry {
  date: Date;
  journalNo: string;
  description: string;
  referenceNo?: string;
  debit: Decimal;
  credit: Decimal;
  balance: Decimal;
}

export interface TrialBalanceAccount {
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType: string;
  debit: Decimal;
  credit: Decimal;
}

export interface TrialBalanceSummary {
  accounts: TrialBalanceAccount[];
  totalDebit: Decimal;
  totalCredit: Decimal;
  isBalanced: boolean;
}

// ============================================================================
// ZOD SCHEMAS untuk validasi
// ============================================================================

export const journalEntrySchema = z.object({
  accountId: z.string().uuid(),
  debit: z.union([z.number(), z.string()]).transform(val => 
    typeof val === 'string' ? parseFloat(val) : val
  ),
  credit: z.union([z.number(), z.string()]).transform(val => 
    typeof val === 'string' ? parseFloat(val) : val
  ),
  description: z.string().optional(),
  departmentId: z.string().uuid().optional(),
});

export const createJournalSchema = z.object({
  date: z.coerce.date(),
  description: z.string().min(1, 'Description is required'),
  referenceNo: z.string().optional(),
  entries: z.array(journalEntrySchema).min(2, 'At least 2 entries required'),
}).refine((data) => {
  // Validate that total debit equals total credit
  const totalDebit = data.entries.reduce((sum, e) => sum + Number(e.debit), 0);
  const totalCredit = data.entries.reduce((sum, e) => sum + Number(e.credit), 0);
  return Math.abs(totalDebit - totalCredit) < 0.01; // Allow small floating point difference
}, {
  message: 'Total debit must equal total credit',
});

export const postJournalSchema = z.object({
  journalId: z.string().uuid(),
});

export const reverseJournalSchema = z.object({
  journalId: z.string().uuid(),
  date: z.coerce.date(),
  description: z.string().optional(),
});

export const getLedgerSchema = z.object({
  accountId: z.string().uuid(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const getTrialBalanceSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

