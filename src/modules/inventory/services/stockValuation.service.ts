import { prisma } from '@/shared/database/prisma';
import { StockValuationInput } from '../types';
import { Decimal } from 'decimal.js';

/**
 * Stock Valuation Service
 * 
 * Calculate inventory value using FIFO or Average method
 */
export class StockValuationService {
  /**
   * Get stock valuation report
   */
  async getStockValuation(companyId: string, input: StockValuationInput) {
    const where: any = {
      companyId,
    };

    if (input.productId) {
      where.productId = input.productId;
    }

    if (input.warehouseId) {
      where.warehouseId = input.warehouseId;
    }

    const inventoryItems = await prisma.inventoryItem.findMany({
      where,
      include: {
        product: {
          select: {
            sku: true,
            name: true,
            unit: true,
            stockMethod: true,
          },
        },
      },
      orderBy: {
        product: {
          name: 'asc',
        },
      },
    });

    let totalValue = new Decimal(0);
    const valuations = inventoryItems.map((item: any) => {
      const qty = new Decimal(item.quantity);
      const value = new Decimal(item.value);
      const avgCost = new Decimal(item.averageCost);

      totalValue = totalValue.plus(value);

      return {
        productId: item.productId,
        productSku: item.product.sku,
        productName: item.product.name,
        unit: item.product.unit,
        warehouseId: item.warehouseId,
        quantity: qty,
        averageCost: avgCost,
        totalValue: value,
        stockMethod: item.product.stockMethod,
      };
    });

    return {
      items: valuations,
      totalValue,
      asOfDate: input.asOfDate || new Date(),
    };
  }

  /**
   * Get products with low stock (below minimum)
   */
  async getLowStockProducts(companyId: string) {
    const products = await prisma.product.findMany({
      where: {
        companyId,
        isActive: true,
        trackInventory: true,
        minStock: {
          gt: '0',
        },
      },
      include: {
        inventoryItems: true,
      },
    });

    const lowStockProducts = products
      .map((product: any) => {
        const totalQty = product.inventoryItems.reduce(
          (sum: Decimal, item: any) => sum.plus(new Decimal(item.quantity)),
          new Decimal(0)
        );

        const minStock = new Decimal(product.minStock);

        if (totalQty.lessThan(minStock)) {
          return {
            productId: product.id,
            sku: product.sku,
            name: product.name,
            currentStock: totalQty,
            minStock: minStock,
            difference: minStock.minus(totalQty),
          };
        }

        return null;
      })
      .filter(Boolean);

    return lowStockProducts;
  }

  /**
   * Calculate inventory turnover ratio
   */
  async getInventoryTurnover(companyId: string, startDate: Date, endDate: Date) {
    // Get COGS for period
    const cogsAccount = await prisma.chartOfAccount.findFirst({
      where: { companyId, code: '5-1000' },
    });

    if (!cogsAccount) {
      throw new Error('COGS account not found');
    }

    const cogsEntries = await prisma.journalEntry.findMany({
      where: {
        accountId: cogsAccount.id,
        journal: {
          companyId,
          status: 'POSTED',
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      },
    });

    const totalCOGS = cogsEntries.reduce((sum: Decimal, entry: any) => {
      return sum.plus(new Decimal(entry.debit)).minus(new Decimal(entry.credit));
    }, new Decimal(0));

    // Get average inventory (beginning + ending) / 2
    const inventoryItems = await prisma.inventoryItem.findMany({
      where: { companyId },
    });

    const totalInventoryValue = inventoryItems.reduce((sum: Decimal, item: any) => {
      return sum.plus(new Decimal(item.value));
    }, new Decimal(0));

    // Calculate turnover ratio
    const turnoverRatio = totalInventoryValue.greaterThan(0)
      ? totalCOGS.div(totalInventoryValue)
      : new Decimal(0);

    return {
      totalCOGS,
      averageInventory: totalInventoryValue,
      turnoverRatio,
      daysInInventory: turnoverRatio.greaterThan(0) ? new Decimal(365).div(turnoverRatio) : new Decimal(0),
    };
  }
}

export const stockValuationService = new StockValuationService();

