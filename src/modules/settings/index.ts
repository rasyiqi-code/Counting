/**
 * Settings Module - Public API
 * 
 * This module handles:
 * - Company Information & Settings
 * - Audit Trail
 * - User Management (TODO - in auth module)
 */

export { settingsRouter } from './routers/settings.router';
export { companyService } from './services/company.service';
export { auditService } from './services/audit.service';

export type {
  UpdateCompanyInput,
  GetAuditLogsInput,
} from './types';

