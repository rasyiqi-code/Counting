import { router, protectedProcedure } from '@/lib/trpc/trpc';
import { salesInvoiceService } from '../services/salesInvoice.service';
import { paymentService } from '../services/payment.service';
import {
  createSalesInvoiceSchema,
  updateSalesInvoiceSchema,
  receivePaymentSchema,
  getSalesInvoicesSchema,
  deleteSalesInvoiceSchema,
  getSalesInvoiceSchema,
  getARAgingSchema,
} from '../types';
import { z } from 'zod';

/**
 * Sales tRPC Router
 */
export const salesRouter = router({
  /**
   * INVOICE PROCEDURES
   */
  invoice: router({
    /**
     * Create sales invoice
     */
    create: protectedProcedure
      .input(createSalesInvoiceSchema)
      .mutation(async ({ ctx, input }) => {
        const companyId = 'default-company-id'; // TODO: Get from session

        return await salesInvoiceService.createSalesInvoice(companyId, input);
      }),

    /**
     * Update sales invoice
     */
    update: protectedProcedure
      .input(updateSalesInvoiceSchema)
      .mutation(async ({ ctx, input }) => {
        const companyId = 'default-company-id'; // TODO: Get from session

        return await salesInvoiceService.updateSalesInvoice(companyId, input);
      }),

    /**
     * Delete sales invoice
     */
    delete: protectedProcedure
      .input(deleteSalesInvoiceSchema)
      .mutation(async ({ ctx, input }) => {
        const companyId = 'default-company-id'; // TODO: Get from session

        return await salesInvoiceService.deleteSalesInvoice(companyId, input.id);
      }),

    /**
     * Get invoice by ID
     */
    getById: protectedProcedure
      .input(getSalesInvoiceSchema)
      .query(async ({ ctx, input }) => {
        const companyId = 'default-company-id'; // TODO: Get from session

        return await salesInvoiceService.getInvoiceById(companyId, input.id);
      }),

    /**
     * Get invoices list
     */
    list: protectedProcedure
      .input(getSalesInvoicesSchema)
      .query(async ({ ctx, input }) => {
        const companyId = 'default-company-id'; // TODO: Get from session

        const where: any = {
          companyId,
          type: 'SALES',
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

        const [invoices, total] = await Promise.all([
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
          data: invoices,
          pagination: {
            page: input.page,
            limit: input.limit,
            total,
            pages: Math.ceil(total / input.limit),
          },
        };
      }),

    /**
     * Generate journal for invoice
     */
    generateJournal: protectedProcedure
      .input(z.object({ invoiceId: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const companyId = 'default-company-id'; // TODO: Get from session
        const userId = 'temp-user-id'; // TODO: Get from session

        return await salesInvoiceService.generateJournal(companyId, input.invoiceId, userId);
      }),
  }),

  /**
   * PAYMENT PROCEDURES
   */
  payment: router({
    /**
     * Receive payment from customer
     */
    receive: protectedProcedure
      .input(receivePaymentSchema)
      .mutation(async ({ ctx, input }) => {
        const companyId = 'default-company-id'; // TODO: Get from session
        const userId = 'temp-user-id'; // TODO: Get from session

        return await paymentService.receivePayment(companyId, input, userId);
      }),

    /**
     * Get payment by ID
     */
    getById: protectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const companyId = 'default-company-id'; // TODO: Get from session

        return await paymentService.getPaymentById(companyId, input.id);
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
          type: 'RECEIVE',
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
     * Get AR Aging Report
     */
    arAging: protectedProcedure
      .input(getARAgingSchema)
      .query(async ({ ctx, input }) => {
        const companyId = 'default-company-id'; // TODO: Get from session

        const where: any = {
          companyId,
          type: 'SALES',
          status: {
            in: ['SENT', 'PARTIAL_PAID', 'OVERDUE'],
          },
        };

        if (input.contactId) {
          where.contactId = input.contactId;
        }

        const invoices = await ctx.prisma.invoice.findMany({
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

        const invoiceDetails: any[] = [];

        for (const invoice of invoices) {
          const balance = parseFloat(invoice.total.toString()) - parseFloat(invoice.paidAmount.toString());
          const daysPastDue = Math.floor((today.getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24));

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

          invoiceDetails.push({
            invoiceNo: invoice.invoiceNo,
            date: invoice.date,
            dueDate: invoice.dueDate,
            customer: invoice.contact,
            total: invoice.total,
            paid: invoice.paidAmount,
            balance,
            daysPastDue: Math.max(0, daysPastDue),
            status: invoice.status,
          });
        }

        return {
          summary: aging,
          invoices: invoiceDetails,
        };
      }),
  }),
});

