import { prisma } from '@/shared/database/prisma';
import { doubleEntryService } from '@/modules/general-ledger';
import { CreateSalesInvoiceInput, UpdateSalesInvoiceInput } from '../types';
import { Decimal } from 'decimal.js';
import { format } from 'date-fns';

/**
 * Sales Invoice Service
 * 
 * Mengelola sales invoice dengan auto-generate journal entries
 */
export class SalesInvoiceService {
  /**
   * Generate invoice number
   * Format: INV-YYYYMMDD-XXXX
   */
  private async generateInvoiceNo(companyId: string, date: Date): Promise<string> {
    const dateStr = format(date, 'yyyyMMdd');
    const prefix = `INV-${dateStr}`;

    const lastInvoice = await prisma.invoice.findFirst({
      where: {
        companyId,
        type: 'SALES',
        invoiceNo: {
          startsWith: prefix,
        },
      },
      orderBy: {
        invoiceNo: 'desc',
      },
    });

    let sequence = 1;
    if (lastInvoice) {
      const lastSequence = parseInt(lastInvoice.invoiceNo.split('-')[2]);
      if (!isNaN(lastSequence)) {
        sequence = lastSequence + 1;
      }
    }

    return `${prefix}-${sequence.toString().padStart(4, '0')}`;
  }

  /**
   * Calculate invoice totals
   */
  private calculateInvoiceTotals(items: any[]) {
    let subtotal = new Decimal(0);
    let totalTax = new Decimal(0);
    let totalDiscount = new Decimal(0);

    const calculatedItems = items.map(item => {
      const qty = new Decimal(item.quantity);
      const price = new Decimal(item.unitPrice);
      const itemSubtotal = qty.times(price);

      // Calculate discount
      const discountPercent = new Decimal(item.discountPercent || 0);
      const discountAmount = itemSubtotal.times(discountPercent).div(100);
      
      // Amount after discount
      const amountAfterDiscount = itemSubtotal.minus(discountAmount);

      // Calculate tax
      let taxAmount = new Decimal(0);
      if (item.taxRate) {
        const taxRate = new Decimal(item.taxRate);
        taxAmount = amountAfterDiscount.times(taxRate).div(100);
      }

      const itemTotal = amountAfterDiscount.plus(taxAmount);

      subtotal = subtotal.plus(itemSubtotal);
      totalDiscount = totalDiscount.plus(discountAmount);
      totalTax = totalTax.plus(taxAmount);

      return {
        ...item,
        subtotal: itemSubtotal.toString(),
        discountAmount: discountAmount.toString(),
        taxAmount: taxAmount.toString(),
        total: itemTotal.toString(),
      };
    });

    const grandTotal = subtotal.minus(totalDiscount).plus(totalTax);

    return {
      items: calculatedItems,
      subtotal: subtotal.toString(),
      totalDiscount: totalDiscount.toString(),
      totalTax: totalTax.toString(),
      grandTotal: grandTotal.toString(),
    };
  }

  /**
   * Create sales invoice
   */
  async createSalesInvoice(companyId: string, input: CreateSalesInvoiceInput) {
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

    // Get products and tax rates
    const productIds = input.items.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        companyId,
        isActive: true,
      },
      include: {
        taxRate: true,
      },
    });

    if (products.length !== productIds.length) {
      throw new Error('Some products not found');
    }

    // Prepare items with tax info
    const itemsWithTax = input.items.map(item => {
      const product = products.find((p: any) => p.id === item.productId)!;
      return {
        ...item,
        taxRate: item.taxRateId ? undefined : (product.taxable && product.taxRate ? product.taxRate.rate.toString() : '0'),
      };
    });

    // Calculate totals
    const calculated = this.calculateInvoiceTotals(itemsWithTax);

    // Generate invoice number
    const invoiceNo = await this.generateInvoiceNo(companyId, new Date(input.date));

    // Create invoice with items
    const invoice = await prisma.invoice.create({
      data: {
        companyId,
        type: 'SALES',
        invoiceNo,
        contactId: input.contactId,
        date: new Date(input.date),
        dueDate: new Date(input.dueDate),
        referenceNo: input.referenceNo,
        description: input.description,
        subtotal: calculated.subtotal,
        taxAmount: calculated.totalTax,
        discountAmount: calculated.totalDiscount,
        total: calculated.grandTotal,
        paidAmount: '0',
        status: 'DRAFT',
        notes: input.notes,
        terms: input.terms,
        items: {
          create: calculated.items.map(item => ({
            productId: item.productId,
            description: item.description,
            quantity: item.quantity.toString(),
            unitPrice: item.unitPrice.toString(),
            taxRateId: item.taxRateId,
            taxAmount: item.taxAmount,
            discountPercent: (item.discountPercent || 0).toString(),
            discountAmount: item.discountAmount,
            subtotal: item.subtotal,
            total: item.total,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                sku: true,
                name: true,
                unit: true,
              },
            },
            taxRate: {
              select: {
                name: true,
                rate: true,
              },
            },
          },
        },
        contact: {
          select: {
            code: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return invoice;
  }

  /**
   * Generate journal entry for sales invoice
   * 
   * Dr. Piutang Usaha
   * Cr. Penjualan
   * Cr. PPN Keluaran (if any tax)
   */
  async generateJournal(companyId: string, invoiceId: string, userId?: string) {
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        companyId,
        type: 'SALES',
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                incomeAccount: true,
              },
            },
          },
        },
      },
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (invoice.journalId) {
      throw new Error('Journal already generated for this invoice');
    }

    // Get default accounts
    const arAccount = await prisma.chartOfAccount.findFirst({
      where: { companyId, code: '1-1300', isActive: true }, // Piutang Usaha
    });

    const salesAccount = await prisma.chartOfAccount.findFirst({
      where: { companyId, code: '4-1000', isActive: true }, // Penjualan
    });

    const ppnOutputAccount = await prisma.chartOfAccount.findFirst({
      where: { companyId, code: '2-1200', isActive: true }, // PPN Keluaran
    });

    if (!arAccount || !salesAccount) {
      throw new Error('Required accounts not found. Please setup Chart of Accounts first.');
    }

    // Prepare journal entries
    const entries = [];

    // Dr. Piutang Usaha
    entries.push({
      accountId: arAccount.id,
      debit: invoice.total.toString(),
      credit: 0,
      description: `Piutang - ${invoice.invoiceNo}`,
    });

    // Cr. Penjualan
    const salesAmount = new Decimal(invoice.subtotal).minus(new Decimal(invoice.discountAmount));
    entries.push({
      accountId: salesAccount.id,
      debit: 0,
      credit: salesAmount.toString(),
      description: `Penjualan - ${invoice.invoiceNo}`,
    });

    // Cr. PPN Keluaran (if any)
    if (new Decimal(invoice.taxAmount).greaterThan(0) && ppnOutputAccount) {
      entries.push({
        accountId: ppnOutputAccount.id,
        debit: 0,
        credit: invoice.taxAmount.toString(),
        description: `PPN Keluaran - ${invoice.invoiceNo}`,
      });
    }

    // Create journal
    const journal = await doubleEntryService.createJournal(
      companyId,
      {
        date: invoice.date,
        description: `Sales Invoice - ${invoice.invoiceNo}`,
        referenceNo: invoice.invoiceNo,
        entries,
      },
      {
        sourceType: 'SALES_INVOICE',
        sourceId: invoice.id,
        createdById: userId,
      }
    );

    // Auto-post journal
    await doubleEntryService.postJournal({ journalId: journal.id }, userId);

    // Update invoice with journal reference
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        journalId: journal.id,
        status: 'SENT', // Change status to SENT after posting
      },
    });

    return journal;
  }

  /**
   * Update sales invoice
   */
  async updateSalesInvoice(companyId: string, input: UpdateSalesInvoiceInput) {
    const { id, ...data } = input;

    const invoice = await prisma.invoice.findFirst({
      where: {
        id,
        companyId,
        type: 'SALES',
      },
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (invoice.status === 'PAID') {
      throw new Error('Cannot update paid invoice');
    }

    if (invoice.journalId) {
      throw new Error('Cannot update invoice with posted journal. Void the journal first.');
    }

    const updated = await prisma.invoice.update({
      where: { id },
      data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        contact: true,
      },
    });

    return updated;
  }

  /**
   * Delete sales invoice
   */
  async deleteSalesInvoice(companyId: string, invoiceId: string) {
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        companyId,
        type: 'SALES',
      },
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (invoice.status === 'PAID' || invoice.status === 'PARTIAL_PAID') {
      throw new Error('Cannot delete invoice with payments');
    }

    if (invoice.journalId) {
      throw new Error('Cannot delete invoice with posted journal. Void the journal first.');
    }

    // Delete invoice (will cascade delete items)
    await prisma.invoice.delete({
      where: { id: invoiceId },
    });

    return { success: true };
  }

  /**
   * Get invoice by ID
   */
  async getInvoiceById(companyId: string, invoiceId: string) {
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        companyId,
        type: 'SALES',
      },
      include: {
        items: {
          include: {
            product: true,
            taxRate: true,
          },
        },
        contact: true,
        payments: {
          include: {
            payment: {
              include: {
                bankAccount: true,
              },
            },
          },
        },
      },
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    return invoice;
  }
}

export const salesInvoiceService = new SalesInvoiceService();

