import { prisma } from '@/shared/database/prisma';
import { doubleEntryService } from '@/modules/general-ledger';
import { MakePaymentInput } from '../types';
import { Decimal } from 'decimal.js';
import { format } from 'date-fns';

/**
 * Purchase Payment Service (Make Payment to Vendors)
 * 
 * Auto-generate journal entries for payments
 */
export class PurchasePaymentService {
  /**
   * Generate payment number
   * Format: PAYV-YYYYMMDD-XXXX
   */
  private async generatePaymentNo(companyId: string, date: Date): Promise<string> {
    const dateStr = format(date, 'yyyyMMdd');
    const prefix = `PAYV-${dateStr}`;

    const lastPayment = await prisma.payment.findFirst({
      where: {
        companyId,
        type: 'PAY',
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
   * Make payment to vendor
   */
  async makePayment(companyId: string, input: MakePaymentInput, userId?: string) {
    // Validate vendor
    const vendor = await prisma.contact.findFirst({
      where: {
        id: input.contactId,
        companyId,
        type: 'VENDOR',
        isActive: true,
      },
    });

    if (!vendor) {
      throw new Error('Vendor not found');
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

    // Validate bills
    const billIds = input.allocations.map(a => a.invoiceId);
    const bills = await prisma.invoice.findMany({
      where: {
        id: { in: billIds },
        companyId,
        type: 'PURCHASE',
        contactId: input.contactId,
      },
    });

    if (bills.length !== billIds.length) {
      throw new Error('Some bills not found or do not belong to this vendor');
    }

    // Validate allocations don't exceed bill balances
    for (const allocation of input.allocations) {
      const bill = bills.find(b => b.id === allocation.invoiceId)!;
      const balance = new Decimal(bill.total).minus(new Decimal(bill.paidAmount));
      
      if (new Decimal(allocation.amount).greaterThan(balance)) {
        throw new Error(`Allocation amount exceeds bill ${bill.invoiceNo} balance`);
      }
    }

    // Generate payment number
    const paymentNo = await this.generatePaymentNo(companyId, new Date(input.date));

    // Create payment with allocations
    const payment = await prisma.payment.create({
      data: {
        companyId,
        type: 'PAY',
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

    // Update bill paid amounts and statuses
    for (const allocation of input.allocations) {
      const bill = bills.find(b => b.id === allocation.invoiceId)!;
      const newPaidAmount = new Decimal(bill.paidAmount).plus(new Decimal(allocation.amount));
      const total = new Decimal(bill.total);

      let newStatus = bill.status;
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
   * Dr. Utang Usaha
   * Cr. Kas/Bank
   */
  async generateJournal(companyId: string, paymentId: string, userId?: string) {
    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        companyId,
        type: 'PAY',
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

    // Get AP account
    const apAccount = await prisma.chartOfAccount.findFirst({
      where: { companyId, code: '2-1100', isActive: true }, // Utang Usaha
    });

    if (!apAccount) {
      throw new Error('Accounts Payable account not found');
    }

    // Prepare journal entries
    const entries = [];

    // Dr. Utang Usaha
    entries.push({
      accountId: apAccount.id,
      debit: payment.amount.toString(),
      credit: 0,
      description: `Pembayaran utang - ${payment.paymentNo}`,
    });

    // Cr. Kas/Bank
    entries.push({
      accountId: payment.bankAccount.account.id,
      debit: 0,
      credit: payment.amount.toString(),
      description: `Pembayaran - ${payment.paymentNo}`,
    });

    // Create journal
    const journal = await doubleEntryService.createJournal(
      companyId,
      {
        date: payment.date,
        description: `Make Payment - ${payment.paymentNo}`,
        referenceNo: payment.paymentNo,
        entries,
      },
      {
        sourceType: 'MAKE_PAYMENT',
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
        type: 'PAY',
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

export const purchasePaymentService = new PurchasePaymentService();

