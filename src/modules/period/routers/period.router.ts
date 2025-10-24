import { router, protectedProcedure, adminProcedure } from '@/lib/trpc/trpc';
import { periodClosingService } from '../services/periodClosing.service';
import {
  closePeriodSchema,
  closeYearSchema,
  reopenPeriodSchema,
} from '../types';
import { z } from 'zod';

/**
 * Period tRPC Router
 */
export const periodRouter = router({
  /**
   * Close monthly period
   */
  closeMonth: adminProcedure
    .input(closePeriodSchema)
    .mutation(async ({ ctx, input }) => {
      const companyId = 'default-company-id'; // TODO: Get from session
      const userId = 'temp-user-id'; // TODO: Get from session

      return await periodClosingService.closeMonth(companyId, input, userId);
    }),

  /**
   * Close year (year-end closing)
   */
  closeYear: adminProcedure
    .input(closeYearSchema)
    .mutation(async ({ ctx, input }) => {
      const companyId = 'default-company-id'; // TODO: Get from session
      const userId = 'temp-user-id'; // TODO: Get from session

      return await periodClosingService.closeYear(companyId, input, userId);
    }),

  /**
   * Reopen period
   */
  reopenPeriod: adminProcedure
    .input(reopenPeriodSchema)
    .mutation(async ({ ctx, input }) => {
      const companyId = 'default-company-id'; // TODO: Get from session
      const userId = 'temp-user-id'; // TODO: Get from session

      return await periodClosingService.reopenPeriod(companyId, input, userId);
    }),

  /**
   * Get period status
   */
  getStatus: protectedProcedure
    .input(
      z.object({
        year: z.number().int(),
        month: z.number().int().min(1).max(12),
      })
    )
    .query(async ({ ctx, input }) => {
      const companyId = 'default-company-id'; // TODO: Get from session

      return await periodClosingService.getPeriodStatus(companyId, input.year, input.month);
    }),

  /**
   * Get all periods
   */
  list: protectedProcedure
    .input(
      z.object({
        year: z.number().int().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const companyId = 'default-company-id'; // TODO: Get from session

      const where: any = {
        companyId,
      };

      if (input.year) {
        where.year = input.year;
      }

      const periods = await ctx.prisma.accountingPeriod.findMany({
        where,
        orderBy: [
          { year: 'desc' },
          { month: 'desc' },
        ],
      });

      return periods;
    }),

  /**
   * Period Closing sub-router
   */
  closing: router({
    /**
     * List closing periods with pagination and search
     */
    list: protectedProcedure
      .input(
        z.object({
          page: z.number().int().min(1).default(1),
          limit: z.number().int().min(1).max(100).default(20),
          search: z.string().optional(),
          type: z.enum(['MONTHLY', 'YEAR_END']).optional(),
        })
      )
      .query(async ({ ctx, input }) => {
        const companyId = 'default-company-id'; // TODO: Get from session
        const skip = (input.page - 1) * input.limit;

        const where: any = {
          companyId,
        };

        if (input.search) {
          where.OR = [
            { name: { contains: input.search, mode: 'insensitive' } },
            { description: { contains: input.search, mode: 'insensitive' } },
          ];
        }

        // For now, skip type filtering to avoid Prisma null issues
        // TODO: Fix Prisma null filtering for month field
        // if (input.type === 'MONTHLY') {
        //   where.month = { not: null };
        // } else if (input.type === 'YEAR_END') {
        //   where.month = { equals: null };
        // }

        try {
          const [periods, total] = await Promise.all([
            ctx.prisma.accountingPeriod.findMany({
              where,
              skip,
              take: input.limit,
              orderBy: [
                { year: 'desc' },
                { month: 'desc' },
              ],
            }),
            ctx.prisma.accountingPeriod.count({ where }),
          ]);

          return {
            data: periods,
            pagination: {
              page: input.page,
              limit: input.limit,
              total,
              totalPages: Math.ceil(total / input.limit),
            },
          };
        } catch (error) {
          console.error('Database error in period.closing.list:', error);
          // Return empty result if database is not accessible
          return {
            data: [],
            pagination: {
              page: input.page,
              limit: input.limit,
              total: 0,
              totalPages: 0,
            },
          };
        }
      }),

    /**
     * Create monthly closing
     */
    createMonthly: adminProcedure
      .input(
        z.object({
          year: z.number().int(),
          month: z.number().int().min(1).max(12),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const companyId = 'default-company-id'; // TODO: Get from session
        const userId = 'temp-user-id'; // TODO: Get from session

        // Check if period already exists
        const existingPeriod = await ctx.prisma.accountingPeriod.findFirst({
          where: {
            companyId,
            year: input.year,
            month: input.month,
          },
        });

        if (existingPeriod) {
          throw new Error(`Period ${input.year}-${input.month.toString().padStart(2, '0')} already exists`);
        }

        // Create period
        const period = await ctx.prisma.accountingPeriod.create({
          data: {
            companyId,
            year: input.year,
            month: input.month,
            status: 'OPEN',
            startDate: new Date(input.year, input.month - 1, 1),
            endDate: new Date(input.year, input.month, 0),
          },
        });

        return period;
      }),

    /**
     * Create year-end closing
     */
    createYearEnd: adminProcedure
      .input(
        z.object({
          year: z.number().int(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const companyId = 'default-company-id'; // TODO: Get from session
        const userId = 'temp-user-id'; // TODO: Get from session

        // Check if year-end period already exists
        const existingPeriod = await ctx.prisma.accountingPeriod.findFirst({
          where: {
            companyId,
            year: input.year,
          },
        });

        if (existingPeriod) {
          throw new Error(`Year-end period ${input.year} already exists`);
        }

        // Create year-end period
        const period = await ctx.prisma.accountingPeriod.create({
          data: {
            companyId,
            year: input.year,
            month: 12,
            status: 'OPEN',
            startDate: new Date(input.year, 0, 1),
            endDate: new Date(input.year, 11, 31),
          },
        });

        return period;
      }),
  }),
});

