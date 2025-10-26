import { prisma } from '@/shared/database/prisma';
import { AIDatabaseContext } from './database-context';
import { AIBusinessLogic } from './business-logic';

export interface SystemOperation {
  id: string;
  name: string;
  description: string;
  module: string;
  operation: (data: any, context: any) => Promise<any>;
  validation?: (data: any) => boolean;
}

export class AISystemOperations {
  private static operations: Map<string, SystemOperation> = new Map();

  static initializeOperations() {
    // COA Operations
    this.operations.set('create_coa', {
      id: 'create_coa',
      name: 'Create Chart of Account',
      description: 'Membuat akun baru di Chart of Accounts',
      module: 'coa',
      operation: async (data: any, context: any) => {
        const validation = AIBusinessLogic.validateData('coa', data);
        if (!validation.valid) {
          throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }

        // Check if code already exists
        const existing = await prisma.chartOfAccount.findFirst({
          where: { companyId: context.companyId, code: data.code }
        });

        if (existing) {
          throw new Error('Kode akun sudah ada');
        }

        // Create new COA
        const coa = await prisma.chartOfAccount.create({
          data: {
            companyId: context.companyId,
            code: data.code,
            name: data.name,
            accountType: data.accountType,
            category: data.category,
            parentId: data.parentId,
            isActive: true,
            balance: 0
          }
        });

        // Clear cache
        AIDatabaseContext.clearCache(context.companyId);

        return {
          success: true,
          data: coa,
          message: 'Chart of Account berhasil dibuat'
        };
      },
      validation: (data: any) => {
        return data.code && data.name && data.accountType;
      }
    });

    this.operations.set('update_coa', {
      id: 'update_coa',
      name: 'Update Chart of Account',
      description: 'Mengupdate akun di Chart of Accounts',
      module: 'coa',
      operation: async (data: any, context: any) => {
        const validation = AIBusinessLogic.validateData('coa', data);
        if (!validation.valid) {
          throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }

        const coa = await prisma.chartOfAccount.update({
          where: { id: data.id },
          data: {
            code: data.code,
            name: data.name,
            accountType: data.accountType,
            category: data.category,
            parentId: data.parentId,
            isActive: data.isActive
          }
        });

        AIDatabaseContext.clearCache(context.companyId);

        return {
          success: true,
          data: coa,
          message: 'Chart of Account berhasil diupdate'
        };
      }
    });

    // Customer Operations
    this.operations.set('create_customer', {
      id: 'create_customer',
      name: 'Create Customer',
      description: 'Membuat customer baru',
      module: 'customers',
      operation: async (data: any, context: any) => {
        const customer = await prisma.contact.create({
          data: {
            companyId: context.companyId,
            type: 'CUSTOMER',
            code: `CUST-${Date.now()}`,
            name: data.name,
            email: data.email,
            phone: data.phone,
            address: data.address,
            npwp: data.npwp,
            creditLimit: data.creditLimit || 0,
            isActive: true
          }
        });

        AIDatabaseContext.clearCache(context.companyId);

        return {
          success: true,
          data: customer,
          message: 'Customer berhasil dibuat'
        };
      }
    });

    // Vendor Operations
    this.operations.set('create_vendor', {
      id: 'create_vendor',
      name: 'Create Vendor',
      description: 'Membuat vendor baru',
      module: 'vendors',
      operation: async (data: any, context: any) => {
        const vendor = await prisma.contact.create({
          data: {
            companyId: context.companyId,
            type: 'VENDOR',
            code: `VEND-${Date.now()}`,
            name: data.name,
            email: data.email,
            phone: data.phone,
            address: data.address,
            npwp: data.npwp,
            paymentTerms: data.paymentTerms || 30,
            isActive: true
          }
        });

        AIDatabaseContext.clearCache(context.companyId);

        return {
          success: true,
          data: vendor,
          message: 'Vendor berhasil dibuat'
        };
      }
    });

    // Product Operations
    this.operations.set('create_product', {
      id: 'create_product',
      name: 'Create Product',
      description: 'Membuat product baru',
      module: 'products',
      operation: async (data: any, context: any) => {
        const product = await prisma.product.create({
          data: {
            companyId: context.companyId,
            sku: data.sku,
            name: data.name,
            description: data.description,
            salePrice: data.salePrice || 0,
            purchasePrice: data.purchasePrice || 0,
            unit: data.unit,
            type: data.type || 'GOODS',
            isActive: true
          }
        });

        AIDatabaseContext.clearCache(context.companyId);

        return {
          success: true,
          data: product,
          message: 'Product berhasil dibuat'
        };
      }
    });

    // Sales Operations
    this.operations.set('create_sales_invoice', {
      id: 'create_sales_invoice',
      name: 'Create Sales Invoice',
      description: 'Membuat invoice penjualan',
      module: 'sales',
      operation: async (data: any, context: any) => {
        const validation = AIBusinessLogic.validateData('sales', data);
        if (!validation.valid) {
          throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }

        // Generate journal entries
        const journalEntries = AIBusinessLogic.generateJournalEntry('sales', data);

        // Create journal entry
        const journalEntry = await prisma.journal.create({
          data: {
            companyId: context.companyId,
            date: new Date(data.date),
            description: data.description || `Penjualan ke ${data.customerName}`,
            reference: data.reference,
            totalAmount: data.total,
            status: 'POSTED',
            entries: {
              create: journalEntries
            }
          }
        });

        // Note: Customer balance tracking would be handled by separate balance tracking system
        // For now, we'll just create the journal entry

        AIDatabaseContext.clearCache(context.companyId);

        return {
          success: true,
          data: journalEntry,
          message: 'Sales invoice berhasil dibuat'
        };
      }
    });

    // Purchase Operations
    this.operations.set('create_purchase_bill', {
      id: 'create_purchase_bill',
      name: 'Create Purchase Bill',
      description: 'Membuat bill pembelian',
      module: 'purchases',
      operation: async (data: any, context: any) => {
        const validation = AIBusinessLogic.validateData('purchases', data);
        if (!validation.valid) {
          throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }

        // Generate journal entries
        const journalEntries = AIBusinessLogic.generateJournalEntry('purchases', data);

        // Create journal entry
        const journalEntry = await prisma.journal.create({
          data: {
            companyId: context.companyId,
            date: new Date(data.date),
            description: data.description || `Pembelian dari ${data.vendorName}`,
            reference: data.reference,
            totalAmount: data.total,
            status: 'POSTED',
            entries: {
              create: journalEntries
            }
          }
        });

        // Note: Vendor balance tracking would be handled by separate balance tracking system

        AIDatabaseContext.clearCache(context.companyId);

        return {
          success: true,
          data: journalEntry,
          message: 'Purchase bill berhasil dibuat'
        };
      }
    });

    // Inventory Operations
    this.operations.set('create_inventory_adjustment', {
      id: 'create_inventory_adjustment',
      name: 'Create Inventory Adjustment',
      description: 'Membuat inventory adjustment',
      module: 'inventory',
      operation: async (data: any, context: any) => {
        const validation = AIBusinessLogic.validateData('inventory', data);
        if (!validation.valid) {
          throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }

        // Note: Product stock tracking would be handled by separate inventory system
        // For now, we'll just create the journal entry

        // Generate journal entries
        const journalEntries = AIBusinessLogic.generateJournalEntry('inventory', data);

        // Create journal entry
        const journalEntry = await prisma.journal.create({
          data: {
            companyId: context.companyId,
            date: new Date(data.date),
            description: data.description || `Inventory adjustment untuk ${data.productName}`,
            reference: data.reference,
            totalAmount: data.quantity * data.unitCost,
            status: 'POSTED',
            entries: {
              create: journalEntries
            }
          }
        });

        AIDatabaseContext.clearCache(context.companyId);

        return {
          success: true,
          data: journalEntry,
          message: 'Inventory adjustment berhasil dibuat'
        };
      }
    });

    // Report Operations
    this.operations.set('generate_trial_balance', {
      id: 'generate_trial_balance',
      name: 'Generate Trial Balance',
      description: 'Generate trial balance report',
      module: 'reports',
      operation: async (data: any, context: any) => {
        const accounts = await prisma.chartOfAccount.findMany({
          where: { companyId: context.companyId, isActive: true },
          select: {
            code: true,
            name: true,
            accountType: true,
            balance: true
          },
          orderBy: { code: 'asc' }
        });

        const trialBalance = accounts.map(account => ({
          code: account.code,
          name: account.name,
          accountType: account.accountType,
          debit: account.balance.gt(0) ? account.balance.toNumber() : 0,
          credit: account.balance.lt(0) ? Math.abs(account.balance.toNumber()) : 0
        }));

        return {
          success: true,
          data: trialBalance,
          message: 'Trial balance berhasil di-generate'
        };
      }
    });

    this.operations.set('generate_balance_sheet', {
      id: 'generate_balance_sheet',
      name: 'Generate Balance Sheet',
      description: 'Generate balance sheet report',
      module: 'reports',
      operation: async (data: any, context: any) => {
        const accounts = await prisma.chartOfAccount.findMany({
          where: { companyId: context.companyId, isActive: true },
          select: {
            code: true,
            name: true,
            accountType: true,
            balance: true
          }
        });

        const assets = accounts.filter(a => a.accountType === 'ASSET');
        const liabilities = accounts.filter(a => a.accountType === 'LIABILITY');
        const equity = accounts.filter(a => a.accountType === 'EQUITY');

        const balanceSheet = {
          assets: {
            current: assets.filter(a => a.code.startsWith('1-1')).reduce((sum, a) => sum + a.balance.toNumber(), 0),
            fixed: assets.filter(a => a.code.startsWith('1-2')).reduce((sum, a) => sum + a.balance.toNumber(), 0),
            total: assets.reduce((sum, a) => sum + a.balance.toNumber(), 0)
          },
          liabilities: {
            current: liabilities.filter(a => a.code.startsWith('2-1')).reduce((sum, a) => sum + a.balance.toNumber(), 0),
            longTerm: liabilities.filter(a => a.code.startsWith('2-2')).reduce((sum, a) => sum + a.balance.toNumber(), 0),
            total: liabilities.reduce((sum, a) => sum + a.balance.toNumber(), 0)
          },
          equity: {
            total: equity.reduce((sum, a) => sum + a.balance.toNumber(), 0)
          }
        };

        return {
          success: true,
          data: balanceSheet,
          message: 'Balance sheet berhasil di-generate'
        };
      }
    });
  }

  static getOperation(operationId: string): SystemOperation | null {
    if (this.operations.size === 0) {
      this.initializeOperations();
    }
    return this.operations.get(operationId) || null;
  }

  static getOperationsByModule(module: string): SystemOperation[] {
    if (this.operations.size === 0) {
      this.initializeOperations();
    }
    return Array.from(this.operations.values()).filter(op => op.module === module);
  }

  static async executeOperation(operationId: string, data: any, companyId: string): Promise<any> {
    const operation = this.getOperation(operationId);
    if (!operation) {
      throw new Error(`Operation ${operationId} not found`);
    }

    // Get database context
    const context = await AIDatabaseContext.getContext(companyId);

    // Execute operation
    return await operation.operation(data, context);
  }

  static getAvailableOperations(): SystemOperation[] {
    if (this.operations.size === 0) {
      this.initializeOperations();
    }
    return Array.from(this.operations.values());
  }
}