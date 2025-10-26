import { router, protectedProcedure } from '@/lib/trpc/trpc';
import { coaService } from '../services/coa.service';
import {
  createAccountSchema,
  updateAccountSchema,
  setOpeningBalanceSchema,
  deleteAccountSchema,
  getAccountSchema,
} from '../types';
import { z } from 'zod';

/**
 * Chart of Accounts tRPC Router
 */
export const coaRouter = router({
  /**
   * Create account
   */
  create: protectedProcedure
    .input(createAccountSchema)
    .mutation(async ({ ctx, input }) => {
      const companyId = 'default-company-id'; // TODO: Get from session

      return await coaService.createAccount(companyId, input);
    }),

  /**
   * Update account
   */
  update: protectedProcedure
    .input(updateAccountSchema)
    .mutation(async ({ ctx, input }) => {
      const companyId = 'default-company-id'; // TODO: Get from session

      return await coaService.updateAccount(companyId, input);
    }),

  /**
   * Delete account
   */
  delete: protectedProcedure
    .input(deleteAccountSchema)
    .mutation(async ({ ctx, input }) => {
      const companyId = 'default-company-id'; // TODO: Get from session

      return await coaService.deleteAccount(companyId, input.id);
    }),

  /**
   * Get account by ID
   */
  getById: protectedProcedure
    .input(getAccountSchema)
    .query(async ({ ctx, input }) => {
      const companyId = 'default-company-id'; // TODO: Get from session

      return await coaService.getAccountById(companyId, input.id);
    }),

  /**
   * Get account tree
   */
  getTree: protectedProcedure
    .input(z.object({
      showInactive: z.boolean().default(false),
    }))
    .query(async ({ ctx, input }) => {
      const companyId = 'default-company-id'; // TODO: Get from session

      return await coaService.getAccountTree(companyId, input.showInactive);
    }),

  /**
   * Search accounts
   */
  search: protectedProcedure
    .input(z.object({
      query: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const companyId = 'default-company-id'; // TODO: Get from session

      return await coaService.searchAccounts(companyId, input.query);
    }),

  /**
   * Set opening balance
   */
  setOpeningBalance: protectedProcedure
    .input(setOpeningBalanceSchema)
    .mutation(async ({ ctx, input }) => {
      const companyId = 'default-company-id'; // TODO: Get from session

      return await coaService.setOpeningBalance(companyId, input);
    }),

  /**
   * Get list of accounts
   */
  list: protectedProcedure
    .input(z.object({
      accountType: z.string().optional(),
      search: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(50),
    }))
    .query(async ({ ctx, input }) => {
      const companyId = 'default-company-id'; // TODO: Get from session

      const where: any = {
        companyId,
        isActive: true,
      };

      if (input.accountType) {
        where.accountType = input.accountType;
      }

      if (input.search) {
        where.OR = [
          { code: { contains: input.search, mode: 'insensitive' } },
          { name: { contains: input.search, mode: 'insensitive' } },
        ];
      }

      const [accounts, total] = await Promise.all([
        ctx.prisma.chartOfAccount.findMany({
          where,
          orderBy: {
            code: 'asc',
          },
          skip: (input.page - 1) * input.limit,
          take: input.limit,
        }),
        ctx.prisma.chartOfAccount.count({ where }),
      ]);

      return {
        data: accounts,
        pagination: {
          page: input.page,
          limit: input.limit,
          total,
          pages: Math.ceil(total / input.limit),
        },
      };
    }),

  /**
   * AI: Suggest account details
   */
  suggestAccount: protectedProcedure
    .input(z.object({
      description: z.string(),
      businessType: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const companyId = 'default-company-id'; // TODO: Get from session
      
      return await coaService.suggestAccountDetails(companyId, input.description, input.businessType);
    }),

  /**
   * AI: Validate account structure compliance
   */
  validateCompliance: protectedProcedure
    .input(z.object({
      accountStructure: z.any(),
    }))
    .mutation(async ({ ctx, input }) => {
      const companyId = 'default-company-id'; // TODO: Get from session
      
      return await coaService.validateAccountCompliance(companyId, input.accountStructure);
    }),

  /**
   * AI: Natural language search accounts
   */
  searchAccountsAI: protectedProcedure
    .input(z.object({
      query: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const companyId = 'default-company-id'; // TODO: Get from session
      
      return await coaService.searchAccountsWithAI(companyId, input.query);
    }),

  /**
   * AI: Analyze account structure
   */
  analyzeStructure: protectedProcedure
    .query(async ({ ctx }) => {
      const companyId = 'default-company-id'; // TODO: Get from session
      
      return await coaService.analyzeAccountStructure(companyId);
    }),
});

