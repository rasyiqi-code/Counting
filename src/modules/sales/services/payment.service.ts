import { prisma } from '@/shared/database/prisma';
import { doubleEntryService } from '@/modules/general-ledger';
import { ReceivePaymentInput } from '../types';
import { Decimal } from 'decimal.js';
import { format } from 'date-fns';

/**
 * Payment Service (Receive Payment from Customers)
 * 
 * Auto-generate journal entries for payments
 */
export class PaymentService {
  /**
   * Generate payment number
   * Format: PAY-YYYYMMDD-XXXX
   */
  private async generatePaymentNo(companyId: string, date: Date): Promise<string> {
    const dateStr = format(date, 'yyyyMMdd');
    const prefix = `PAY-${dateStr}`;

    const lastPayment = await prisma.payment.findFirst({
      where: {
        companyId,
        type: 'RECEIVE',
        paymentNo: {
          startsWith: prefix,
        },
      },
      orderBy: {
        paymentNo: 'desc',
      },
    });

    let sequence = 1;
    if (lastPayment) {
      const lastSequence = parseInt(lastPayment.paymentNo.split('-')[2]);
      if (!isNaN(lastSequence)) {
        sequence = lastSequence + 1;
      }
    }

    return `${prefix}-${sequence.toString().padStart(4, '0')}`;
  }

  /**
   * Receive payment from customer
   */
  async receivePayment(companyId: string, input: ReceivePaymentInput, userId?: string) {
    // Validate customer
    const customer = await prisma.contact.findFirst({
      where: {
        id: input.contactId,
        companyId,
        type: 'CUSTOMER',
        isActive: true,
      },
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    // Validate bank account
    const bankAccount = await prisma.bankAccount.findFirst({
      where: {
        id: input.bankAccountId,
        companyId,
        isActive: true,
      },
    });

    if (!bankAccount) {
      throw new Error('Bank account not found');
    }

    // Validate invoices
    const invoiceIds = input.allocations.map(a => a.invoiceId);
    const invoices = await prisma.invoice.findMany({
      where: {
        id: { in: invoiceIds },
        companyId,
        type: 'SALES',
        contactId: input.contactId,
      },
    });

    if (invoices.length !== invoiceIds.length) {
      throw new Error('Some invoices not found or do not belong to this customer');
    }

    // Validate allocations don't exceed invoice balances
    for (const allocation of input.allocations) {
      const invoice = invoices.find((inv: any) => inv.id === allocation.invoiceId)!;
      const balance = new Decimal(invoice.total).minus(new Decimal(invoice.paidAmount));
      
      if (new Decimal(allocation.amount).greaterThan(balance)) {
        throw new Error(`Allocation amount exceeds invoice ${invoice.invoiceNo} balance`);
      }
    }

    // Generate payment number
    const paymentNo = await this.generatePaymentNo(companyId, new Date(input.date));

    // Create payment with allocations
    const payment = await prisma.payment.create({
      data: {
        companyId,
        type: 'RECEIVE',
        paymentNo,
        contactId: input.contactId,
        bankAccountId: input.bankAccountId,
        date: new Date(input.date),
        amount: new Decimal(input.amount).toString(),
        paymentMethod: input.paymentMethod,
        referenceNo: input.referenceNo,
        description: input.description,
        status: 'COMPLETED',
        allocations: {
          create: input.allocations.map(alloc => ({
            invoiceId: alloc.invoiceId,
            amount: new Decimal(alloc.amount).toString(),
          })),
        },
      },
      include: {
        allocations: {
          include: {
            invoice: {
              select: {
                invoiceNo: true,
                total: true,
                paidAmount: true,
              },
            },
          },
        },
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
      },
    });

    // Update invoice paid amounts and statuses
    for (const allocation of input.allocations) {
      const invoice = invoices.find((inv: any) => inv.id === allocation.invoiceId)!;
      const newPaidAmount = new Decimal(invoice.paidAmount).plus(new Decimal(allocation.amount));
      const total = new Decimal(invoice.total);

      let newStatus = invoice.status;
      if (newPaidAmount.greaterThanOrEqualTo(total)) {
        newStatus = 'PAID';
      } else if (newPaidAmount.greaterThan(0)) {
        newStatus = 'PARTIAL_PAID';
      }

      await prisma.invoice.update({
        where: { id: allocation.invoiceId },
        data: {
          paidAmount: newPaidAmount.toString(),
          status: newStatus,
        },
      });
    }

    // Generate journal entry
    await this.generateJournal(companyId, payment.id, userId);

    return payment;
  }

  /**
   * Generate journal entry for payment
   * 
   * Dr. Kas/Bank
   * Cr. Piutang Usaha
   */
  async generateJournal(companyId: string, paymentId: string, userId?: string) {
    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        companyId,
        type: 'RECEIVE',
      },
      include: {
        bankAccount: {
          include: {
            account: true,
          },
        },
        allocations: {
          include: {
            invoice: true,
          },
        },
      },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.journalId) {
      throw new Error('Journal already generated for this payment');
    }

    // Get AR account
    const arAccount = await prisma.chartOfAccount.findFirst({
      where: { companyId, code: '1-1300', isActive: true }, // Piutang Usaha
    });

    if (!arAccount) {
      throw new Error('Accounts Receivable account not found');
    }

    // Prepare journal entries
    const entries = [];

    // Dr. Kas/Bank
    entries.push({
      accountId: payment.bankAccount.account.id,
      debit: payment.amount.toString(),
      credit: 0,
      description: `Penerimaan - ${payment.paymentNo}`,
    });

    // Cr. Piutang Usaha
    entries.push({
      accountId: arAccount.id,
      debit: 0,
      credit: payment.amount.toString(),
      description: `Pelunasan piutang - ${payment.paymentNo}`,
    });

    // Create journal
    const journal = await doubleEntryService.createJournal(
      companyId,
      {
        date: payment.date,
        description: `Receive Payment - ${payment.paymentNo}`,
        referenceNo: payment.paymentNo,
        entries,
      },
      {
        sourceType: 'RECEIVE_PAYMENT',
        sourceId: payment.id,
        createdById: userId,
      }
    );

    // Auto-post journal
    await doubleEntryService.postJournal({ journalId: journal.id }, userId);

    // Update payment with journal reference
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        journalId: journal.id,
      },
    });

    return journal;
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(companyId: string, paymentId: string) {
    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        companyId,
        type: 'RECEIVE',
      },
      include: {
        allocations: {
          include: {
            invoice: true,
          },
        },
        contact: true,
        bankAccount: true,
      },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    return payment;
  }
}

export const paymentService = new PaymentService();

