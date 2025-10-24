import { Decimal } from 'decimal.js';

// ============================================================================
// ENUMS - Shared across all modules
// ============================================================================

export enum AccountType {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY',
  REVENUE = 'REVENUE',
  COGS = 'COGS', // Cost of Goods Sold / HPP
  EXPENSE = 'EXPENSE',
}

export enum AccountCategory {
  // Assets
  CURRENT_ASSET = 'CURRENT_ASSET',
  FIXED_ASSET = 'FIXED_ASSET',
  OTHER_ASSET = 'OTHER_ASSET',
  
  // Liabilities
  CURRENT_LIABILITY = 'CURRENT_LIABILITY',
  LONG_TERM_LIABILITY = 'LONG_TERM_LIABILITY',
  
  // Equity
  CAPITAL = 'CAPITAL',
  RETAINED_EARNINGS = 'RETAINED_EARNINGS',
  
  // Revenue
  SALES_REVENUE = 'SALES_REVENUE',
  OTHER_REVENUE = 'OTHER_REVENUE',
  
  // COGS
  COST_OF_SALES = 'COST_OF_SALES',
  
  // Expenses
  OPERATING_EXPENSE = 'OPERATING_EXPENSE',
  OTHER_EXPENSE = 'OTHER_EXPENSE',
}

export enum TransactionStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  POSTED = 'POSTED',
  VOID = 'VOID',
  CANCELLED = 'CANCELLED',
}

export enum JournalStatus {
  DRAFT = 'DRAFT',
  POSTED = 'POSTED',
  VOID = 'VOID',
}

export enum InvoiceType {
  SALES = 'SALES',
  PURCHASE = 'PURCHASE',
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PARTIAL_PAID = 'PARTIAL_PAID',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  VOID = 'VOID',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CHECK = 'CHECK',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  E_WALLET = 'E_WALLET',
  OTHER = 'OTHER',
}

export enum ContactType {
  CUSTOMER = 'CUSTOMER',
  VENDOR = 'VENDOR',
  EMPLOYEE = 'EMPLOYEE',
  OTHER = 'OTHER',
}

export enum ProductType {
  GOODS = 'GOODS',
  SERVICE = 'SERVICE',
}

export enum StockMethod {
  FIFO = 'FIFO',
  AVERAGE = 'AVERAGE',
}

export enum StockMovementType {
  IN = 'IN',
  OUT = 'OUT',
  ADJUSTMENT = 'ADJUSTMENT',
  TRANSFER = 'TRANSFER',
}

export enum DepreciationMethod {
  STRAIGHT_LINE = 'STRAIGHT_LINE',
  DECLINING_BALANCE = 'DECLINING_BALANCE',
}

export enum TaxType {
  PPN = 'PPN', // Pajak Pertambahan Nilai (VAT)
  PPH_21 = 'PPH_21', // Pajak Penghasilan Pasal 21
  PPH_22 = 'PPH_22', // Pajak Penghasilan Pasal 22
  PPH_23 = 'PPH_23', // Pajak Penghasilan Pasal 23
  PPH_4_2 = 'PPH_4_2', // Pajak Penghasilan Pasal 4 Ayat 2
  PPH_15 = 'PPH_15', // Pajak Penghasilan Pasal 15
}

export enum TaxDirection {
  INPUT = 'INPUT', // Pajak Masukan
  OUTPUT = 'OUTPUT', // Pajak Keluaran
}

export enum PeriodStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  LOCKED = 'LOCKED',
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  ACCOUNTANT = 'ACCOUNTANT',
  STAFF_AR = 'STAFF_AR', // Accounts Receivable
  STAFF_AP = 'STAFF_AP', // Accounts Payable
  STAFF_INVENTORY = 'STAFF_INVENTORY',
  VIEWER = 'VIEWER',
}

// ============================================================================
// TYPES - Common data structures
// ============================================================================

export type DecimalString = string;

export interface MoneyAmount {
  amount: Decimal | number | string;
  currency?: string;
}

export interface DateRange {
  from: Date;
  to: Date;
}

export interface Pagination {
  page: number;
  limit: number;
  total?: number;
}

export interface SortOrder {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterOptions {
  search?: string;
  status?: string | string[];
  dateRange?: DateRange;
  pagination?: Pagination;
  sort?: SortOrder;
}

// ============================================================================
// JOURNAL ENTRY TYPES
// ============================================================================

export interface JournalEntryInput {
  accountId: string;
  debit: Decimal | number | string;
  credit: Decimal | number | string;
  description?: string;
  departmentId?: string;
}

export interface JournalInput {
  date: Date;
  description: string;
  referenceNo?: string;
  entries: JournalEntryInput[];
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type WithTimestamps<T> = T & {
  createdAt: Date;
  updatedAt: Date;
};

export type WithDeleted<T> = T & {
  deletedAt?: Date | null;
};

export type WithAudit<T> = T & {
  createdBy?: string;
  updatedBy?: string;
};

