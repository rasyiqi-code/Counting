/**
 * Master Data Module - Public API
 * 
 * This module contains all master data entities:
 * - Chart of Accounts (COA)
 * - Contacts (Customers, Vendors, Employees)
 * - Products & Services
 * - Bank Accounts
 * - Tax Rates
 */

import { router } from '@/lib/trpc/trpc';
import { coaRouter } from './coa/routers/coa.router';
import { contactRouter } from './contact/routers/contact.router';
import { productRouter } from './product/routers/product.router';

/**
 * Master Data Router
 * Combines all master data sub-routers
 */
export const masterDataRouter = router({
  coa: coaRouter,
  contact: contactRouter,
  product: productRouter,
  // TODO: Add other sub-routers
  // bankAccount: bankAccountRouter,
  // taxRate: taxRateRouter,
});

// Export services
export { coaService } from './coa/services/coa.service';
export { contactService } from './contact/services/contact.service';
export { productService } from './product/services/product.service';

// Export types
export type {
  CreateAccountInput,
  UpdateAccountInput,
  AccountNode,
} from './coa/types';

export type {
  CreateContactInput,
  UpdateContactInput,
} from './contact/types';

export type {
  CreateProductInput,
  UpdateProductInput,
} from './product/types';

