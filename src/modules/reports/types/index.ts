import { z } from 'zod';
import { Decimal } from 'decimal.js';

/**
 * Reports Module Types
 */

export interface FinancialReportInput {
  startDate: Date | string;
  endDate: Date | string;
  compareWithPrevious?: boolean;
}

export interface IncomeStatementLine {
  accountId: string;
  accountCode: string;
  accountName: string;
  amount: Decimal;
  percentage?: number;
}

export interface IncomeStatementData {
  revenue: IncomeStatementLine[];
  totalRevenue: Decimal;
  cogs: IncomeStatementLine[];
  totalCOGS: Decimal;
  grossProfit: Decimal;
  grossProfitMargin: number;
  expenses: IncomeStatementLine[];
  totalExpenses: Decimal;
  netIncome: Decimal;
  netProfitMargin: number;
}

export interface BalanceSheetLine {
  accountId: string;
  accountCode: string;
  accountName: string;
  amount: Decimal;
}

export interface BalanceSheetData {
  assets: {
    current: BalanceSheetLine[];
    fixed: BalanceSheetLine[];
    total: Decimal;
  };
  liabilities: {
    current: BalanceSheetLine[];
    longTerm: BalanceSheetLine[];
    total: Decimal;
  };
  equity: {
    lines: BalanceSheetLine[];
    total: Decimal;
  };
  totalLiabilitiesAndEquity: Decimal;
}

export interface CashFlowLine {
  description: string;
  amount: Decimal;
}

export interface CashFlowData {
  operating: {
    lines: CashFlowLine[];
    total: Decimal;
  };
  investing: {
    lines: CashFlowLine[];
    total: Decimal;
  };
  financing: {
    lines: CashFlowLine[];
    total: Decimal;
  };
  netCashFlow: Decimal;
  beginningCash: Decimal;
  endingCash: Decimal;
}

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

export const financialReportSchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  compareWithPrevious: z.boolean().default(false),
}).refine((data) => data.endDate >= data.startDate, {
  message: 'End date must be after or equal to start date',
});

export const taxReportSchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  taxType: z.string().optional(),
});

