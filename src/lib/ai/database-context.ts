import { prisma } from '@/shared/database/prisma';

export interface DatabaseContext {
  companyId: string;
  coa: any[];
  customers: any[];
  vendors: any[];
  products: any[];
  invoices: any[];
  payments: any[];
  journals: any[];
  journalEntries: any[];
  bankAccounts: any[];
  inventoryItems: any[];
  stockMovements: any[];
  fixedAssets: any[];
  taxRates: any[];
  accountingPeriods: any[];
  recentTransactions: any[];
  currentBalances: any[];
  systemSettings: any;
  userPermissions: any;
}

export class AIDatabaseContext {
  private static cache = new Map<string, { data: DatabaseContext; timestamp: number }>();
  private static CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static async getContext(companyId: string, module?: string): Promise<DatabaseContext> {
    // Check cache first
    const cached = this.cache.get(companyId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      // Fetch all relevant data in parallel
      const [
        coa,
        customers,
        vendors,
        products,
        invoices,
        payments,
        journals,
        journalEntries,
        bankAccounts,
        inventoryItems,
        stockMovements,
        fixedAssets,
        taxRates,
        accountingPeriods,
        recentTransactions,
        currentBalances,
        systemSettings,
        userPermissions
      ] = await Promise.all([
        // Chart of Accounts
        prisma.chartOfAccount.findMany({
          where: { companyId, isActive: true },
          select: {
            id: true,
            code: true,
            name: true,
            accountType: true,
            category: true,
            parentId: true,
            isActive: true,
            balance: true
          },
          orderBy: { code: 'asc' }
        }),

        // Customers
        prisma.contact.findMany({
          where: { companyId, type: 'CUSTOMER', isActive: true },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            npwp: true,
            creditLimit: true
          },
          take: 50,
          orderBy: { name: 'asc' }
        }),

        // Vendors
        prisma.contact.findMany({
          where: { companyId, type: 'VENDOR', isActive: true },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            npwp: true,
            paymentTerms: true
          },
          take: 50,
          orderBy: { name: 'asc' }
        }),

        // Products
        prisma.product.findMany({
          where: { companyId, isActive: true },
          select: {
            id: true,
            sku: true,
            name: true,
            description: true,
            salePrice: true,
            purchasePrice: true,
            unit: true,
            type: true
          },
          take: 100,
          orderBy: { name: 'asc' }
        }),

        // Invoices (Sales & Purchase)
        prisma.invoice.findMany({
          where: { companyId },
          select: {
            id: true,
            invoiceNo: true,
            type: true,
            contactId: true,
            contact: {
              select: {
                name: true,
                type: true
              }
            },
            date: true,
            dueDate: true,
            subtotal: true,
            taxAmount: true,
            total: true,
            paidAmount: true,
            status: true,
            items: {
              select: {
                product: {
                  select: {
                    name: true,
                    sku: true
                  }
                },
                quantity: true,
                unitPrice: true,
                total: true
              }
            }
          },
          take: 50,
          orderBy: { date: 'desc' }
        }),

        // Payments
        prisma.payment.findMany({
          where: { companyId },
          select: {
            id: true,
            paymentNo: true,
            type: true,
            contactId: true,
            contact: {
              select: {
                name: true,
                type: true
              }
            },
            date: true,
            amount: true,
            paymentMethod: true,
            status: true,
            allocations: {
              select: {
                invoice: {
                  select: {
                    invoiceNo: true,
                    total: true
                  }
                },
                amount: true
              }
            }
          },
          take: 50,
          orderBy: { date: 'desc' }
        }),

        // Journals
        prisma.journal.findMany({
          where: { companyId },
          select: {
            id: true,
            journalNo: true,
            date: true,
            description: true,
            referenceNo: true,
            sourceType: true,
            status: true,
            totalDebit: true,
            totalCredit: true,
            entries: {
              select: {
                account: {
                  select: {
                    code: true,
                    name: true,
                    accountType: true
                  }
                },
                debit: true,
                credit: true,
                description: true
              }
            }
          },
          take: 30,
          orderBy: { date: 'desc' }
        }),

        // Journal Entries (for detailed analysis)
        prisma.journalEntry.findMany({
          where: {
            journal: { companyId }
          },
          select: {
            id: true,
            journalId: true,
            accountId: true,
            account: {
              select: {
                code: true,
                name: true,
                accountType: true
              }
            },
            debit: true,
            credit: true,
            description: true,
            journal: {
              select: {
                date: true,
                description: true,
                sourceType: true
              }
            }
          },
          take: 100,
          orderBy: { journal: { date: 'desc' } }
        }),

        // Bank Accounts
        prisma.bankAccount.findMany({
          where: { companyId, isActive: true },
          select: {
            id: true,
            name: true,
            accountType: true,
            bankName: true,
            accountNumber: true,
            balance: true,
            account: {
              select: {
                code: true,
                name: true
              }
            }
          },
          orderBy: { name: 'asc' }
        }),

        // Inventory Items (Stock Card)
        prisma.inventoryItem.findMany({
          where: { companyId },
          select: {
            id: true,
            productId: true,
            product: {
              select: {
                sku: true,
                name: true,
                unit: true,
                type: true
              }
            },
            warehouseId: true,
            quantity: true,
            value: true,
            averageCost: true,
            updatedAt: true
          },
          orderBy: { product: { name: 'asc' } }
        }),

        // Stock Movements (Adjustments, Transfers, etc.)
        prisma.stockMovement.findMany({
          where: { companyId },
          select: {
            id: true,
            productId: true,
            product: {
              select: {
                sku: true,
                name: true,
                unit: true
              }
            },
            warehouseId: true,
            movementType: true,
            quantity: true,
            unitCost: true,
            totalCost: true,
            date: true,
            referenceNo: true,
            referenceType: true,
            referenceId: true,
            notes: true,
            createdAt: true
          },
          take: 100,
          orderBy: { date: 'desc' }
        }),

        // Fixed Assets
        prisma.fixedAsset.findMany({
          where: { companyId },
          select: {
            id: true,
            assetNo: true,
            name: true,
            description: true,
            category: true,
            purchaseDate: true,
            purchasePrice: true,
            residualValue: true,
            usefulLife: true,
            depreciationMethod: true,
            accumulatedDepreciation: true,
            bookValue: true,
            status: true,
            disposalDate: true,
            disposalAmount: true,
            depreciations: {
              select: {
                period: true,
                amount: true
              },
              take: 12,
              orderBy: { period: 'desc' }
            }
          },
          orderBy: { name: 'asc' }
        }),

        // Tax Rates
        prisma.taxRate.findMany({
          where: { companyId, isActive: true },
          select: {
            id: true,
            name: true,
            taxType: true,
            rate: true,
            account: {
              select: {
                code: true,
                name: true
              }
            }
          },
          orderBy: { name: 'asc' }
        }),

        // Accounting Periods
        prisma.accountingPeriod.findMany({
          where: { companyId },
          select: {
            id: true,
            year: true,
            month: true,
            startDate: true,
            endDate: true,
            status: true,
            closedAt: true
          },
          orderBy: { year: 'desc', month: 'desc' }
        }),

        // Recent Transactions
        prisma.journal.findMany({
          where: { companyId },
          select: {
            id: true,
            date: true,
            description: true,
            referenceNo: true,
            totalDebit: true,
            totalCredit: true,
            status: true,
            entries: {
              select: {
                account: {
                  select: {
                    code: true,
                    name: true
                  }
                },
                debit: true,
                credit: true,
                description: true
              }
            }
          },
          take: 20,
          orderBy: { createdAt: 'desc' }
        }),

        // Current Account Balances
        prisma.chartOfAccount.findMany({
          where: { companyId, isActive: true },
          select: {
            code: true,
            name: true,
            accountType: true,
            balance: true
          },
          orderBy: { code: 'asc' }
        }),

        // System Settings
        prisma.company.findUnique({
          where: { id: companyId },
          select: {
            id: true,
            name: true,
            baseCurrency: true,
            fiscalYearStart: true,
            npwp: true,
            address: true
          }
        }),

        // User Permissions (placeholder for now)
        Promise.resolve({ role: 'admin', permissions: ['read', 'write', 'delete'] })
      ]);

      const context: DatabaseContext = {
        companyId,
        coa,
        customers,
        vendors,
        products,
        invoices,
        payments,
        journals,
        journalEntries,
        bankAccounts,
        inventoryItems,
        stockMovements,
        fixedAssets,
        taxRates,
        accountingPeriods,
        recentTransactions,
        currentBalances,
        systemSettings,
        userPermissions
      };

      // Cache the result
      this.cache.set(companyId, { data: context, timestamp: Date.now() });

      return context;
    } catch (error) {
      console.error('Error fetching database context:', error);
      throw new Error('Failed to fetch database context');
    }
  }

  static async getModuleSpecificContext(companyId: string, module: string): Promise<any> {
    const baseContext = await this.getContext(companyId);

    switch (module) {
      case 'master-data':
        return {
          ...baseContext,
          coaCount: baseContext.coa.length,
          customerCount: baseContext.customers.length,
          vendorCount: baseContext.vendors.length,
          productCount: baseContext.products.length
        };

      case 'sales':
        const salesTransactions = baseContext.recentTransactions.filter(t => 
          t.entries.some((e: any) => e.account?.name?.toLowerCase().includes('penjualan') || 
                               e.account?.name?.toLowerCase().includes('piutang'))
        );
        return {
          ...baseContext,
          salesTransactions,
          totalSales: salesTransactions.reduce((sum, t) => sum + (t.totalDebit || 0), 0)
        };

      case 'purchases':
        const purchaseTransactions = baseContext.recentTransactions.filter(t => 
          t.entries.some((e: any) => e.account?.name?.toLowerCase().includes('pembelian') || 
                              e.account?.name?.toLowerCase().includes('hutang'))
        );
        return {
          ...baseContext,
          purchaseTransactions,
          totalPurchases: purchaseTransactions.reduce((sum, t) => sum + (t.totalDebit || 0), 0)
        };

      case 'inventory':
        return {
          ...baseContext,
          totalProducts: baseContext.products.length,
          totalStockValue: baseContext.products.reduce((sum, p) => 
            sum + ((p.stockQuantity || 0) * (p.purchasePrice || 0)), 0),
          lowStockProducts: baseContext.products.filter(p => (p.stockQuantity || 0) < 10)
        };

      case 'general-ledger':
        return {
          ...baseContext,
          totalTransactions: baseContext.recentTransactions.length,
          totalDebit: baseContext.recentTransactions.reduce((sum, t) => 
            sum + (t.totalDebit || 0), 0),
          totalCredit: baseContext.recentTransactions.reduce((sum, t) => 
            sum + (t.totalCredit || 0), 0)
        };

      case 'reports':
        return {
          ...baseContext,
          financialSummary: {
            totalAssets: baseContext.currentBalances
              .filter(b => b.accountType === 'ASSET')
              .reduce((sum, b) => sum + (b.balance || 0), 0),
            totalLiabilities: baseContext.currentBalances
              .filter(b => b.accountType === 'LIABILITY')
              .reduce((sum, b) => sum + (b.balance || 0), 0),
            totalEquity: baseContext.currentBalances
              .filter(b => b.accountType === 'EQUITY')
              .reduce((sum, b) => sum + (b.balance || 0), 0),
            totalRevenue: baseContext.currentBalances
              .filter(b => b.accountType === 'REVENUE')
              .reduce((sum, b) => sum + (b.balance || 0), 0),
            totalExpenses: baseContext.currentBalances
              .filter(b => b.accountType === 'EXPENSE')
              .reduce((sum, b) => sum + (b.balance || 0), 0)
          }
        };

      default:
        return baseContext;
    }
  }

  static clearCache(companyId?: string) {
    if (companyId) {
      this.cache.delete(companyId);
    } else {
      this.cache.clear();
    }
  }
}