/**
 * Sales Module - Public API
 * 
 * This module handles:
 * - Sales Invoices (with auto-generate journals)
 * - Receive Payments from customers
 * - AR Aging Reports
 */

export { salesRouter } from './routers/sales.router';
export { salesInvoiceService } from './services/salesInvoice.service';
export { paymentService } from './services/payment.service';

export type {
  CreateSalesInvoiceInput,
  UpdateSalesInvoiceInput,
  ReceivePaymentInput,
  SalesInvoiceItemInput,
  PaymentAllocationInput,
} from './types';

