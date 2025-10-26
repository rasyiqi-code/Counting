import { prisma } from '@/shared/database/prisma';
import { doubleEntryService } from '@/modules/general-ledger';
import { ClosePeriodInput, CloseYearInput, ReopenPeriodInput } from '../types';
import { Decimal } from 'decimal.js';
import { startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

/**
 * Period Closing Service
 * 
 * Mengelola tutup buku bulanan dan tahunan
 */
export class PeriodClosingService {
  /**
   * Close monthly period
   */
  async closeMonth(companyId: string, input: ClosePeriodInput, userId?: string) {
    // Check if period exists
    let period = await prisma.accountingPeriod.findFirst({
      where: {
        companyId,
        year: input.year,
        month: input.month,
      },
    });

    const startDate = startOfMonth(new Date(input.year, input.month - 1));
    const endDate = endOfMonth(new Date(input.year, input.month - 1));

    // Create period if not exists
    if (!period) {
      period = await prisma.accountingPeriod.create({
        data: {
          companyId,
          year: input.year,
          month: input.month,
          startDate,
          endDate,
          status: 'OPEN',
        },
      });
    }

    if (period.status === 'CLOSED' || period.status === 'LOCKED') {
      throw new Error('Period already closed');
    }

    // Validate that all journals in period are posted
    const draftJournals = await prisma.journal.count({
      where: {
        companyId,
        status: 'DRAFT',
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    if (draftJournals > 0) {
      throw new Error(`Cannot close period with ${draftJournals} draft journal(s)`);
    }

    // Close period
    await prisma.accountingPeriod.update({
      where: { id: period.id },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
        closedBy: userId,
      },
    });

    return {
      success: true,
      message: `Period ${input.year}-${String(input.month).padStart(2, '0')} closed successfully`,
    };
  }

  /**
   * Close year (year-end closing)
   * Zero out revenue & expense accounts and transfer to retained earnings
   */
  async closeYear(companyId: string, input: CloseYearInput, userId?: string) {
    // Get retained earnings account
    const retainedEarningsAccount = await prisma.chartOfAccount.findFirst({
      where: { companyId, code: '3-2000', isActive: true }, // Laba Ditahan
    });

    if (!retainedEarningsAccount) {
      throw new Error('Retained Earnings account not found');
    }

    const yearStart = startOfYear(new Date(input.year, 0));
    const yearEnd = endOfYear(new Date(input.year, 0));

    // Get all revenue, cogs, and expense accounts
    const accounts = await prisma.chartOfAccount.findMany({
      where: {
        companyId,
        accountType: {
          in: ['REVENUE', 'COGS', 'EXPENSE'],
        },
      },
    });

    // Get all journals in the year
    const journals = await prisma.journal.findMany({
      where: {
        companyId,
        status: 'POSTED',
        date: {
          gte: yearStart,
          lte: yearEnd,
        },
      },
      include: {
        entries: true,
      },
    });

    // Calculate balances
    const accountBalances = new Map<string, Decimal>();

    for (const journal of journals) {
      for (const entry of journal.entries) {
        const account = accounts.find((a: any) => a.id === entry.accountId);
        if (!account) continue;

        const debit = new Decimal(entry.debit);
        const credit = new Decimal(entry.credit);
        const currentBalance = accountBalances.get(account.id) || new Decimal(0);

        // Revenue: credit increases
        // COGS & Expense: debit increases
        if (account.accountType === 'REVENUE') {
          accountBalances.set(account.id, currentBalance.plus(credit).minus(debit));
        } else {
          accountBalances.set(account.id, currentBalance.plus(debit).minus(credit));
        }
      }
    }

    // Create closing entries
    const closingEntries = [];

    // Zero out revenue accounts
    for (const account of accounts.filter((a: any) => a.accountType === 'REVENUE')) {
      const balance = accountBalances.get(account.id);
      if (balance && balance.greaterThan(0)) {
        closingEntries.push({
          accountId: account.id,
          debit: balance.toString(),
          credit: 0,
          description: `Tutup buku ${input.year} - ${account.name}`,
        });
      }
    }

    // Zero out expense & cogs accounts
    for (const account of accounts.filter((a: any) => ['COGS', 'EXPENSE'].includes(a.accountType))) {
      const balance = accountBalances.get(account.id);
      if (balance && balance.greaterThan(0)) {
        closingEntries.push({
          accountId: account.id,
          debit: 0,
          credit: balance.toString(),
          description: `Tutup buku ${input.year} - ${account.name}`,
        });
      }
    }

    // Calculate net income
    let netIncome = new Decimal(0);
    accountBalances.forEach((balance, accountId) => {
      const account = accounts.find((a: any) => a.id === accountId);
      if (!account) return;

      if (account.accountType === 'REVENUE') {
        netIncome = netIncome.plus(balance);
      } else {
        netIncome = netIncome.minus(balance);
      }
    });

    // Add entry to retained earnings
    if (netIncome.greaterThan(0)) {
      closingEntries.push({
        accountId: retainedEarningsAccount.id,
        debit: 0,
        credit: netIncome.toString(),
        description: `Laba bersih ${input.year}`,
      });
    } else if (netIncome.lessThan(0)) {
      closingEntries.push({
        accountId: retainedEarningsAccount.id,
        debit: netIncome.abs().toString(),
        credit: 0,
        description: `Rugi bersih ${input.year}`,
      });
    }

    // Create closing journal
    if (closingEntries.length > 0) {
      const journal = await doubleEntryService.createJournal(
        companyId,
        {
          date: yearEnd,
          description: `Tutup Buku Tahunan ${input.year}`,
          entries: closingEntries,
        },
        {
          sourceType: 'YEAR_END_CLOSING',
          createdById: userId,
        }
      );

      await doubleEntryService.postJournal({ journalId: journal.id }, userId);
    }

    // Close all periods in the year
    await prisma.accountingPeriod.updateMany({
      where: {
        companyId,
        year: input.year,
      },
      data: {
        status: 'LOCKED',
      },
    });

    return {
      success: true,
      netIncome,
      message: `Year ${input.year} closed successfully`,
    };
  }

  /**
   * Reopen period
   */
  async reopenPeriod(companyId: string, input: ReopenPeriodInput, userId?: string) {
    const period = await prisma.accountingPeriod.findFirst({
      where: {
        companyId,
        year: input.year,
        month: input.month,
      },
    });

    if (!period) {
      throw new Error('Period not found');
    }

    if (period.status === 'LOCKED') {
      throw new Error('Cannot reopen locked period. Year-end closing has been performed.');
    }

    await prisma.accountingPeriod.update({
      where: { id: period.id },
      data: {
        status: 'OPEN',
        closedAt: null,
        closedBy: null,
      },
    });

    return {
      success: true,
      message: `Period ${input.year}-${String(input.month).padStart(2, '0')} reopened`,
    };
  }

  /**
   * Get period status
   */
  async getPeriodStatus(companyId: string, year: number, month: number) {
    const period = await prisma.accountingPeriod.findFirst({
      where: {
        companyId,
        year,
        month,
      },
    });

    if (!period) {
      return {
        exists: false,
        status: 'NOT_CREATED',
      };
    }

    return {
      exists: true,
      status: period.status,
      closedAt: period.closedAt,
      closedBy: period.closedBy,
    };
  }
}

export const periodClosingService = new PeriodClosingService();

