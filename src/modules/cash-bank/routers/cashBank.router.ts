import { router, protectedProcedure } from '@/lib/trpc/trpc';
import { cashBankService } from '../services/cashBank.service';
import {
  createOtherIncomeSchema,
  createOtherExpenseSchema,
  createBankTransferSchema,
} from '../types';
import { z } from 'zod';

/**
 * Cash & Bank tRPC Router
 */
export const cashBankRouter = router({
  /**
   * Record other income
   */
  recordIncome: protectedProcedure
    .input(createOtherIncomeSchema)
    .mutation(async ({ ctx, input }) => {
      const companyId = 'default-company-id'; // TODO: Get from session
      const userId = 'temp-user-id'; // TODO: Get from session

      return await cashBankService.recordOtherIncome(companyId, input, userId);
    }),

  /**
   * Record other expense
   */
  recordExpense: protectedProcedure
    .input(createOtherExpenseSchema)
    .mutation(async ({ ctx, input }) => {
      const companyId = 'default-company-id'; // TODO: Get from session
      const userId = 'temp-user-id'; // TODO: Get from session

      return await cashBankService.recordOtherExpense(companyId, input, userId);
    }),

  /**
   * Record bank transfer
   */
  recordTransfer: protectedProcedure
    .input(createBankTransferSchema)
    .mutation(async ({ ctx, input }) => {
      const companyId = 'default-company-id'; // TODO: Get from session
      const userId = 'temp-user-id'; // TODO: Get from session

      return await cashBankService.recordBankTransfer(companyId, input, userId);
    }),

  /**
   * List bank accounts
   */
  listBankAccounts: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const companyId = 'default-company-id'; // TODO: Get from session

      const where: any = {
        companyId,
      };

      if (input.search) {
        where.OR = [
          { name: { contains: input.search, mode: 'insensitive' } },
          { bankName: { contains: input.search, mode: 'insensitive' } },
          { accountNumber: { contains: input.search, mode: 'insensitive' } },
        ];
      }

      const [bankAccounts, total] = await Promise.all([
        ctx.prisma.bankAccount.findMany({
          where,
          include: {
            account: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
          orderBy: {
            name: 'asc',
          },
          skip: (input.page - 1) * input.limit,
          take: input.limit,
        }),
        ctx.prisma.bankAccount.count({ where }),
      ]);

      return {
        data: bankAccounts,
        pagination: {
          page: input.page,
          limit: input.limit,
          total,
          pages: Math.ceil(total / input.limit),
        },
      };
    }),

  /**
   * Get bank account by ID
   */
  getBankAccountById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const companyId = 'default-company-id'; // TODO: Get from session

      const bankAccount = await ctx.prisma.bankAccount.findFirst({
        where: {
          id: input.id,
          companyId,
        },
        include: {
          account: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });

      if (!bankAccount) {
        throw new Error('Bank account not found');
      }

      return bankAccount;
    }),
});

