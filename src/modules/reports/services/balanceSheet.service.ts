import { prisma } from '@/shared/database/prisma';
import { FinancialReportInput, BalanceSheetData, BalanceSheetLine } from '../types';
import { Decimal } from 'decimal.js';

/**
 * Balance Sheet Service
 * 
 * Generate Statement of Financial Position (Neraca)
 */
export class BalanceSheetService {
  /**
   * Generate Balance Sheet
   */
  async generate(companyId: string, input: FinancialReportInput): Promise<BalanceSheetData> {
    const asOfDate = new Date(input.endDate);

    // Get all asset, liability, and equity accounts
    const accounts = await prisma.chartOfAccount.findMany({
      where: {
        companyId,
        isActive: true,
        accountType: {
          in: ['ASSET', 'LIABILITY', 'EQUITY'],
        },
      },
      orderBy: {
        code: 'asc',
      },
    });

    // Get all posted journals up to the date
    const journals = await prisma.journal.findMany({
      where: {
        companyId,
        status: 'POSTED',
        date: {
          lte: asOfDate,
        },
      },
      include: {
        entries: true,
      },
    });

    // Calculate balances per account
    const accountBalances = new Map<string, Decimal>();

    for (const journal of journals) {
      for (const entry of journal.entries) {
        const account = accounts.find((a: any) => a.id === entry.accountId);
        if (!account) continue;

        const debit = new Decimal(entry.debit);
        const credit = new Decimal(entry.credit);

        const currentBalance = accountBalances.get(account.id) || new Decimal(0);
        
        // Asset: debit increases, credit decreases
        if (account.accountType === 'ASSET') {
          accountBalances.set(account.id, currentBalance.plus(debit).minus(credit));
        } else {
          // Liability & Equity: credit increases, debit decreases
          accountBalances.set(account.id, currentBalance.plus(credit).minus(debit));
        }
      }
    }

    // Build asset lines
    const assetAccounts = accounts.filter((a: any) => a.accountType === 'ASSET');
    const currentAssets: BalanceSheetLine[] = [];
    const fixedAssets: BalanceSheetLine[] = [];

    for (const account of assetAccounts) {
      const balance = accountBalances.get(account.id) || new Decimal(0);
      if (balance.isZero()) continue;

      const line = {
        accountId: account.id,
        accountCode: account.code,
        accountName: account.name,
        amount: balance,
      };

      if (account.category === 'CURRENT_ASSET') {
        currentAssets.push(line);
      } else {
        fixedAssets.push(line);
      }
    }

    const totalAssets = [...currentAssets, ...fixedAssets].reduce(
      (sum, line) => sum.plus(line.amount),
      new Decimal(0)
    );

    // Build liability lines
    const liabilityAccounts = accounts.filter((a: any) => a.accountType === 'LIABILITY');
    const currentLiabilities: BalanceSheetLine[] = [];
    const longTermLiabilities: BalanceSheetLine[] = [];

    for (const account of liabilityAccounts) {
      const balance = accountBalances.get(account.id) || new Decimal(0);
      if (balance.isZero()) continue;

      const line = {
        accountId: account.id,
        accountCode: account.code,
        accountName: account.name,
        amount: balance,
      };

      if (account.category === 'CURRENT_LIABILITY') {
        currentLiabilities.push(line);
      } else {
        longTermLiabilities.push(line);
      }
    }

    const totalLiabilities = [...currentLiabilities, ...longTermLiabilities].reduce(
      (sum, line) => sum.plus(line.amount),
      new Decimal(0)
    );

    // Build equity lines
    const equityAccounts = accounts.filter((a: any) => a.accountType === 'EQUITY');
    const equityLines: BalanceSheetLine[] = [];

    for (const account of equityAccounts) {
      const balance = accountBalances.get(account.id) || new Decimal(0);
      
      const line = {
        accountId: account.id,
        accountCode: account.code,
        accountName: account.name,
        amount: balance,
      };

      equityLines.push(line);
    }

    // Calculate net income for current period and add to equity
    const netIncome = await this.calculateNetIncome(companyId, new Date(input.startDate), new Date(input.endDate));
    if (!netIncome.isZero()) {
      equityLines.push({
        accountId: 'net-income',
        accountCode: '3-3000',
        accountName: 'Laba Tahun Berjalan',
        amount: netIncome,
      });
    }

    const totalEquity = equityLines.reduce((sum, line) => sum.plus(line.amount), new Decimal(0));
    const totalLiabilitiesAndEquity = totalLiabilities.plus(totalEquity);

    return {
      assets: {
        current: currentAssets,
        fixed: fixedAssets,
        total: totalAssets,
      },
      liabilities: {
        current: currentLiabilities,
        longTerm: longTermLiabilities,
        total: totalLiabilities,
      },
      equity: {
        lines: equityLines,
        total: totalEquity,
      },
      totalLiabilitiesAndEquity,
    };
  }

  /**
   * Calculate net income (for balance sheet equity section)
   */
  private async calculateNetIncome(
    companyId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Decimal> {
    const journals = await prisma.journal.findMany({
      where: {
        companyId,
        status: 'POSTED',
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        entries: {
          include: {
            account: {
              select: {
                accountType: true,
              },
            },
          },
        },
      },
    });

    let revenue = new Decimal(0);
    let cogs = new Decimal(0);
    let expense = new Decimal(0);

    for (const journal of journals) {
      for (const entry of journal.entries) {
        const debit = new Decimal(entry.debit);
        const credit = new Decimal(entry.credit);

        if (entry.account.accountType === 'REVENUE') {
          revenue = revenue.plus(credit).minus(debit);
        } else if (entry.account.accountType === 'COGS') {
          cogs = cogs.plus(debit).minus(credit);
        } else if (entry.account.accountType === 'EXPENSE') {
          expense = expense.plus(debit).minus(credit);
        }
      }
    }

    return revenue.minus(cogs).minus(expense);
  }
}

export const balanceSheetService = new BalanceSheetService();

