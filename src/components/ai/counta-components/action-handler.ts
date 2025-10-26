// Centralized Action Handler
// Menangani semua action dari AI components secara konsisten

import { AISystemOperations } from '@/lib/ai/system-operations';

export interface ActionContext {
  companyId: string;
  module: string;
  databaseContext?: any;
  userPermissions?: any;
}

export interface ActionResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export class ActionHandler {
  private static actionMap = new Map<string, (data: any, context: ActionContext) => Promise<ActionResult>>();

  /**
   * Initialize action handlers
   */
  static initialize() {
    // System Operations
    this.actionMap.set('execute_create_coa', this.handleCreateCOA);
    this.actionMap.set('execute_create_customer', this.handleCreateCustomer);
    this.actionMap.set('execute_create_vendor', this.handleCreateVendor);
    this.actionMap.set('execute_create_product', this.handleCreateProduct);
    this.actionMap.set('execute_generate_trial_balance', this.handleGenerateTrialBalance);
    this.actionMap.set('execute_generate_balance_sheet', this.handleGenerateBalanceSheet);

    // Navigation Actions
    this.actionMap.set('execute_navigate', this.handleNavigate);
    this.actionMap.set('execute_view_details', this.handleViewDetails);
    this.actionMap.set('execute_export_report', this.handleExportReport);

    // Form Actions
    this.actionMap.set('execute_fill_form', this.handleFillForm);
    this.actionMap.set('execute_click_button', this.handleClickButton);
    this.actionMap.set('execute_select_option', this.handleSelectOption);
  }

  /**
   * Execute action by ID
   */
  static async executeAction(actionId: string, data: any, context: ActionContext): Promise<ActionResult> {
    if (this.actionMap.size === 0) {
      this.initialize();
    }

    const handler = this.actionMap.get(actionId);
    if (!handler) {
      return {
        success: false,
        message: `Action ${actionId} not found`,
        error: `Unknown action: ${actionId}`
      };
    }

    try {
      return await handler(data, context);
    } catch (error) {
      console.error(`Error executing action ${actionId}:`, error);
      return {
        success: false,
        message: `Failed to execute ${actionId}`,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Register custom action handler
   */
  static registerAction(actionId: string, handler: (data: any, context: ActionContext) => Promise<ActionResult>) {
    this.actionMap.set(actionId, handler);
  }

  // ===== SYSTEM OPERATION HANDLERS =====

  private static async handleCreateCOA(data: any, context: ActionContext): Promise<ActionResult> {
    try {
      const result = await AISystemOperations.executeOperation('create_coa', data, context.companyId);
      return {
        success: true,
        message: 'Chart of Account berhasil dibuat',
        data: result.data
      };
    } catch (error) {
      return {
        success: false,
        message: 'Gagal membuat Chart of Account',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private static async handleCreateCustomer(data: any, context: ActionContext): Promise<ActionResult> {
    try {
      const result = await AISystemOperations.executeOperation('create_customer', data, context.companyId);
      return {
        success: true,
        message: 'Customer berhasil dibuat',
        data: result.data
      };
    } catch (error) {
      return {
        success: false,
        message: 'Gagal membuat Customer',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private static async handleCreateVendor(data: any, context: ActionContext): Promise<ActionResult> {
    try {
      const result = await AISystemOperations.executeOperation('create_vendor', data, context.companyId);
      return {
        success: true,
        message: 'Vendor berhasil dibuat',
        data: result.data
      };
    } catch (error) {
      return {
        success: false,
        message: 'Gagal membuat Vendor',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private static async handleCreateProduct(data: any, context: ActionContext): Promise<ActionResult> {
    try {
      const result = await AISystemOperations.executeOperation('create_product', data, context.companyId);
      return {
        success: true,
        message: 'Product berhasil dibuat',
        data: result.data
      };
    } catch (error) {
      return {
        success: false,
        message: 'Gagal membuat Product',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private static async handleGenerateTrialBalance(data: any, context: ActionContext): Promise<ActionResult> {
    try {
      const result = await AISystemOperations.executeOperation('generate_trial_balance', data, context.companyId);
      return {
        success: true,
        message: 'Trial Balance berhasil di-generate',
        data: result.data
      };
    } catch (error) {
      return {
        success: false,
        message: 'Gagal generate Trial Balance',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private static async handleGenerateBalanceSheet(data: any, context: ActionContext): Promise<ActionResult> {
    try {
      const result = await AISystemOperations.executeOperation('generate_balance_sheet', data, context.companyId);
      return {
        success: true,
        message: 'Balance Sheet berhasil di-generate',
        data: result.data
      };
    } catch (error) {
      return {
        success: false,
        message: 'Gagal generate Balance Sheet',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // ===== UI ACTION HANDLERS =====

  private static async handleNavigate(data: any, context: ActionContext): Promise<ActionResult> {
    try {
      if (typeof window !== 'undefined' && data.url) {
        window.location.href = data.url;
        return {
          success: true,
          message: `Navigating to ${data.url}`
        };
      }
      return {
        success: false,
        message: 'Navigation not available in this context'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Navigation failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private static async handleViewDetails(data: any, context: ActionContext): Promise<ActionResult> {
    try {
      // Emit custom event for UI to handle
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('ai-action', {
          detail: {
            action: 'view-details',
            data: data,
            target: data.target
          }
        }));
      }
      return {
        success: true,
        message: 'View details action triggered'
      };
    } catch (error) {
      return {
        success: false,
        message: 'View details failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private static async handleExportReport(data: any, context: ActionContext): Promise<ActionResult> {
    try {
      // Emit custom event for UI to handle
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('ai-action', {
          detail: {
            action: 'export-report',
            data: data,
            target: data.target
          }
        }));
      }
      return {
        success: true,
        message: 'Export report action triggered'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Export report failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private static async handleFillForm(data: any, context: ActionContext): Promise<ActionResult> {
    try {
      if (typeof window !== 'undefined' && data.fields) {
        Object.keys(data.fields).forEach(fieldName => {
          const field = document.querySelector(`[name="${fieldName}"], [id="${fieldName}"]`) as HTMLInputElement;
          if (field) {
            field.value = data.fields[fieldName];
            field.dispatchEvent(new Event('input', { bubbles: true }));
            field.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });
      }
      return {
        success: true,
        message: 'Form fields filled successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Fill form failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private static async handleClickButton(data: any, context: ActionContext): Promise<ActionResult> {
    try {
      if (typeof window !== 'undefined' && data.selector) {
        const button = document.querySelector(data.selector) as HTMLButtonElement;
        if (button) {
          button.click();
        }
      }
      return {
        success: true,
        message: 'Button clicked successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Click button failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private static async handleSelectOption(data: any, context: ActionContext): Promise<ActionResult> {
    try {
      if (typeof window !== 'undefined' && data.selector && data.value) {
        const select = document.querySelector(data.selector) as HTMLSelectElement;
        if (select) {
          select.value = data.value;
          select.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
      return {
        success: true,
        message: 'Option selected successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Select option failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

/**
 * Action Registry untuk mendaftarkan action baru
 */
export class ActionRegistry {
  private static actions = new Map<string, {
    id: string;
    name: string;
    description: string;
    handler: (data: any, context: ActionContext) => Promise<ActionResult>;
  }>();

  /**
   * Register action
   */
  static register(action: {
    id: string;
    name: string;
    description: string;
    handler: (data: any, context: ActionContext) => Promise<ActionResult>;
  }) {
    this.actions.set(action.id, action);
    ActionHandler.registerAction(action.id, action.handler);
  }

  /**
   * Get all registered actions
   */
  static getAllActions() {
    return Array.from(this.actions.values());
  }

  /**
   * Get action by ID
   */
  static getAction(id: string) {
    return this.actions.get(id);
  }
}
