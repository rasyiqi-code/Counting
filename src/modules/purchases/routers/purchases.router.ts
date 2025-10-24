import { router, protectedProcedure } from '@/lib/trpc/trpc';
import { purchaseBillService } from '../services/purchaseBill.service';
import { purchasePaymentService } from '../services/payment.service';
import {
  createPurchaseBillSchema,
  updatePurchaseBillSchema,
  makePaymentSchema,
  getPurchaseBillsSchema,
  deletePurchaseBillSchema,
  getPurchaseBillSchema,
  getAPAgingSchema,
} from '../types';
import { z } from 'zod';

/**
 * Purchases tRPC Router
 */
export const purchasesRouter = router({
  /**
   * BILL PROCEDURES
   */
  bill: router({
    /**
     * Create purchase bill
     */
    create: protectedProcedure
      .input(createPurchaseBillSchema)
      .mutation(async ({ ctx, input }) => {
        const companyId = 'default-company-id'; // TODO: Get from session

        return await purchaseBillService.createPurchaseBill(companyId, input);
      }),

    /**
     * Update purchase bill
     */
    update: protectedProcedure
      .input(updatePurchaseBillSchema)
      .mutation(async ({ ctx, input }) => {
        const companyId = 'default-company-id'; // TODO: Get from session

        return await purchaseBillService.updatePurchaseBill(companyId, input);
      }),

    /**
     * Delete purchase bill
     */
    delete: protectedProcedure
      .input(deletePurchaseBillSchema)
      .mutation(async ({ ctx, input }) => {
        const companyId = 'default-company-id'; // TODO: Get from session

        return await purchaseBillService.deletePurchaseBill(companyId, input.id);
      }),

    /**
     * Get bill by ID
     */
    getById: protectedProcedure
      .input(getPurchaseBillSchema)
      .query(async ({ ctx, input }) => {
        const companyId = 'default-company-id'; // TODO: Get from session

        return await purchaseBillService.getBillById(companyId, input.id);
      }),

    /**
     * Get bills list
     */
    list: protectedProcedure
      .input(getPurchaseBillsSchema)
      .query(async ({ ctx, input }) => {
        const companyId = 'default-company-id'; // TODO: Get from session

        const where: any = {
          companyId,
          type: 'PURCHASE',
        };

        if (input.status) {
          where.status = input.status;
        }

        if (input.contactId) {
          where.contactId = input.contactId;
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
            { invoiceNo: { contains: input.search, mode: 'insensitive' } },
            { referenceNo: { contains: input.search, mode: 'insensitive' } },
            { description: { contains: input.search, mode: 'insensitive' } },
          ];
        }

        const [bills, total] = await Promise.all([
          ctx.prisma.invoice.findMany({
            where,
            include: {
              contact: {
                select: {
                  code: true,
                  name: true,
                },
              },
              items: {
                select: {
                  id: true,
                  quantity: true,
                  total: true,
                },
              },
            },
            orderBy: {
              date: 'desc',
            },
            skip: (input.page - 1) * input.limit,
            take: input.limit,
          }),
          ctx.prisma.invoice.count({ where }),
        ]);

        return {
          data: bills,
          pagination: {
            page: input.page,
            limit: input.limit,
            total,
            pages: Math.ceil(total / input.limit),
          },
        };
      }),

    /**
     * Generate journal for bill
     */
    generateJournal: protectedProcedure
      .input(z.object({ billId: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const companyId = 'default-company-id'; // TODO: Get from session
        const userId = 'temp-user-id'; // TODO: Get from session

        return await purchaseBillService.generateJournal(companyId, input.billId, userId);
      }),
  }),

  /**
   * PAYMENT PROCEDURES
   */
  payment: router({
    /**
     * Make payment to vendor
     */
    make: protectedProcedure
      .input(makePaymentSchema)
      .mutation(async ({ ctx, input }) => {
        const companyId = 'default-company-id'; // TODO: Get from session
        const userId = 'temp-user-id'; // TODO: Get from session

        return await purchasePaymentService.makePayment(companyId, input, userId);
      }),

    /**
     * Get payment by ID
     */
    getById: protectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const companyId = 'default-company-id'; // TODO: Get from session

        return await purchasePaymentService.getPaymentById(companyId, input.id);
      }),

    /**
     * Get payments list
     */
    list: protectedProcedure
      .input(
        z.object({
          contactId: z.string().uuid().optional(),
          startDate: z.coerce.date().optional(),
          endDate: z.coerce.date().optional(),
          page: z.number().int().min(1).default(1),
          limit: z.number().int().min(1).max(100).default(20),
        })
      )
      .query(async ({ ctx, input }) => {
        const companyId = 'default-company-id'; // TODO: Get from session

        const where: any = {
          companyId,
          type: 'PAY',
        };

        if (input.contactId) {
          where.contactId = input.contactId;
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

        const [payments, total] = await Promise.all([
          ctx.prisma.payment.findMany({
            where,
            include: {
              contact: {
                select: {
                  code: true,
                  name: true,
                },
              },
              bankAccount: {
                select: {
                  name: true,
                },
              },
              allocations: {
                select: {
                  invoice: {
                    select: {
                      invoiceNo: true,
                    },
                  },
                  amount: true,
                },
              },
            },
            orderBy: {
              date: 'desc',
            },
            skip: (input.page - 1) * input.limit,
            take: input.limit,
          }),
          ctx.prisma.payment.count({ where }),
        ]);

        return {
          data: payments,
          pagination: {
            page: input.page,
            limit: input.limit,
            total,
            pages: Math.ceil(total / input.limit),
          },
        };
      }),
  }),

  /**
   * REPORTS PROCEDURES
   */
  reports: router({
    /**
     * Get AP Aging Report
     */
    apAging: protectedProcedure
      .input(getAPAgingSchema)
      .query(async ({ ctx, input }) => {
        const companyId = 'default-company-id'; // TODO: Get from session

        const where: any = {
          companyId,
          type: 'PURCHASE',
          status: {
            in: ['SENT', 'PARTIAL_PAID', 'OVERDUE'],
          },
        };

        if (input.contactId) {
          where.contactId = input.contactId;
        }

        const bills = await ctx.prisma.invoice.findMany({
          where,
          include: {
            contact: {
              select: {
                code: true,
                name: true,
              },
            },
          },
          orderBy: {
            dueDate: 'asc',
          },
        });

        const today = input.asOfDate || new Date();
        const aging: any = {
          current: 0,
          days1_30: 0,
          days31_60: 0,
          days61_90: 0,
          over90: 0,
          total: 0,
        };

        const billDetails: any[] = [];

        for (const bill of bills) {
          const balance = parseFloat(bill.total.toString()) - parseFloat(bill.paidAmount.toString());
          const daysPastDue = Math.floor((today.getTime() - bill.dueDate.getTime()) / (1000 * 60 * 60 * 24));

          if (daysPastDue <= 0) {
            aging.current += balance;
          } else if (daysPastDue <= 30) {
            aging.days1_30 += balance;
          } else if (daysPastDue <= 60) {
            aging.days31_60 += balance;
          } else if (daysPastDue <= 90) {
            aging.days61_90 += balance;
          } else {
            aging.over90 += balance;
          }

          aging.total += balance;

          billDetails.push({
            billNo: bill.invoiceNo,
            date: bill.date,
            dueDate: bill.dueDate,
            vendor: bill.contact,
            total: bill.total,
            paid: bill.paidAmount,
            balance,
            daysPastDue: Math.max(0, daysPastDue),
            status: bill.status,
          });
        }

        return {
          summary: aging,
          bills: billDetails,
        };
      }),
  }),
});

