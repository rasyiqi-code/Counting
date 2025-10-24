import { router, protectedProcedure } from '@/lib/trpc/trpc';
import { incomeStatementService } from '../services/incomeStatement.service';
import { balanceSheetService } from '../services/balanceSheet.service';
import { cashFlowService } from '../services/cashFlow.service';
import { financialReportSchema, taxReportSchema } from '../types';
import { z } from 'zod';
import { Decimal } from 'decimal.js';

/**
 * Reports tRPC Router
 */
export const reportsRouter = router({
  /**
   * FINANCIAL REPORTS
   */
  financial: router({
    /**
     * Income Statement (Profit & Loss)
     */
    incomeStatement: protectedProcedure
      .input(financialReportSchema)
      .query(async ({ ctx, input }) => {
        const companyId = 'default-company-id'; // TODO: Get from session

        return await incomeStatementService.generate(companyId, input);
      }),

    /**
     * Balance Sheet
     */
    balanceSheet: protectedProcedure
      .input(financialReportSchema)
      .query(async ({ ctx, input }) => {
        const companyId = 'default-company-id'; // TODO: Get from session

        return await balanceSheetService.generate(companyId, input);
      }),

    /**
     * Cash Flow Statement
     */
    cashFlow: protectedProcedure
      .input(financialReportSchema)
      .query(async ({ ctx, input }) => {
        const companyId = 'default-company-id'; // TODO: Get from session

        return await cashFlowService.generate(companyId, input);
      }),
  }),

  /**
   * TAX REPORTS
   */
  tax: router({
    /**
     * PPN Report (VAT)
     */
    ppn: protectedProcedure
      .input(taxReportSchema)
      .query(async ({ ctx, input }) => {
        const companyId = 'default-company-id'; // TODO: Get from session

        // Get PPN accounts
        const ppnInputAccount = await ctx.prisma.chartOfAccount.findFirst({
          where: { companyId, code: '1-1500' }, // PPN Masukan
        });

        const ppnOutputAccount = await ctx.prisma.chartOfAccount.findFirst({
          where: { companyId, code: '2-1200' }, // PPN Keluaran
        });

        if (!ppnInputAccount || !ppnOutputAccount) {
          throw new Error('PPN accounts not found');
        }

        // Get entries in period
        const [inputEntries, outputEntries] = await Promise.all([
          ctx.prisma.journalEntry.findMany({
            where: {
              accountId: ppnInputAccount.id,
              journal: {
                companyId,
                status: 'POSTED',
                date: {
                  gte: input.startDate,
                  lte: input.endDate,
                },
              },
            },
            include: {
              journal: {
                select: {
                  journalNo: true,
                  date: true,
                  description: true,
                  referenceNo: true,
                },
              },
            },
          }),
          ctx.prisma.journalEntry.findMany({
            where: {
              accountId: ppnOutputAccount.id,
              journal: {
                companyId,
                status: 'POSTED',
                date: {
                  gte: input.startDate,
                  lte: input.endDate,
                },
              },
            },
            include: {
              journal: {
                select: {
                  journalNo: true,
                  date: true,
                  description: true,
                  referenceNo: true,
                },
              },
            },
          }),
        ]);

        // Calculate totals
        const totalPPNInput = inputEntries.reduce((sum, entry) => {
          return sum.plus(new Decimal(entry.debit)).minus(new Decimal(entry.credit));
        }, new Decimal(0));

        const totalPPNOutput = outputEntries.reduce((sum, entry) => {
          return sum.plus(new Decimal(entry.credit)).minus(new Decimal(entry.debit));
        }, new Decimal(0));

        const netPPN = totalPPNOutput.minus(totalPPNInput);

        return {
          ppnInput: {
            entries: inputEntries,
            total: totalPPNInput,
          },
          ppnOutput: {
            entries: outputEntries,
            total: totalPPNOutput,
          },
          netPPN,
          status: netPPN.greaterThan(0) ? 'KURANG_BAYAR' : netPPN.lessThan(0) ? 'LEBIH_BAYAR' : 'NIHIL',
        };
      }),

    /**
     * PPh 23 Report
     */
    pph23: protectedProcedure
      .input(taxReportSchema)
      .query(async ({ ctx, input }) => {
        const companyId = 'default-company-id'; // TODO: Get from session

        const pph23Account = await ctx.prisma.chartOfAccount.findFirst({
          where: { companyId, code: '2-1300' }, // Utang PPh 23
        });

        if (!pph23Account) {
          throw new Error('PPh 23 account not found');
        }

        const entries = await ctx.prisma.journalEntry.findMany({
          where: {
            accountId: pph23Account.id,
            journal: {
              companyId,
              status: 'POSTED',
              date: {
                gte: input.startDate,
                lte: input.endDate,
              },
            },
          },
          include: {
            journal: {
              select: {
                journalNo: true,
                date: true,
                description: true,
                referenceNo: true,
              },
            },
          },
        });

        const total = entries.reduce((sum, entry) => {
          return sum.plus(new Decimal(entry.credit)).minus(new Decimal(entry.debit));
        }, new Decimal(0));

        return {
          entries,
          total,
        };
      }),
  }),
});

