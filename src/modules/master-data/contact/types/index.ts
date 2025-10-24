import { z } from 'zod';
import { ContactType } from '@/shared/types';

/**
 * Contact Types (Customers, Vendors, Employees)
 */

export interface CreateContactInput {
  type: string; // ContactType
  name: string;
  email?: string;
  phone?: string;
  mobile?: string;
  website?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  npwp?: string;
  nik?: string;
  // Customer specific
  creditLimit?: number;
  paymentTerms?: number;
  // Vendor specific
  vendorCode?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankName?: string;
  notes?: string;
}

export interface UpdateContactInput {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  website?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  npwp?: string;
  nik?: string;
  creditLimit?: number;
  paymentTerms?: number;
  vendorCode?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankName?: string;
  isActive?: boolean;
  notes?: string;
}

export interface GetContactsInput {
  type?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

export const createContactSchema = z.object({
  type: z.enum([
    ContactType.CUSTOMER,
    ContactType.VENDOR,
    ContactType.EMPLOYEE,
    ContactType.OTHER,
  ]),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().default('Indonesia'),
  npwp: z.string().optional(),
  nik: z.string().optional(),
  // Customer specific
  creditLimit: z.number().min(0).optional(),
  paymentTerms: z.number().int().min(0).optional(),
  // Vendor specific
  vendorCode: z.string().optional(),
  bankAccountName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankName: z.string().optional(),
  notes: z.string().optional(),
});

export const updateContactSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  npwp: z.string().optional(),
  nik: z.string().optional(),
  creditLimit: z.number().min(0).optional(),
  paymentTerms: z.number().int().min(0).optional(),
  vendorCode: z.string().optional(),
  bankAccountName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankName: z.string().optional(),
  isActive: z.boolean().optional(),
  notes: z.string().optional(),
});

export const getContactsSchema = z.object({
  type: z.string().optional(),
  search: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export const deleteContactSchema = z.object({
  id: z.string().uuid(),
});

export const getContactSchema = z.object({
  id: z.string().uuid(),
});

