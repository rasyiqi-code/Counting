/**
 * Cash & Bank Module - Public API
 * 
 * This module handles:
 * - Other Income (non-sales income)
 * - Other Expense (non-purchase expense)
 * - Bank Transfers
 * - Bank Reconciliation (TODO)
 */

export { cashBankRouter } from './routers/cashBank.router';
export { cashBankService } from './services/cashBank.service';

export type {
  CreateOtherIncomeInput,
  CreateOtherExpenseInput,
  CreateBankTransferInput,
} from './types';

