import { prisma } from '@/shared/database/prisma';
import { doubleEntryService } from '@/modules/general-ledger';
import {
  CreateOtherIncomeInput,
  CreateOtherExpenseInput,
  CreateBankTransferInput,
} from '../types';
import { Decimal } from 'decimal.js';

/**
 * Cash & Bank Service
 * 
 * Mengelola transaksi kas & bank (income, expense, transfer)
 */
export class CashBankService {
  /**
   * Record other income (non-sales income)
   * e.g., interest income, refund, etc.
   */
  async recordOtherIncome(companyId: string, input: CreateOtherIncomeInput, userId?: string) {
    const bankAccount = await prisma.bankAccount.findFirst({
      where: {
        id: input.bankAccountId,
        companyId,
        isActive: true,
      },
      include: {
        account: true,
      },
    });

    if (!bankAccount) {
      throw new Error('Bank account not found');
    }

    const incomeAccount = await prisma.chartOfAccount.findFirst({
      where: {
        id: input.incomeAccountId,
        companyId,
        isActive: true,
      },
    });

    if (!incomeAccount) {
      throw new Error('Income account not found');
    }

    // Generate journal
    // Dr. Kas/Bank
    // Cr. Pendapatan Lain-lain
    const journal = await doubleEntryService.createJournal(
      companyId,
      {
        date: new Date(input.date),
        description: input.description,
        referenceNo: input.referenceNo,
        entries: [
          {
            accountId: bankAccount.account.id,
            debit: input.amount,
            credit: 0,
            description: input.description,
          },
          {
            accountId: incomeAccount.id,
            debit: 0,
            credit: input.amount,
            description: input.description,
          },
        ],
      },
      {
        sourceType: 'OTHER_INCOME',
        createdById: userId,
      }
    );

    // Auto-post
    await doubleEntryService.postJournal({ journalId: journal.id }, userId);

    return journal;
  }

  /**
   * Record other expense (non-purchase expense)
   * e.g., utilities, rent, office supplies, etc.
   */
  async recordOtherExpense(companyId: string, input: CreateOtherExpenseInput, userId?: string) {
    const bankAccount = await prisma.bankAccount.findFirst({
      where: {
        id: input.bankAccountId,
        companyId,
        isActive: true,
      },
      include: {
        account: true,
      },
    });

    if (!bankAccount) {
      throw new Error('Bank account not found');
    }

    const expenseAccount = await prisma.chartOfAccount.findFirst({
      where: {
        id: input.expenseAccountId,
        companyId,
        isActive: true,
      },
    });

    if (!expenseAccount) {
      throw new Error('Expense account not found');
    }

    // Generate journal
    // Dr. Biaya
    // Cr. Kas/Bank
    const journal = await doubleEntryService.createJournal(
      companyId,
      {
        date: new Date(input.date),
        description: input.description,
        referenceNo: input.referenceNo,
        entries: [
          {
            accountId: expenseAccount.id,
            debit: input.amount,
            credit: 0,
            description: input.description,
          },
          {
            accountId: bankAccount.account.id,
            debit: 0,
            credit: input.amount,
            description: input.description,
          },
        ],
      },
      {
        sourceType: input.isReimbursement ? 'EXPENSE_REIMBURSEMENT' : 'OTHER_EXPENSE',
        createdById: userId,
      }
    );

    // Auto-post
    await doubleEntryService.postJournal({ journalId: journal.id }, userId);

    return journal;
  }

  /**
   * Transfer between bank accounts
   */
  async recordBankTransfer(companyId: string, input: CreateBankTransferInput, userId?: string) {
    const fromBank = await prisma.bankAccount.findFirst({
      where: {
        id: input.fromBankAccountId,
        companyId,
        isActive: true,
      },
      include: {
        account: true,
      },
    });

    const toBank = await prisma.bankAccount.findFirst({
      where: {
        id: input.toBankAccountId,
        companyId,
        isActive: true,
      },
      include: {
        account: true,
      },
    });

    if (!fromBank || !toBank) {
      throw new Error('Bank account not found');
    }

    // Generate journal
    // Dr. Bank B (destination)
    // Cr. Bank A (source)
    const journal = await doubleEntryService.createJournal(
      companyId,
      {
        date: new Date(input.date),
        description: input.description,
        referenceNo: input.referenceNo,
        entries: [
          {
            accountId: toBank.account.id,
            debit: input.amount,
            credit: 0,
            description: `Transfer masuk - ${input.description}`,
          },
          {
            accountId: fromBank.account.id,
            debit: 0,
            credit: input.amount,
            description: `Transfer keluar - ${input.description}`,
          },
        ],
      },
      {
        sourceType: 'BANK_TRANSFER',
        createdById: userId,
      }
    );

    // Auto-post
    await doubleEntryService.postJournal({ journalId: journal.id }, userId);

    return journal;
  }
}

export const cashBankService = new CashBankService();

