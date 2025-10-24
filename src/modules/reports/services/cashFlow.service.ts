import { prisma } from '@/shared/database/prisma';
import { FinancialReportInput, CashFlowData, CashFlowLine } from '../types';
import { Decimal } from 'decimal.js';

/**
 * Cash Flow Service
 * 
 * Generate Cash Flow Statement (Laporan Arus Kas)
 * Using Indirect Method
 */
export class CashFlowService {
  /**
   * Generate Cash Flow Statement (Indirect Method)
   */
  async generate(companyId: string, input: FinancialReportInput): Promise<CashFlowData> {
    const startDate = new Date(input.startDate);
    const endDate = new Date(input.endDate);

    // Get cash/bank accounts
    const cashAccounts = await prisma.chartOfAccount.findMany({
      where: {
        companyId,
        isActive: true,
        code: {
          in: ['1-1100', '1-1200'], // Kas & Bank
        },
      },
    });

    const cashAccountIds = cashAccounts.map(a => a.id);

    // Get beginning cash balance
    const beginningBalance = await this.getCashBalance(companyId, cashAccountIds, startDate, true);
    
    // Get ending cash balance
    const endingBalance = await this.getCashBalance(companyId, cashAccountIds, endDate, false);

    // Calculate net cash flow
    const netCashFlow = endingBalance.minus(beginningBalance);

    // For simplicity, we'll show basic cash flow breakdown
    // In production, you'd want to categorize transactions properly

    // Get all cash movements in period
    const cashEntries = await prisma.journalEntry.findMany({
      where: {
        accountId: { in: cashAccountIds },
        journal: {
          companyId,
          status: 'POSTED',
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      },
      include: {
        journal: {
          select: {
            description: true,
            sourceType: true,
          },
        },
      },
    });

    // Categorize cash flows
    const operating: CashFlowLine[] = [];
    const investing: CashFlowLine[] = [];
    const financing: CashFlowLine[] = [];

    let operatingTotal = new Decimal(0);
    let investingTotal = new Decimal(0);
    let financingTotal = new Decimal(0);

    for (const entry of cashEntries) {
      const debit = new Decimal(entry.debit);
      const credit = new Decimal(entry.credit);
      const netAmount = debit.minus(credit);

      const sourceType = entry.journal.sourceType || 'OTHER';

      // Categorize based on source type
      if (
        sourceType.includes('SALES') ||
        sourceType.includes('PURCHASE') ||
        sourceType.includes('PAYMENT') ||
        sourceType.includes('EXPENSE')
      ) {
        operatingTotal = operatingTotal.plus(netAmount);
      } else if (sourceType.includes('ASSET') || sourceType.includes('INVESTMENT')) {
        investingTotal = investingTotal.plus(netAmount);
      } else if (sourceType.includes('LOAN') || sourceType.includes('EQUITY')) {
        financingTotal = financingTotal.plus(netAmount);
      } else {
        operatingTotal = operatingTotal.plus(netAmount);
      }
    }

    // Build operating lines
    if (!operatingTotal.isZero()) {
      operating.push({
        description: 'Arus kas dari aktivitas operasi',
        amount: operatingTotal,
      });
    }

    // Build investing lines
    if (!investingTotal.isZero()) {
      investing.push({
        description: 'Arus kas dari aktivitas investasi',
        amount: investingTotal,
      });
    }

    // Build financing lines
    if (!financingTotal.isZero()) {
      financing.push({
        description: 'Arus kas dari aktivitas pendanaan',
        amount: financingTotal,
      });
    }

    return {
      operating: {
        lines: operating,
        total: operatingTotal,
      },
      investing: {
        lines: investing,
        total: investingTotal,
      },
      financing: {
        lines: financing,
        total: financingTotal,
      },
      netCashFlow,
      beginningCash: beginningBalance,
      endingCash: endingBalance,
    };
  }

  /**
   * Get cash balance at specific date
   */
  private async getCashBalance(
    companyId: string,
    cashAccountIds: string[],
    date: Date,
    beforeDate: boolean = false
  ): Promise<Decimal> {
    const whereDate = beforeDate ? { lt: date } : { lte: date };

    const entries = await prisma.journalEntry.findMany({
      where: {
        accountId: { in: cashAccountIds },
        journal: {
          companyId,
          status: 'POSTED',
          date: whereDate,
        },
      },
    });

    let balance = new Decimal(0);

    for (const entry of entries) {
      const debit = new Decimal(entry.debit);
      const credit = new Decimal(entry.credit);
      balance = balance.plus(debit).minus(credit);
    }

    return balance;
  }
}

export const cashFlowService = new CashFlowService();

