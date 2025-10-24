import { prisma } from '@/shared/database/prisma';
import { doubleEntryService } from '@/modules/general-ledger';
import {
  CreateFixedAssetInput,
  UpdateFixedAssetInput,
  CalculateDepreciationInput,
  DisposalAssetInput,
} from '../types';
import { Decimal } from 'decimal.js';
import { format, startOfMonth } from 'date-fns';

/**
 * Fixed Asset Service
 * 
 * Mengelola aset tetap dengan penyusutan otomatis
 */
export class FixedAssetService {
  /**
   * Generate asset number
   * Format: FA-YYYY-XXXX
   */
  private async generateAssetNo(companyId: string): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `FA-${year}`;

    const lastAsset = await prisma.fixedAsset.findFirst({
      where: {
        companyId,
        assetNo: {
          startsWith: prefix,
        },
      },
      orderBy: {
        assetNo: 'desc',
      },
    });

    let sequence = 1;
    if (lastAsset) {
      const lastSequence = parseInt(lastAsset.assetNo.split('-')[2]);
      if (!isNaN(lastSequence)) {
        sequence = lastSequence + 1;
      }
    }

    return `${prefix}-${sequence.toString().padStart(4, '0')}`;
  }

  /**
   * Create fixed asset
   */
  async createAsset(companyId: string, input: CreateFixedAssetInput) {
    const assetNo = await this.generateAssetNo(companyId);

    // Calculate initial book value
    const purchasePrice = new Decimal(input.purchasePrice);
    const residualValue = new Decimal(input.residualValue || 0);

    const asset = await prisma.fixedAsset.create({
      data: {
        companyId,
        assetNo,
        name: input.name,
        description: input.description,
        category: input.category,
        purchaseDate: new Date(input.purchaseDate),
        purchasePrice: purchasePrice.toString(),
        residualValue: residualValue.toString(),
        usefulLife: input.usefulLife,
        depreciationMethod: input.depreciationMethod,
        assetAccountId: input.assetAccountId,
        depreciationExpenseAccountId: input.depreciationExpenseAccountId,
        accumulatedDepreciationAccountId: input.accumulatedDepreciationAccountId,
        accumulatedDepreciation: '0',
        bookValue: purchasePrice.toString(),
        status: 'ACTIVE',
      },
      include: {
        assetAccount: true,
        depreciationExpenseAccount: true,
        accumulatedDepreciationAccount: true,
      },
    });

    return asset;
  }

  /**
   * Calculate and record monthly depreciation
   */
  async calculateDepreciation(companyId: string, input: CalculateDepreciationInput, userId?: string) {
    const asset = await prisma.fixedAsset.findFirst({
      where: {
        id: input.assetId,
        companyId,
        status: 'ACTIVE',
      },
    });

    if (!asset) {
      throw new Error('Asset not found or already disposed');
    }

    const period = startOfMonth(new Date(input.period));

    // Check if depreciation already recorded for this period
    const existing = await prisma.depreciation.findFirst({
      where: {
        assetId: input.assetId,
        period,
      },
    });

    if (existing) {
      throw new Error('Depreciation already recorded for this period');
    }

    // Calculate depreciation amount
    const depreciationAmount = this.calculateDepreciationAmount(
      new Decimal(asset.purchasePrice),
      new Decimal(asset.residualValue),
      asset.usefulLife,
      asset.depreciationMethod as 'STRAIGHT_LINE' | 'DECLINING_BALANCE',
      new Decimal(asset.accumulatedDepreciation)
    );

    // Create depreciation record
    const depreciation = await prisma.depreciation.create({
      data: {
        assetId: input.assetId,
        period,
        amount: depreciationAmount.toString(),
      },
    });

    // Generate journal
    // Dr. Biaya Penyusutan
    // Cr. Akumulasi Penyusutan
    const journal = await doubleEntryService.createJournal(
      companyId,
      {
        date: period,
        description: `Penyusutan ${asset.name} - ${format(period, 'MMMM yyyy')}`,
        entries: [
          {
            accountId: asset.depreciationExpenseAccountId,
            debit: depreciationAmount.toString(),
            credit: 0,
            description: `Biaya penyusutan - ${asset.assetNo}`,
          },
          {
            accountId: asset.accumulatedDepreciationAccountId,
            debit: 0,
            credit: depreciationAmount.toString(),
            description: `Akumulasi penyusutan - ${asset.assetNo}`,
          },
        ],
      },
      {
        sourceType: 'DEPRECIATION',
        sourceId: depreciation.id,
        createdById: userId,
      }
    );

    // Auto-post
    await doubleEntryService.postJournal({ journalId: journal.id }, userId);

    // Update depreciation with journal reference
    await prisma.depreciation.update({
      where: { id: depreciation.id },
      data: {
        journalId: journal.id,
      },
    });

    // Update asset
    const newAccumulated = new Decimal(asset.accumulatedDepreciation).plus(depreciationAmount);
    const newBookValue = new Decimal(asset.purchasePrice).minus(newAccumulated);

    await prisma.fixedAsset.update({
      where: { id: input.assetId },
      data: {
        accumulatedDepreciation: newAccumulated.toString(),
        bookValue: newBookValue.toString(),
      },
    });

    return depreciation;
  }

  /**
   * Calculate depreciation amount
   */
  private calculateDepreciationAmount(
    purchasePrice: Decimal,
    residualValue: Decimal,
    usefulLife: number,
    method: 'STRAIGHT_LINE' | 'DECLINING_BALANCE',
    accumulatedDepreciation: Decimal
  ): Decimal {
    const depreciableAmount = purchasePrice.minus(residualValue);

    if (method === 'STRAIGHT_LINE') {
      // Straight line: (Purchase Price - Residual Value) / Useful Life
      return depreciableAmount.div(usefulLife);
    } else {
      // Declining Balance (200% / Double Declining)
      const rate = new Decimal(2).div(usefulLife);
      const bookValue = purchasePrice.minus(accumulatedDepreciation);
      let depreciation = bookValue.times(rate);

      // Ensure we don't go below residual value
      const maxDepreciation = bookValue.minus(residualValue);
      if (depreciation.greaterThan(maxDepreciation)) {
        depreciation = maxDepreciation;
      }

      return depreciation.greaterThan(0) ? depreciation : new Decimal(0);
    }
  }

  /**
   * Dispose asset (sell or discard)
   */
  async disposeAsset(companyId: string, input: DisposalAssetInput, userId?: string) {
    const asset = await prisma.fixedAsset.findFirst({
      where: {
        id: input.assetId,
        companyId,
      },
    });

    if (!asset) {
      throw new Error('Asset not found');
    }

    if (asset.status !== 'ACTIVE') {
      throw new Error('Asset already disposed');
    }

    const disposalAmount = new Decimal(input.disposalAmount);
    const bookValue = new Decimal(asset.bookValue);
    const accumulatedDepreciation = new Decimal(asset.accumulatedDepreciation);
    const purchasePrice = new Decimal(asset.purchasePrice);

    // Calculate gain or loss
    const gainLoss = disposalAmount.minus(bookValue);

    // Update asset status
    await prisma.fixedAsset.update({
      where: { id: input.assetId },
      data: {
        status: 'DISPOSED',
        disposalDate: new Date(input.disposalDate),
        disposalAmount: disposalAmount.toString(),
      },
    });

    // Generate journal for disposal
    // If sold:
    // Dr. Kas/Bank (disposal amount)
    // Dr. Akumulasi Penyusutan
    // Cr. Aset
    // Dr/Cr. Laba/Rugi Pelepasan Aset
    
    const cashAccount = await prisma.chartOfAccount.findFirst({
      where: { companyId, code: '1-1100' }, // Kas
    });

    const gainLossAccount = await prisma.chartOfAccount.findFirst({
      where: { companyId, code: '4-2000' }, // Pendapatan Lain-lain or Biaya Lain
    });

    if (!cashAccount || !gainLossAccount) {
      throw new Error('Required accounts not found');
    }

    const entries = [];

    // Dr. Kas (if sold)
    if (disposalAmount.greaterThan(0)) {
      entries.push({
        accountId: cashAccount.id,
        debit: disposalAmount.toString(),
        credit: 0,
        description: `Penjualan aset - ${asset.assetNo}`,
      });
    }

    // Dr. Akumulasi Penyusutan
    entries.push({
      accountId: asset.accumulatedDepreciationAccountId,
      debit: accumulatedDepreciation.toString(),
      credit: 0,
      description: `Penghapusan akumulasi - ${asset.assetNo}`,
    });

    // Cr. Aset
    entries.push({
      accountId: asset.assetAccountId,
      debit: 0,
      credit: purchasePrice.toString(),
      description: `Pelepasan aset - ${asset.assetNo}`,
    });

    // Dr/Cr Laba/Rugi
    if (gainLoss.greaterThan(0)) {
      // Gain
      entries.push({
        accountId: gainLossAccount.id,
        debit: 0,
        credit: gainLoss.toString(),
        description: `Laba pelepasan aset - ${asset.assetNo}`,
      });
    } else if (gainLoss.lessThan(0)) {
      // Loss
      entries.push({
        accountId: gainLossAccount.id,
        debit: gainLoss.abs().toString(),
        credit: 0,
        description: `Rugi pelepasan aset - ${asset.assetNo}`,
      });
    }

    const journal = await doubleEntryService.createJournal(
      companyId,
      {
        date: new Date(input.disposalDate),
        description: `Asset Disposal - ${asset.assetNo}`,
        entries,
      },
      {
        sourceType: 'ASSET_DISPOSAL',
        sourceId: asset.id,
        createdById: userId,
      }
    );

    await doubleEntryService.postJournal({ journalId: journal.id }, userId);

    return {
      asset,
      journal,
      gainLoss,
    };
  }

  /**
   * Get asset by ID
   */
  async getAssetById(companyId: string, assetId: string) {
    const asset = await prisma.fixedAsset.findFirst({
      where: {
        id: assetId,
        companyId,
      },
      include: {
        assetAccount: true,
        depreciationExpenseAccount: true,
        accumulatedDepreciationAccount: true,
        depreciations: {
          orderBy: {
            period: 'desc',
          },
        },
      },
    });

    if (!asset) {
      throw new Error('Asset not found');
    }

    return asset;
  }

  /**
   * Update asset
   */
  async updateAsset(companyId: string, input: UpdateFixedAssetInput) {
    const { id, ...data } = input;

    const asset = await prisma.fixedAsset.findFirst({
      where: {
        id,
        companyId,
      },
    });

    if (!asset) {
      throw new Error('Asset not found');
    }

    const updated = await prisma.fixedAsset.update({
      where: { id },
      data,
    });

    return updated;
  }

  /**
   * Delete asset
   */
  async deleteAsset(companyId: string, assetId: string) {
    const asset = await prisma.fixedAsset.findFirst({
      where: {
        id: assetId,
        companyId,
      },
      include: {
        depreciations: {
          take: 1,
        },
      },
    });

    if (!asset) {
      throw new Error('Asset not found');
    }

    if (asset.depreciations.length > 0) {
      throw new Error('Cannot delete asset with depreciation records');
    }

    if (asset.status === 'DISPOSED') {
      throw new Error('Cannot delete disposed asset');
    }

    await prisma.fixedAsset.delete({
      where: { id: assetId },
    });

    return { success: true };
  }
}

export const fixedAssetService = new FixedAssetService();

