import { prisma } from '@/shared/database/prisma';
import { doubleEntryService } from '@/modules/general-ledger';
import { CreateStockAdjustmentInput, CreateStockTransferInput, GetStockCardInput } from '../types';
import { Decimal } from 'decimal.js';

/**
 * Stock Movement Service
 * 
 * Mengelola pergerakan stok barang (masuk, keluar, adjustment, transfer)
 */
export class StockMovementService {
  /**
   * Create stock adjustment (increase or decrease)
   */
  async createAdjustment(companyId: string, input: CreateStockAdjustmentInput, userId?: string) {
    const product = await prisma.product.findFirst({
      where: {
        id: input.productId,
        companyId,
        isActive: true,
        trackInventory: true,
      },
      include: {
        assetAccount: true,
      },
    });

    if (!product) {
      throw new Error('Product not found or inventory not tracked');
    }

    const warehouseId = input.warehouseId || 'default';

    // Get or create inventory item
    let inventoryItem = await prisma.inventoryItem.findFirst({
      where: {
        companyId,
        productId: input.productId,
        warehouseId,
      },
    });

    if (!inventoryItem) {
      inventoryItem = await prisma.inventoryItem.create({
        data: {
          companyId,
          productId: input.productId,
          warehouseId,
          quantity: '0',
          value: '0',
          averageCost: '0',
        },
      });
    }

    const currentQty = new Decimal(inventoryItem.quantity);
    const adjustQty = new Decimal(input.quantity);
    const newQty = currentQty.plus(adjustQty);

    if (newQty.lessThan(0)) {
      throw new Error('Adjustment would result in negative stock');
    }

    // Calculate cost (use average cost for adjustment)
    const avgCost = new Decimal(inventoryItem.averageCost);
    const totalCost = adjustQty.abs().times(avgCost);

    // Create stock movement
    const movement = await prisma.stockMovement.create({
      data: {
        companyId,
        productId: input.productId,
        warehouseId,
        movementType: 'ADJUSTMENT',
        quantity: adjustQty.toString(),
        unitCost: avgCost.toString(),
        totalCost: totalCost.toString(),
        date: new Date(),
        referenceNo: input.reason,
        referenceType: 'ADJUSTMENT',
        notes: input.notes,
      },
    });

    // Update inventory item
    const currentValue = new Decimal(inventoryItem.value);
    const newValue = adjustQty.greaterThan(0) 
      ? currentValue.plus(totalCost) 
      : currentValue.minus(totalCost);

    await prisma.inventoryItem.update({
      where: { id: inventoryItem.id },
      data: {
        quantity: newQty.toString(),
        value: newValue.toString(),
        averageCost: newQty.greaterThan(0) ? newValue.div(newQty).toString() : '0',
      },
    });

    // Generate journal if adjustment decreases stock (loss/damage)
    if (adjustQty.lessThan(0) && product.assetAccount) {
      await this.generateAdjustmentJournal(
        companyId,
        movement.id,
        totalCost,
        product.assetAccount.id,
        input.reason,
        userId
      );
    }

    return movement;
  }

  /**
   * Create stock transfer between warehouses
   */
  async createTransfer(companyId: string, input: CreateStockTransferInput, userId?: string) {
    const product = await prisma.product.findFirst({
      where: {
        id: input.productId,
        companyId,
        isActive: true,
        trackInventory: true,
      },
    });

    if (!product) {
      throw new Error('Product not found or inventory not tracked');
    }

    // Check source warehouse has enough stock
    const sourceInventory = await prisma.inventoryItem.findFirst({
      where: {
        companyId,
        productId: input.productId,
        warehouseId: input.fromWarehouseId,
      },
    });

    if (!sourceInventory || new Decimal(sourceInventory.quantity).lessThan(input.quantity)) {
      throw new Error('Insufficient stock in source warehouse');
    }

    const transferQty = new Decimal(input.quantity);
    const avgCost = new Decimal(sourceInventory.averageCost);
    const transferValue = transferQty.times(avgCost);

    // Create OUT movement from source
    await prisma.stockMovement.create({
      data: {
        companyId,
        productId: input.productId,
        warehouseId: input.fromWarehouseId,
        movementType: 'TRANSFER',
        quantity: transferQty.neg().toString(),
        unitCost: avgCost.toString(),
        totalCost: transferValue.toString(),
        date: new Date(),
        referenceType: 'TRANSFER_OUT',
        notes: `Transfer to ${input.toWarehouseId}: ${input.notes || ''}`,
      },
    });

    // Create IN movement to destination
    await prisma.stockMovement.create({
      data: {
        companyId,
        productId: input.productId,
        warehouseId: input.toWarehouseId,
        movementType: 'TRANSFER',
        quantity: transferQty.toString(),
        unitCost: avgCost.toString(),
        totalCost: transferValue.toString(),
        date: new Date(),
        referenceType: 'TRANSFER_IN',
        notes: `Transfer from ${input.fromWarehouseId}: ${input.notes || ''}`,
      },
    });

    // Update source inventory
    const sourceNewQty = new Decimal(sourceInventory.quantity).minus(transferQty);
    const sourceNewValue = new Decimal(sourceInventory.value).minus(transferValue);

    await prisma.inventoryItem.update({
      where: { id: sourceInventory.id },
      data: {
        quantity: sourceNewQty.toString(),
        value: sourceNewValue.toString(),
      },
    });

    // Update or create destination inventory
    let destInventory = await prisma.inventoryItem.findFirst({
      where: {
        companyId,
        productId: input.productId,
        warehouseId: input.toWarehouseId,
      },
    });

    if (!destInventory) {
      destInventory = await prisma.inventoryItem.create({
        data: {
          companyId,
          productId: input.productId,
          warehouseId: input.toWarehouseId,
          quantity: transferQty.toString(),
          value: transferValue.toString(),
          averageCost: avgCost.toString(),
        },
      });
    } else {
      const destNewQty = new Decimal(destInventory.quantity).plus(transferQty);
      const destNewValue = new Decimal(destInventory.value).plus(transferValue);

      await prisma.inventoryItem.update({
        where: { id: destInventory.id },
        data: {
          quantity: destNewQty.toString(),
          value: destNewValue.toString(),
          averageCost: destNewQty.greaterThan(0) ? destNewValue.div(destNewQty).toString() : '0',
        },
      });
    }

    return { success: true, message: 'Stock transferred successfully' };
  }

  /**
   * Get stock card (movement history)
   */
  async getStockCard(companyId: string, input: GetStockCardInput) {
    const product = await prisma.product.findFirst({
      where: {
        id: input.productId,
        companyId,
      },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    const warehouseId = input.warehouseId || 'default';

    const where: any = {
      companyId,
      productId: input.productId,
      warehouseId,
    };

    if (input.startDate || input.endDate) {
      where.date = {};
      if (input.startDate) {
        where.date.gte = new Date(input.startDate);
      }
      if (input.endDate) {
        where.date.lte = new Date(input.endDate);
      }
    }

    const movements = await prisma.stockMovement.findMany({
      where,
      orderBy: {
        date: 'asc',
      },
    });

    // Calculate running balance
    let runningBalance = new Decimal(0);
    const movementDetails = movements.map((m: any) => {
      runningBalance = runningBalance.plus(new Decimal(m.quantity));

      return {
        date: m.date,
        movementType: m.movementType,
        referenceNo: m.referenceNo,
        referenceType: m.referenceType,
        quantity: new Decimal(m.quantity),
        unitCost: new Decimal(m.unitCost),
        totalCost: new Decimal(m.totalCost),
        balance: runningBalance,
        notes: m.notes,
      };
    });

    // Get current inventory
    const inventory = await prisma.inventoryItem.findFirst({
      where: {
        companyId,
        productId: input.productId,
        warehouseId,
      },
    });

    return {
      product,
      movements: movementDetails,
      currentStock: inventory ? new Decimal(inventory.quantity) : new Decimal(0),
      currentValue: inventory ? new Decimal(inventory.value) : new Decimal(0),
      averageCost: inventory ? new Decimal(inventory.averageCost) : new Decimal(0),
    };
  }

  /**
   * Generate journal for stock adjustment (if decrease/loss)
   * 
   * Dr. Biaya Kerusakan/Kehilangan Stok
   * Cr. Persediaan
   */
  private async generateAdjustmentJournal(
    companyId: string,
    movementId: string,
    amount: Decimal,
    inventoryAccountId: string,
    reason: string,
    userId?: string
  ) {
    // Get expense account for stock loss
    const lossAccount = await prisma.chartOfAccount.findFirst({
      where: { companyId, code: '6-5000', isActive: true }, // Biaya Lain-lain
    });

    if (!lossAccount) {
      return; // Skip journal if account not found
    }

    const entries = [
      {
        accountId: lossAccount.id,
        debit: amount.toString(),
        credit: 0,
        description: `Penyesuaian stok - ${reason}`,
      },
      {
        accountId: inventoryAccountId,
        debit: 0,
        credit: amount.toString(),
        description: `Pengurangan persediaan - ${reason}`,
      },
    ];

    const journal = await doubleEntryService.createJournal(
      companyId,
      {
        date: new Date(),
        description: `Stock Adjustment - ${reason}`,
        entries,
      },
      {
        sourceType: 'STOCK_ADJUSTMENT',
        sourceId: movementId,
        createdById: userId,
      }
    );

    await doubleEntryService.postJournal({ journalId: journal.id }, userId);

    return journal;
  }
}

export const stockMovementService = new StockMovementService();

