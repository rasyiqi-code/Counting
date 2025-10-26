import { prisma } from '@/shared/database/prisma';
import { FinancialReportInput, IncomeStatementData, IncomeStatementLine } from '../types';
import { Decimal } from 'decimal.js';

/**
 * Income Statement Service
 * 
 * Generate Profit & Loss report (Laporan Laba Rugi)
 */
export class IncomeStatementService {
  /**
   * Generate Income Statement
   */
  async generate(companyId: string, input: FinancialReportInput): Promise<IncomeStatementData> {
    const startDate = new Date(input.startDate);
    const endDate = new Date(input.endDate);

    // Get all accounts
    const accounts = await prisma.chartOfAccount.findMany({
      where: {
        companyId,
        isActive: true,
        accountType: {
          in: ['REVENUE', 'COGS', 'EXPENSE'],
        },
      },
      orderBy: {
        code: 'asc',
      },
    });

    // Get all journal entries in period
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
        entries: true,
      },
    });


    // Calculate balances per account
    const accountBalances = new Map<string, Decimal>();

    for (const journal of journals) {
      for (const entry of journal.entries) {
        const accountId = entry.accountId;
        const debit = new Decimal(entry.debit);
        const credit = new Decimal(entry.credit);

        const currentBalance = accountBalances.get(accountId) || new Decimal(0);
        // For revenue/expense: Credit increases revenue, Debit increases expense/cogs
        const newBalance = currentBalance.plus(credit).minus(debit);
        accountBalances.set(accountId, newBalance);
        
      }
    }

    // Build revenue lines
    const revenueAccounts = accounts.filter((a: any) => a.accountType === 'REVENUE');
    const revenuelines: IncomeStatementLine[] = revenueAccounts  
      .map((account: any) => ({
        accountId: account.id,
        accountCode: account.code,
        accountName: account.name,
        amount: accountBalances.get(account.id) || new Decimal(0),
      }))
      .filter((line: any) => !line.amount.isZero());

    const totalRevenue = revenuelines.reduce((sum, line) => sum.plus(line.amount), new Decimal(0));

    // Build COGS lines
    const cogsAccounts = accounts.filter((a: any) => a.accountType === 'COGS');
    const cogsLines: IncomeStatementLine[] = cogsAccounts        
      .map((account: any) => ({
        accountId: account.id,
        accountCode: account.code,
        accountName: account.name,
        amount: (accountBalances.get(account.id) || new Decimal(0)).abs(), // Show as positive
      }))
      .filter((line: any) => !line.amount.isZero());

    const totalCOGS = cogsLines.reduce((sum, line) => sum.plus(line.amount), new Decimal(0));

    // Gross Profit
    const grossProfit = totalRevenue.minus(totalCOGS);
    const grossProfitMargin = totalRevenue.greaterThan(0) 
      ? grossProfit.div(totalRevenue).times(100).toNumber() 
      : 0;

    // Build expense lines
    const expenseAccounts = accounts.filter((a: any) => a.accountType === 'EXPENSE');
    const expenseLines: IncomeStatementLine[] = expenseAccounts 
      .map((account: any) => ({
        accountId: account.id,
        accountCode: account.code,
        accountName: account.name,
        amount: (accountBalances.get(account.id) || new Decimal(0)).abs(), // Show as positive
      }))
      .filter((line: any) => !line.amount.isZero());

    const totalExpenses = expenseLines.reduce((sum, line) => sum.plus(line.amount), new Decimal(0));

    // Net Income
    const netIncome = grossProfit.minus(totalExpenses);
    const netProfitMargin = totalRevenue.greaterThan(0) 
      ? netIncome.div(totalRevenue).times(100).toNumber() 
      : 0;

    // Add percentages
    const addPercentages = (lines: IncomeStatementLine[], total: Decimal) => {
      return lines.map(line => ({
        ...line,
        percentage: total.greaterThan(0) ? line.amount.div(total).times(100).toNumber() : 0,
      }));
    };

    return {
      revenue: addPercentages(revenuelines, totalRevenue),
      totalRevenue,
      cogs: addPercentages(cogsLines, totalRevenue),
      totalCOGS,
      grossProfit,
      grossProfitMargin,
      expenses: addPercentages(expenseLines, totalRevenue),
      totalExpenses,
      netIncome,
      netProfitMargin,
    };
  }
}

export const incomeStatementService = new IncomeStatementService();

