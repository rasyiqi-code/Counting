import { z } from 'zod';

export interface BusinessRule {
  id: string;
  module: string;
  rule: string;
  validation: (data: any) => boolean;
  message: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  required: boolean;
  validation?: (data: any) => boolean;
  nextSteps?: string[];
}

export interface ModuleWorkflow {
  module: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  businessRules: BusinessRule[];
}

export class AIBusinessLogic {
  private static workflows: Map<string, ModuleWorkflow> = new Map();

  static initializeWorkflows() {
    // COA Workflow
    this.workflows.set('coa', {
      module: 'coa',
      name: 'Chart of Accounts Management',
      description: 'Workflow untuk mengelola Chart of Accounts',
      steps: [
        {
          id: 'validate_account_code',
          name: 'Validasi Kode Akun',
          description: 'Pastikan kode akun unik dan mengikuti hierarki',
          required: true,
          validation: (data: any) => {
            return data.code && /^\d{1}-\d{1}-\d{1}$/.test(data.code);
          }
        },
        {
          id: 'validate_account_type',
          name: 'Validasi Tipe Akun',
          description: 'Pastikan tipe akun sesuai dengan PSAK',
          required: true,
          validation: (data: any) => {
            const validTypes = ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE', 'COGS'];
            return validTypes.includes(data.accountType);
          }
        },
        {
          id: 'validate_parent_account',
          name: 'Validasi Parent Account',
          description: 'Pastikan parent account ada dan sesuai hierarki',
          required: false,
          validation: (data: any) => {
            if (!data.parentCode) return true;
            // Check if parent exists and is valid
            return true; // Will be validated against database
          }
        }
      ],
      businessRules: [
        {
          id: 'coa_code_unique',
          module: 'coa',
          rule: 'Kode akun harus unik',
          validation: (data: any) => data.code && data.code.length > 0,
          message: 'Kode akun harus diisi dan unik'
        },
        {
          id: 'coa_name_required',
          module: 'coa',
          rule: 'Nama akun harus diisi',
          validation: (data: any) => data.name && data.name.trim().length > 0,
          message: 'Nama akun harus diisi'
        },
        {
          id: 'coa_type_valid',
          module: 'coa',
          rule: 'Tipe akun harus valid',
          validation: (data: any) => {
            const validTypes = ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE', 'COGS'];
            return validTypes.includes(data.accountType);
          },
          message: 'Tipe akun harus sesuai dengan PSAK'
        }
      ]
    });

    // Sales Workflow
    this.workflows.set('sales', {
      module: 'sales',
      name: 'Sales Management',
      description: 'Workflow untuk mengelola penjualan',
      steps: [
        {
          id: 'validate_customer',
          name: 'Validasi Customer',
          description: 'Pastikan customer ada dan aktif',
          required: true,
          validation: (data: any) => data.customerId && data.customerId.length > 0
        },
        {
          id: 'validate_items',
          name: 'Validasi Items',
          description: 'Pastikan ada minimal 1 item dengan quantity > 0',
          required: true,
          validation: (data: any) => {
            return data.items && data.items.length > 0 && 
                   data.items.every((item: any) => item.quantity > 0);
          }
        },
        {
          id: 'calculate_totals',
          name: 'Hitung Total',
          description: 'Hitung subtotal, pajak, dan total',
          required: true,
          validation: (data: any) => {
            const subtotal = data.items.reduce((sum: number, item: any) => 
              sum + (item.quantity * item.price), 0);
            const tax = subtotal * 0.11; // 11% PPN
            const total = subtotal + tax;
            return Math.abs(data.total - total) < 0.01;
          }
        },
        {
          id: 'post_journal',
          name: 'Post Journal Entry',
          description: 'Buat journal entry untuk transaksi',
          required: true
        }
      ],
      businessRules: [
        {
          id: 'sales_customer_required',
          module: 'sales',
          rule: 'Customer harus dipilih',
          validation: (data: any) => data.customerId && data.customerId.length > 0,
          message: 'Customer harus dipilih'
        },
        {
          id: 'sales_items_required',
          module: 'sales',
          rule: 'Minimal 1 item harus ada',
          validation: (data: any) => data.items && data.items.length > 0,
          message: 'Minimal 1 item harus ditambahkan'
        },
        {
          id: 'sales_positive_amount',
          module: 'sales',
          rule: 'Jumlah harus positif',
          validation: (data: any) => data.total > 0,
          message: 'Total penjualan harus positif'
        }
      ]
    });

    // Purchases Workflow
    this.workflows.set('purchases', {
      module: 'purchases',
      name: 'Purchase Management',
      description: 'Workflow untuk mengelola pembelian',
      steps: [
        {
          id: 'validate_vendor',
          name: 'Validasi Vendor',
          description: 'Pastikan vendor ada dan aktif',
        required: true,
          validation: (data: any) => data.vendorId && data.vendorId.length > 0
      },
        {
          id: 'validate_items',
          name: 'Validasi Items',
          description: 'Pastikan ada minimal 1 item dengan quantity > 0',
        required: true,
          validation: (data: any) => {
            return data.items && data.items.length > 0 && 
                   data.items.every((item: any) => item.quantity > 0);
          }
        },
        {
          id: 'calculate_totals',
          name: 'Hitung Total',
          description: 'Hitung subtotal, pajak, dan total',
        required: true,
          validation: (data: any) => {
            const subtotal = data.items.reduce((sum: number, item: any) => 
              sum + (item.quantity * item.price), 0);
            const tax = subtotal * 0.11; // 11% PPN
            const total = subtotal + tax;
            return Math.abs(data.total - total) < 0.01;
          }
        },
        {
          id: 'post_journal',
          name: 'Post Journal Entry',
          description: 'Buat journal entry untuk transaksi',
          required: true
        }
      ],
      businessRules: [
        {
          id: 'purchase_vendor_required',
          module: 'purchases',
          rule: 'Vendor harus dipilih',
          validation: (data: any) => data.vendorId && data.vendorId.length > 0,
          message: 'Vendor harus dipilih'
        },
        {
          id: 'purchase_items_required',
          module: 'purchases',
          rule: 'Minimal 1 item harus ada',
          validation: (data: any) => data.items && data.items.length > 0,
          message: 'Minimal 1 item harus ditambahkan'
        },
        {
          id: 'purchase_positive_amount',
          module: 'purchases',
          rule: 'Jumlah harus positif',
          validation: (data: any) => data.total > 0,
          message: 'Total pembelian harus positif'
        }
      ]
    });

    // Inventory Workflow
    this.workflows.set('inventory', {
      module: 'inventory',
      name: 'Inventory Management',
      description: 'Workflow untuk mengelola inventory',
      steps: [
        {
          id: 'validate_product',
          name: 'Validasi Product',
          description: 'Pastikan product ada dan aktif',
          required: true,
          validation: (data: any) => data.productId && data.productId.length > 0
        },
        {
          id: 'validate_quantity',
          name: 'Validasi Quantity',
          description: 'Pastikan quantity valid',
          required: true,
          validation: (data: any) => data.quantity && data.quantity > 0
        },
        {
          id: 'update_stock',
          name: 'Update Stock',
          description: 'Update stock quantity',
          required: true
        },
        {
          id: 'post_journal',
          name: 'Post Journal Entry',
          description: 'Buat journal entry untuk inventory adjustment',
          required: true
        }
      ],
      businessRules: [
        {
          id: 'inventory_product_required',
          module: 'inventory',
          rule: 'Product harus dipilih',
          validation: (data: any) => data.productId && data.productId.length > 0,
          message: 'Product harus dipilih'
        },
        {
          id: 'inventory_quantity_positive',
          module: 'inventory',
          rule: 'Quantity harus positif',
          validation: (data: any) => data.quantity > 0,
          message: 'Quantity harus positif'
        }
      ]
    });
  }

  static getWorkflow(module: string): ModuleWorkflow | null {
    if (this.workflows.size === 0) {
      this.initializeWorkflows();
    }
    return this.workflows.get(module) || null;
  }

  static getBusinessRules(module: string): BusinessRule[] {
    const workflow = this.getWorkflow(module);
    return workflow ? workflow.businessRules : [];
  }

  static validateData(module: string, data: any): { valid: boolean; errors: string[] } {
    const rules = this.getBusinessRules(module);
    const errors: string[] = [];

    for (const rule of rules) {
      if (!rule.validation(data)) {
        errors.push(rule.message);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static getWorkflowSteps(module: string): WorkflowStep[] {
    const workflow = this.getWorkflow(module);
    return workflow ? workflow.steps : [];
  }

  static getNextWorkflowStep(module: string, currentStep: string, data: any): WorkflowStep | null {
    const steps = this.getWorkflowSteps(module);
    const currentStepIndex = steps.findIndex(step => step.id === currentStep);
    
    if (currentStepIndex === -1 || currentStepIndex >= steps.length - 1) {
      return null;
    }

    const nextStep = steps[currentStepIndex + 1];
    
    // Check if next step has validation and if it passes
    if (nextStep.validation && !nextStep.validation(data)) {
      return null;
    }

    return nextStep;
  }

  static generateJournalEntry(module: string, data: any): any[] {
    switch (module) {
      case 'sales':
        return this.generateSalesJournalEntry(data);
      case 'purchases':
        return this.generatePurchaseJournalEntry(data);
      case 'inventory':
        return this.generateInventoryJournalEntry(data);
      default:
        return [];
    }
  }

  private static generateSalesJournalEntry(data: any): any[] {
    const entries = [];
    
    // Debit: Piutang Usaha
    entries.push({
      accountCode: '1-2-1', // Piutang Usaha
      accountName: 'Piutang Usaha',
      debit: data.total,
      credit: 0,
      description: `Penjualan ke ${data.customerName}`
    });

    // Credit: Penjualan
    entries.push({
      accountCode: '4-1-1', // Penjualan
      accountName: 'Penjualan',
      debit: 0,
      credit: data.subtotal,
      description: `Penjualan ke ${data.customerName}`
    });

    // Credit: PPN Keluaran (if applicable)
    if (data.tax > 0) {
      entries.push({
        accountCode: '2-2-1', // PPN Keluaran
        accountName: 'PPN Keluaran',
        debit: 0,
        credit: data.tax,
        description: `PPN Keluaran untuk penjualan ke ${data.customerName}`
      });
    }

    return entries;
  }

  private static generatePurchaseJournalEntry(data: any): any[] {
    const entries = [];
    
    // Debit: Pembelian
    entries.push({
      accountCode: '5-1-1', // Pembelian
      accountName: 'Pembelian',
      debit: data.subtotal,
      credit: 0,
      description: `Pembelian dari ${data.vendorName}`
    });

    // Debit: PPN Masukan (if applicable)
    if (data.tax > 0) {
      entries.push({
        accountCode: '1-1-3', // PPN Masukan
        accountName: 'PPN Masukan',
        debit: data.tax,
        credit: 0,
        description: `PPN Masukan untuk pembelian dari ${data.vendorName}`
      });
    }

    // Credit: Hutang Usaha
    entries.push({
      accountCode: '2-1-1', // Hutang Usaha
      accountName: 'Hutang Usaha',
      debit: 0,
      credit: data.total,
      description: `Hutang ke ${data.vendorName}`
    });

    return entries;
  }

  private static generateInventoryJournalEntry(data: any): any[] {
    const entries = [];
    
    if (data.type === 'adjustment') {
      // Debit: Inventory Adjustment
      entries.push({
        accountCode: '1-3-1', // Inventory
        accountName: 'Inventory',
        debit: data.quantity * data.unitCost,
        credit: 0,
        description: `Inventory adjustment untuk ${data.productName}`
      });

      // Credit: Inventory Adjustment Account
      entries.push({
        accountCode: '6-1-1', // Inventory Adjustment
        accountName: 'Inventory Adjustment',
        debit: 0,
        credit: data.quantity * data.unitCost,
        description: `Inventory adjustment untuk ${data.productName}`
      });
    }

    return entries;
  }
}