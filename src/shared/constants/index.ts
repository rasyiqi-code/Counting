/**
 * App-wide constants
 */

export const APP_NAME = 'Sistem Akuntansi Double Entry';
export const APP_DESCRIPTION = 'Sistem akuntansi modular monolith untuk bisnis';

export const DEFAULT_CURRENCY = 'IDR';
export const DEFAULT_LOCALE = 'id-ID';

/**
 * Tax rates (Indonesia)
 */
export const TAX_RATES = {
  PPN: 11, // PPN 11%
  PPH_21_NPWP: 5, // PPh 21 dengan NPWP
  PPH_21_NON_NPWP: 6, // PPh 21 tanpa NPWP
  PPH_23: 2, // PPh 23 (2%)
  PPH_4_2: 0.5, // PPh 4(2) final (tergantung jenis usaha)
  PPH_22: 1.5, // PPh 22
} as const;

/**
 * Pagination defaults
 */
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

/**
 * Date formats
 */
export const DATE_FORMATS = {
  DISPLAY: 'dd/MM/yyyy',
  DISPLAY_LONG: 'dd MMMM yyyy',
  DISPLAY_WITH_TIME: 'dd/MM/yyyy HH:mm',
  INPUT: 'yyyy-MM-dd',
  MONTH_YEAR: 'MMMM yyyy',
  YEAR: 'yyyy',
} as const;

/**
 * Account code prefixes (standard Indonesian COA)
 */
export const ACCOUNT_CODE_PREFIXES = {
  ASSET: '1',
  LIABILITY: '2',
  EQUITY: '3',
  REVENUE: '4',
  COGS: '5',
  EXPENSE: '6',
} as const;

/**
 * Default account codes for automation
 */
export const DEFAULT_ACCOUNTS = {
  ACCOUNTS_RECEIVABLE: '1-1300',
  ACCOUNTS_PAYABLE: '2-1100',
  CASH: '1-1100',
  BANK: '1-1200',
  INVENTORY: '1-1400',
  SALES_REVENUE: '4-1000',
  COGS: '5-1000',
  PPN_INPUT: '1-1500',
  PPN_OUTPUT: '2-1200',
  PPH_23_PAYABLE: '2-1300',
  RETAINED_EARNINGS: '3-2000',
  DEPRECIATION_EXPENSE: '6-3000',
  ACCUMULATED_DEPRECIATION: '1-2900',
} as const;

/**
 * Permissions per module
 */
export const PERMISSIONS = {
  // Master Data
  'master-data.coa.view': 'View Chart of Accounts',
  'master-data.coa.create': 'Create Chart of Accounts',
  'master-data.coa.edit': 'Edit Chart of Accounts',
  'master-data.coa.delete': 'Delete Chart of Accounts',
  'master-data.contact.view': 'View Contacts',
  'master-data.contact.create': 'Create Contacts',
  'master-data.contact.edit': 'Edit Contacts',
  'master-data.contact.delete': 'Delete Contacts',
  'master-data.product.view': 'View Products',
  'master-data.product.create': 'Create Products',
  'master-data.product.edit': 'Edit Products',
  'master-data.product.delete': 'Delete Products',
  
  // Sales
  'sales.invoice.view': 'View Sales Invoices',
  'sales.invoice.create': 'Create Sales Invoices',
  'sales.invoice.edit': 'Edit Sales Invoices',
  'sales.invoice.delete': 'Delete Sales Invoices',
  'sales.invoice.approve': 'Approve Sales Invoices',
  'sales.payment.view': 'View Sales Payments',
  'sales.payment.create': 'Create Sales Payments',
  
  // Purchases
  'purchases.bill.view': 'View Purchase Bills',
  'purchases.bill.create': 'Create Purchase Bills',
  'purchases.bill.edit': 'Edit Purchase Bills',
  'purchases.bill.delete': 'Delete Purchase Bills',
  'purchases.bill.approve': 'Approve Purchase Bills',
  'purchases.payment.view': 'View Purchase Payments',
  'purchases.payment.create': 'Create Purchase Payments',
  
  // General Ledger
  'general-ledger.journal.view': 'View Journals',
  'general-ledger.journal.create': 'Create Journals',
  'general-ledger.journal.edit': 'Edit Journals',
  'general-ledger.journal.delete': 'Delete Journals',
  'general-ledger.journal.post': 'Post Journals',
  'general-ledger.journal.reverse': 'Reverse Journals',
  
  // Reports
  'reports.financial.view': 'View Financial Reports',
  'reports.tax.view': 'View Tax Reports',
  'reports.analysis.view': 'View Analysis Reports',
  
  // Period
  'period.close': 'Close Accounting Period',
  'period.reopen': 'Reopen Accounting Period',
  
  // Settings
  'settings.company.view': 'View Company Settings',
  'settings.company.edit': 'Edit Company Settings',
  'settings.user.view': 'View Users',
  'settings.user.create': 'Create Users',
  'settings.user.edit': 'Edit Users',
  'settings.user.delete': 'Delete Users',
  'settings.audit.view': 'View Audit Trail',
} as const;

/**
 * Role permissions mapping
 */
export const ROLE_PERMISSIONS = {
  SUPER_ADMIN: Object.keys(PERMISSIONS),
  ADMIN: Object.keys(PERMISSIONS).filter(p => !p.startsWith('settings.user')),
  MANAGER: [
    'master-data.coa.view',
    'master-data.contact.view',
    'master-data.product.view',
    'sales.invoice.view',
    'sales.invoice.approve',
    'sales.payment.view',
    'purchases.bill.view',
    'purchases.bill.approve',
    'purchases.payment.view',
    'general-ledger.journal.view',
    'reports.financial.view',
    'reports.tax.view',
    'reports.analysis.view',
    'settings.audit.view',
  ],
  ACCOUNTANT: [
    'master-data.coa.view',
    'master-data.coa.create',
    'master-data.coa.edit',
    'general-ledger.journal.view',
    'general-ledger.journal.create',
    'general-ledger.journal.edit',
    'general-ledger.journal.post',
    'reports.financial.view',
    'reports.tax.view',
    'period.close',
  ],
  STAFF_AR: [
    'master-data.contact.view',
    'master-data.product.view',
    'sales.invoice.view',
    'sales.invoice.create',
    'sales.invoice.edit',
    'sales.payment.view',
    'sales.payment.create',
  ],
  STAFF_AP: [
    'master-data.contact.view',
    'master-data.product.view',
    'purchases.bill.view',
    'purchases.bill.create',
    'purchases.bill.edit',
    'purchases.payment.view',
    'purchases.payment.create',
  ],
  STAFF_INVENTORY: [
    'master-data.product.view',
    'master-data.product.create',
    'master-data.product.edit',
  ],
  VIEWER: [
    'master-data.coa.view',
    'master-data.contact.view',
    'master-data.product.view',
    'sales.invoice.view',
    'purchases.bill.view',
    'reports.financial.view',
  ],
} as const;

