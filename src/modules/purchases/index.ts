/**
 * Purchases Module - Public API
 * 
 * This module handles:
 * - Purchase Bills (with auto-generate journals)
 * - Make Payments to vendors
 * - AP Aging Reports
 */

export { purchasesRouter } from './routers/purchases.router';
export { purchaseBillService } from './services/purchaseBill.service';
export { purchasePaymentService } from './services/payment.service';

export type {
  CreatePurchaseBillInput,
  UpdatePurchaseBillInput,
  MakePaymentInput,
  PurchaseBillItemInput,
  PaymentAllocationInput,
} from './types';

