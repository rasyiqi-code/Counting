import { prisma } from '@/shared/database/prisma';
import { doubleEntryService } from '@/modules/general-ledger';
import { CreatePurchaseBillInput, UpdatePurchaseBillInput } from '../types';
import { Decimal } from 'decimal.js';
import { format } from 'date-fns';

/**
 * Purchase Bill Service
 * 
 * Mengelola purchase bills dengan auto-generate journal entries
 */
export class PurchaseBillService {
  /**
   * Generate bill number
   * Format: BILL-YYYYMMDD-XXXX
   */
  private async generateBillNo(companyId: string, date: Date): Promise<string> {
    const dateStr = format(date, 'yyyyMMdd');
    const prefix = `BILL-${dateStr}`;

    const lastBill = await prisma.invoice.findFirst({
      where: {
        companyId,
        type: 'PURCHASE',
        invoiceNo: {
          startsWith: prefix,
        },
      },
      orderBy: {
        invoiceNo: 'desc',
      },
    });

    let sequence = 1;
    if (lastBill) {
      const lastSequence = parseInt(lastBill.invoiceNo.split('-')[2]);
      if (!isNaN(lastSequence)) {
        sequence = lastSequence + 1;
      }
    }

    return `${prefix}-${sequence.toString().padStart(4, '0')}`;
  }

  /**
   * Calculate bill totals
   */
  private calculateBillTotals(items: any[]) {
    let subtotal = new Decimal(0);
    let totalTax = new Decimal(0);
    let totalDiscount = new Decimal(0);

    const calculatedItems = items.map(item => {
      const qty = new Decimal(item.quantity);
      const price = new Decimal(item.unitPrice);
      const itemSubtotal = qty.times(price);

      const discountPercent = new Decimal(item.discountPercent || 0);
      const discountAmount = itemSubtotal.times(discountPercent).div(100);
      const amountAfterDiscount = itemSubtotal.minus(discountAmount);

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
   * Create purchase bill
   */
  async createPurchaseBill(companyId: string, input: CreatePurchaseBillInput) {
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
    const calculated = this.calculateBillTotals(itemsWithTax);

    // Generate bill number
    const billNo = await this.generateBillNo(companyId, new Date(input.date));

    // Create bill with items
    const bill = await prisma.invoice.create({
      data: {
        companyId,
        type: 'PURCHASE',
        invoiceNo: billNo,
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

    return bill;
  }

  /**
   * Generate journal entry for purchase bill
   * 
   * Dr. Persediaan/Biaya
   * Dr. PPN Masukan (if any)
   * Cr. Utang Usaha
   */
  async generateJournal(companyId: string, billId: string, userId?: string) {
    const bill = await prisma.invoice.findFirst({
      where: {
        id: billId,
        companyId,
        type: 'PURCHASE',
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                expenseAccount: true,
                assetAccount: true,
              },
            },
          },
        },
      },
    });

    if (!bill) {
      throw new Error('Bill not found');
    }

    if (bill.journalId) {
      throw new Error('Journal already generated for this bill');
    }

    // Get default accounts
    const apAccount = await prisma.chartOfAccount.findFirst({
      where: { companyId, code: '2-1100', isActive: true }, // Utang Usaha
    });

    const cogsAccount = await prisma.chartOfAccount.findFirst({
      where: { companyId, code: '5-1000', isActive: true }, // HPP
    });

    const ppnInputAccount = await prisma.chartOfAccount.findFirst({
      where: { companyId, code: '1-1500', isActive: true }, // PPN Masukan
    });

    if (!apAccount || !cogsAccount) {
      throw new Error('Required accounts not found. Please setup Chart of Accounts first.');
    }

    // Prepare journal entries
    const entries = [];

    // Dr. Persediaan/HPP/Biaya
    const purchaseAmount = new Decimal(bill.subtotal).minus(new Decimal(bill.discountAmount));
    entries.push({
      accountId: cogsAccount.id,
      debit: purchaseAmount.toString(),
      credit: 0,
      description: `Pembelian - ${bill.invoiceNo}`,
    });

    // Dr. PPN Masukan (if any)
    if (new Decimal(bill.taxAmount).greaterThan(0) && ppnInputAccount) {
      entries.push({
        accountId: ppnInputAccount.id,
        debit: bill.taxAmount.toString(),
        credit: 0,
        description: `PPN Masukan - ${bill.invoiceNo}`,
      });
    }

    // Cr. Utang Usaha
    entries.push({
      accountId: apAccount.id,
      debit: 0,
      credit: bill.total.toString(),
      description: `Utang - ${bill.invoiceNo}`,
    });

    // Create journal
    const journal = await doubleEntryService.createJournal(
      companyId,
      {
        date: bill.date,
        description: `Purchase Bill - ${bill.invoiceNo}`,
        referenceNo: bill.invoiceNo,
        entries,
      },
      {
        sourceType: 'PURCHASE_BILL',
        sourceId: bill.id,
        createdById: userId,
      }
    );

    // Auto-post journal
    await doubleEntryService.postJournal({ journalId: journal.id }, userId);

    // Update bill with journal reference
    await prisma.invoice.update({
      where: { id: billId },
      data: {
        journalId: journal.id,
        status: 'SENT',
      },
    });

    return journal;
  }

  /**
   * Update purchase bill
   */
  async updatePurchaseBill(companyId: string, input: UpdatePurchaseBillInput) {
    const { id, ...data } = input;

    const bill = await prisma.invoice.findFirst({
      where: {
        id,
        companyId,
        type: 'PURCHASE',
      },
    });

    if (!bill) {
      throw new Error('Bill not found');
    }

    if (bill.status === 'PAID') {
      throw new Error('Cannot update paid bill');
    }

    if (bill.journalId) {
      throw new Error('Cannot update bill with posted journal. Void the journal first.');
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
   * Delete purchase bill
   */
  async deletePurchaseBill(companyId: string, billId: string) {
    const bill = await prisma.invoice.findFirst({
      where: {
        id: billId,
        companyId,
        type: 'PURCHASE',
      },
    });

    if (!bill) {
      throw new Error('Bill not found');
    }

    if (bill.status === 'PAID' || bill.status === 'PARTIAL_PAID') {
      throw new Error('Cannot delete bill with payments');
    }

    if (bill.journalId) {
      throw new Error('Cannot delete bill with posted journal. Void the journal first.');
    }

    await prisma.invoice.delete({
      where: { id: billId },
    });

    return { success: true };
  }

  /**
   * Get bill by ID
   */
  async getBillById(companyId: string, billId: string) {
    const bill = await prisma.invoice.findFirst({
      where: {
        id: billId,
        companyId,
        type: 'PURCHASE',
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

    if (!bill) {
      throw new Error('Bill not found');
    }

    return bill;
  }
}

export const purchaseBillService = new PurchaseBillService();

