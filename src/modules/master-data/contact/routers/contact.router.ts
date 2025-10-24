import { router, protectedProcedure } from '@/lib/trpc/trpc';
import { contactService } from '../services/contact.service';
import {
  createContactSchema,
  updateContactSchema,
  getContactsSchema,
  deleteContactSchema,
  getContactSchema,
} from '../types';
import { z } from 'zod';

/**
 * Contact tRPC Router
 */
export const contactRouter = router({
  /**
   * Create contact
   */
  create: protectedProcedure
    .input(createContactSchema)
    .mutation(async ({ ctx, input }) => {
      const companyId = 'default-company-id'; // TODO: Get from session

      return await contactService.createContact(companyId, input);
    }),

  /**
   * Update contact
   */
  update: protectedProcedure
    .input(updateContactSchema)
    .mutation(async ({ ctx, input }) => {
      const companyId = 'default-company-id'; // TODO: Get from session

      return await contactService.updateContact(companyId, input);
    }),

  /**
   * Delete contact
   */
  delete: protectedProcedure
    .input(deleteContactSchema)
    .mutation(async ({ ctx, input }) => {
      const companyId = 'default-company-id'; // TODO: Get from session

      return await contactService.deleteContact(companyId, input.id);
    }),

  /**
   * Get contact by ID
   */
  getById: protectedProcedure
    .input(getContactSchema)
    .query(async ({ ctx, input }) => {
      const companyId = 'default-company-id'; // TODO: Get from session

      return await contactService.getContactById(companyId, input.id);
    }),

  /**
   * Get contacts list
   */
  list: protectedProcedure
    .input(getContactsSchema)
    .query(async ({ ctx, input }) => {
      const companyId = 'default-company-id'; // TODO: Get from session

      return await contactService.getContacts(companyId, input);
    }),

  /**
   * Search contacts
   */
  search: protectedProcedure
    .input(
      z.object({
        query: z.string(),
        type: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const companyId = 'default-company-id'; // TODO: Get from session

      return await contactService.searchContacts(companyId, input.query, input.type);
    }),

  /**
   * Get customer AR aging
   */
  getCustomerARaging: protectedProcedure
    .input(z.object({ customerId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const companyId = 'default-company-id'; // TODO: Get from session

      return await contactService.getCustomerARaging(companyId, input.customerId);
    }),

  /**
   * Get vendor AP aging
   */
  getVendorAPaging: protectedProcedure
    .input(z.object({ vendorId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const companyId = 'default-company-id'; // TODO: Get from session

      return await contactService.getVendorAPaging(companyId, input.vendorId);
    }),
});

