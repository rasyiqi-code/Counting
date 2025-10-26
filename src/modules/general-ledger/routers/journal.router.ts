import { router, protectedProcedure } from '@/lib/trpc/trpc';
import { doubleEntryService } from '../services/doubleEntry.service';
import { ledgerService } from '../services/ledger.service';
import {
  createJournalSchema,
  postJournalSchema,
  reverseJournalSchema,
  getLedgerSchema,
  getTrialBalanceSchema,
} from '../types';
import { z } from 'zod';

/**
 * General Ledger tRPC Router
 */
export const journalRouter = router({
  /**
   * Create journal entry
   */
  create: protectedProcedure
    .input(createJournalSchema)
    .mutation(async ({ ctx, input }) => {
      // TODO: Get companyId and userId from session when auth is implemented
      const companyId = 'default-company-id'; // Temporary
      const userId = 'temp-user-id'; // Temporary

      return await doubleEntryService.createJournal(companyId, input, {
        createdById: userId,
      });
    }),

  /**
   * Get journal list with pagination
   */
  list: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(20),
        status: z.string().optional(),
        startDate: z.coerce.date().optional(),
        endDate: z.coerce.date().optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const companyId = 'default-company-id'; // Temporary

      const where: any = {
        companyId,
      };

      if (input.status) {
        where.status = input.status;
      }

      if (input.startDate || input.endDate) {
        where.date = {};
        if (input.startDate) {
          where.date.gte = input.startDate;
        }
        if (input.endDate) {
          where.date.lte = input.endDate;
        }
      }

      if (input.search) {
        where.OR = [
          { journalNo: { contains: input.search, mode: 'insensitive' } },
          { description: { contains: input.search, mode: 'insensitive' } },
          { referenceNo: { contains: input.search, mode: 'insensitive' } },
        ];
      }

      const [journals, total] = await Promise.all([
        ctx.prisma.journal.findMany({
          where,
          include: {
            entries: {
              include: {
                account: {
                  select: {
                    code: true,
                    name: true,
                  },
                },
              },
            },
            createdBy: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            date: 'desc',
          },
          skip: (input.page - 1) * input.limit,
          take: input.limit,
        }),
        ctx.prisma.journal.count({ where }),
      ]);

      // Calculate total debit and credit for each journal
      const journalsWithTotals = journals.map((journal: any) => {
        const totalDebit = journal.entries.reduce((sum: number, entry: any) => {
          return sum + Number(entry.debit.toString());
        }, 0);
        
        const totalCredit = journal.entries.reduce((sum: number, entry: any) => {
          return sum + Number(entry.credit.toString());
        }, 0);

        return {
          ...journal,
          totalDebit,
          totalCredit,
        };
      });

      return {
        data: journalsWithTotals,
        pagination: {
          page: input.page,
          limit: input.limit,
          total,
          pages: Math.ceil(total / input.limit),
        },
      };
    }),

  /**
   * Get journal by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const journal = await ctx.prisma.journal.findUnique({
        where: { id: input.id },
        include: {
          entries: {
            include: {
              account: {
                select: {
                  code: true,
                  name: true,
                  accountType: true,
                },
              },
            },
          },
          createdBy: {
            select: {
              name: true,
              email: true,
            },
          },
          updatedBy: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      if (!journal) {
        throw new Error('Journal not found');
      }

      return journal;
    }),

  /**
   * Post journal
   */
  post: protectedProcedure
    .input(postJournalSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = 'temp-user-id'; // Temporary

      return await doubleEntryService.postJournal(input, userId);
    }),

  /**
   * Reverse journal
   */
  reverse: protectedProcedure
    .input(reverseJournalSchema)
    .mutation(async ({ ctx, input }) => {
      const companyId = 'default-company-id'; // Temporary
      const userId = 'temp-user-id'; // Temporary

      return await doubleEntryService.reverseJournal(companyId, input, userId);
    }),

  /**
   * Void journal
   */
  void: protectedProcedure
    .input(z.object({ journalId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = 'temp-user-id'; // Temporary

      return await doubleEntryService.voidJournal(input.journalId, userId);
    }),

  /**
   * Get account ledger
   */
  getLedger: protectedProcedure
    .input(getLedgerSchema)
    .query(async ({ ctx, input }) => {
      const companyId = 'default-company-id'; // Temporary

      return await ledgerService.getLedger(companyId, input);
    }),

  /**
   * Get trial balance
   */
  getTrialBalance: protectedProcedure
    .input(getTrialBalanceSchema)
    .query(async ({ ctx, input }) => {
      const companyId = 'default-company-id'; // Temporary

      return await ledgerService.getTrialBalance(companyId, input);
    }),
});

