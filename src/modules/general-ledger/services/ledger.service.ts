import { prisma } from '@/shared/database/prisma';
import { GetLedgerInput, GetTrialBalanceInput, LedgerEntry, TrialBalanceSummary } from '../types';
import { Decimal } from 'decimal.js';

/**
 * Ledger Service
 * 
 * Service untuk query ledger dan trial balance
 */
export class LedgerService {
  /**
   * Get ledger detail untuk satu account
   */
  async getLedger(companyId: string, input: GetLedgerInput): Promise<{
    account: any;
    entries: LedgerEntry[];
    openingBalance: Decimal;
    closingBalance: Decimal;
  }> {
    // Get account info
    const account = await prisma.chartOfAccount.findFirst({
      where: {
        id: input.accountId,
        companyId,
      },
    });

    if (!account) {
      throw new Error('Account not found');
    }

    // Build where clause
    const where: any = {
      accountId: input.accountId,
      journal: {
        companyId,
        status: 'POSTED', // Only show posted journals
      },
    };

    if (input.startDate || input.endDate) {
      where.journal.date = {};
      if (input.startDate) {
        where.journal.date.gte = new Date(input.startDate);
      }
      if (input.endDate) {
        where.journal.date.lte = new Date(input.endDate);
      }
    }

    // Get journal entries
    const journalEntries = await prisma.journalEntry.findMany({
      where,
      include: {
        journal: {
          select: {
            journalNo: true,
            date: true,
            description: true,
            referenceNo: true,
          },
        },
      },
      orderBy: {
        journal: {
          date: 'asc',
        },
      },
    });

    // Calculate opening balance
    let openingBalance = new Decimal(0);
    if (input.startDate) {
      const openingEntries = await prisma.journalEntry.findMany({
        where: {
          accountId: input.accountId,
          journal: {
            companyId,
            status: 'POSTED',
            date: {
              lt: new Date(input.startDate),
            },
          },
        },
      });

      const normalDebitAccounts = ['ASSET', 'EXPENSE', 'COGS'];
      
      for (const entry of openingEntries) {
        if (normalDebitAccounts.includes(account.accountType)) {
          openingBalance = openingBalance
            .plus(new Decimal(entry.debit))
            .minus(new Decimal(entry.credit));
        } else {
          openingBalance = openingBalance
            .minus(new Decimal(entry.debit))
            .plus(new Decimal(entry.credit));
        }
      }
    }

    // Build ledger entries with running balance
    const entries: LedgerEntry[] = [];
    let runningBalance = openingBalance;

    const normalDebitAccounts = ['ASSET', 'EXPENSE', 'COGS'];

    for (const entry of journalEntries) {
      const debit = new Decimal(entry.debit);
      const credit = new Decimal(entry.credit);

      // Update running balance
      if (normalDebitAccounts.includes(account.accountType)) {
        runningBalance = runningBalance.plus(debit).minus(credit);
      } else {
        runningBalance = runningBalance.minus(debit).plus(credit);
      }

      entries.push({
        date: entry.journal.date,
        journalNo: entry.journal.journalNo,
        description: entry.description || entry.journal.description,
        referenceNo: entry.journal.referenceNo || undefined,
        debit,
        credit,
        balance: runningBalance,
      });
    }

    return {
      account,
      entries,
      openingBalance,
      closingBalance: runningBalance,
    };
  }

  /**
   * Get trial balance
   */
  async getTrialBalance(
    companyId: string,
    input: GetTrialBalanceInput
  ): Promise<TrialBalanceSummary> {
    // Get all accounts
    const accounts = await prisma.chartOfAccount.findMany({
      where: {
        companyId,
        isActive: true,
      },
      orderBy: {
        code: 'asc',
      },
    });


    // Build where clause for journal entries
    const journalWhere: any = {
      companyId,
      status: 'POSTED',
    };

    if (input.startDate || input.endDate) {
      journalWhere.date = {};
      if (input.startDate) {
        journalWhere.date.gte = new Date(input.startDate);
      }
      if (input.endDate) {
        journalWhere.date.lte = new Date(input.endDate);
      }
    }

    // Get all journal entries in period
    const journals = await prisma.journal.findMany({
      where: journalWhere,
      include: {
        entries: true,
      },
    });


    // Calculate balance for each account
    const accountBalances = new Map<string, { debit: Decimal; credit: Decimal }>();

    for (const account of accounts) {
      let totalDebit = new Decimal(0);
      let totalCredit = new Decimal(0);

      // Sum up all entries for this account
      for (const journal of journals) {
        for (const entry of journal.entries) {
          if (entry.accountId === account.id) {
            totalDebit = totalDebit.plus(new Decimal(entry.debit));
            totalCredit = totalCredit.plus(new Decimal(entry.credit));
          }
        }
      }

      // For trial balance, we show the actual debit and credit amounts
      // Don't adjust based on normal balance - just show raw amounts
      if (totalDebit.greaterThan(0) || totalCredit.greaterThan(0)) {
        accountBalances.set(account.id, { debit: totalDebit, credit: totalCredit });
      }
    }

    // Build trial balance
    const trialBalanceAccounts = accounts
      .map((account: any) => {
        const balance = accountBalances.get(account.id);
        if (!balance || (balance.debit.isZero() && balance.credit.isZero())) {
          return null; // Skip accounts with zero balance
        }

        return {
          accountId: account.id,
          accountCode: account.code,
          accountName: account.name,
          accountType: account.accountType,
          debit: balance.debit,
          credit: balance.credit,
        };
      })
      .filter(Boolean) as any[];

    // Calculate totals
    const totalDebit = trialBalanceAccounts.reduce(
      (sum, acc) => sum.plus(acc.debit),
      new Decimal(0)
    );

    const totalCredit = trialBalanceAccounts.reduce(
      (sum, acc) => sum.plus(acc.credit),
      new Decimal(0)
    );

    const isBalanced = totalDebit.equals(totalCredit);

    return {
      accounts: trialBalanceAccounts,
      totalDebit,
      totalCredit,
      isBalanced,
    };
  }

  /**
   * Get account balance at specific date
   */
  async getAccountBalance(
    companyId: string,
    accountId: string,
    date: Date
  ): Promise<Decimal> {
    const account = await prisma.chartOfAccount.findFirst({
      where: {
        id: accountId,
        companyId,
      },
    });

    if (!account) {
      throw new Error('Account not found');
    }

    // Get all entries up to the date
    const entries = await prisma.journalEntry.findMany({
      where: {
        accountId,
        journal: {
          companyId,
          status: 'POSTED',
          date: {
            lte: date,
          },
        },
      },
    });

    // Calculate balance
    let balance = new Decimal(0);
    const normalDebitAccounts = ['ASSET', 'EXPENSE', 'COGS'];

    for (const entry of entries) {
      const debit = new Decimal(entry.debit);
      const credit = new Decimal(entry.credit);

      if (normalDebitAccounts.includes(account.accountType)) {
        balance = balance.plus(debit).minus(credit);
      } else {
        balance = balance.minus(debit).plus(credit);
      }
    }

    return balance;
  }
}

export const ledgerService = new LedgerService();

