// AI-Friendly Component Builder
// Membuat AI lebih mudah generate components

import { CountaComponent, CountaMessage } from './types';

export interface AIComponentRequest {
  type: 'card' | 'table' | 'action' | 'status' | 'text';
  title?: string;
  data?: any;
  actions?: string[];
  variant?: string;
}

export class AIComponentBuilder {
  /**
   * Build component dari request AI yang sederhana
   */
  static buildComponent(request: AIComponentRequest): CountaComponent {
    switch (request.type) {
      case 'card':
        return this.buildCardComponent(request);
      case 'table':
        return this.buildTableComponent(request);
      case 'action':
        return this.buildActionComponent(request);
      case 'status':
        return this.buildStatusComponent(request);
      case 'text':
        return this.buildTextComponent(request);
      default:
        return this.buildTextComponent(request);
    }
  }

  /**
   * Build CountaMessage dari array components
   */
  static buildMessage(components: CountaComponent[]): CountaMessage {
    return {
      id: `msg-${Date.now()}`,
      type: 'ai',
      timestamp: new Date(),
      components
    };
  }

  private static buildCardComponent(request: AIComponentRequest): CountaComponent {
    return {
      type: 'card',
      variant: (request.variant as any) || 'summary',
      title: request.title || 'Data',
      data: request.data || {},
      actions: request.actions?.map((action, index) => ({
        id: `action-${index}`,
        label: action,
        action: `execute_${action.toLowerCase().replace(/\s+/g, '_')}`,
        variant: 'primary' as const
      })) || []
    };
  }

  private static buildTableComponent(request: AIComponentRequest): CountaComponent {
    const data = request.data || {};
    const columns = Object.keys(data).map(key => ({
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1),
      type: 'text' as const
    }));

    return {
      type: 'table',
      variant: 'data',
      title: request.title || 'Data Table',
      columns,
      rows: [{
        id: 'row-1',
        data: data
      }]
    };
  }

  private static buildActionComponent(request: AIComponentRequest): CountaComponent {
    return {
      type: 'action',
      variant: 'context-aware',
      title: request.title || 'Actions',
      actions: request.actions?.map((action, index) => ({
        id: `action-${index}`,
        label: action,
        action: `execute_${action.toLowerCase().replace(/\s+/g, '_')}`,
        variant: 'primary' as const
      })) || []
    };
  }

  private static buildStatusComponent(request: AIComponentRequest): CountaComponent {
    return {
      type: 'status',
      variant: 'system',
      title: request.title || 'Status',
      status: 'success',
      message: request.data?.message || 'Operation completed successfully'
    };
  }

  private static buildTextComponent(request: AIComponentRequest): CountaComponent {
    return {
      type: 'text',
      content: request.data?.content || request.title || 'No content',
      variant: 'info'
    };
  }
}

/**
 * Helper functions untuk AI
 */
export const AIHelpers = {
  /**
   * Create trial balance card
   */
  createTrialBalanceCard: (data: any) => {
    return AIComponentBuilder.buildComponent({
      type: 'card',
      title: 'Trial Balance Status',
      variant: 'financial-health',
      data: {
        totalDebit: data.totalDebit || 0,
        totalCredit: data.totalCredit || 0,
        difference: (data.totalDebit || 0) - (data.totalCredit || 0),
        isBalanced: Math.abs((data.totalDebit || 0) - (data.totalCredit || 0)) < 0.01
      },
      actions: ['View Details', 'Export Report']
    });
  },

  /**
   * Create financial summary card
   */
  createFinancialSummaryCard: (data: any) => {
    return AIComponentBuilder.buildComponent({
      type: 'card',
      title: 'Financial Summary',
      variant: 'summary',
      data: {
        totalAssets: data.totalAssets || 0,
        totalLiabilities: data.totalLiabilities || 0,
        totalEquity: data.totalEquity || 0,
        totalRevenue: data.totalRevenue || 0,
        totalExpenses: data.totalExpenses || 0
      },
      actions: ['View Details', 'Generate Report']
    });
  },

  /**
   * Create action buttons
   */
  createActionButtons: (actions: string[]) => {
    return AIComponentBuilder.buildComponent({
      type: 'action',
      title: 'Available Actions',
      actions
    });
  },

  /**
   * Create status message
   */
  createStatusMessage: (title: string, message: string, status: 'success' | 'warning' | 'error' | 'info' = 'info') => {
    return AIComponentBuilder.buildComponent({
      type: 'status',
      title,
      data: { message, status }
    });
  }
};

/**
 * AI Response Parser
 * Parse AI response yang menggunakan format sederhana
 */
export class AIResponseParser {
  /**
   * Parse AI response dengan format: [COMPONENT:type:data]
   */
  static parseResponse(content: string): { text: string; components: CountaComponent[] } {
    const componentRegex = /\[COMPONENT:(\w+):([^\]]+)\]/g;
    const components: CountaComponent[] = [];
    let text = content;

    let match;
    while ((match = componentRegex.exec(content)) !== null) {
      const [, type, dataStr] = match;
      
      try {
        const data = JSON.parse(dataStr);
        const component = AIComponentBuilder.buildComponent({
          type: type as any,
          ...data
        });
        components.push(component);
        
        // Remove component tag from text
        text = text.replace(match[0], '');
      } catch (error) {
        console.error('Error parsing component:', error);
      }
    }

    return { text: text.trim(), components };
  }

  /**
   * Parse simple format: [CARD:title:data] atau [ACTION:action1,action2]
   */
  static parseSimpleResponse(content: string): { text: string; components: CountaComponent[] } {
    const components: CountaComponent[] = [];
    let text = content;

    // Parse [CARD:title:data]
    const cardRegex = /\[CARD:([^:]+):([^\]]+)\]/g;
    let match;
    while ((match = cardRegex.exec(content)) !== null) {
      const [, title, dataStr] = match;
      try {
        const data = JSON.parse(dataStr);
        components.push(AIComponentBuilder.buildComponent({
          type: 'card',
          title,
          data
        }));
        text = text.replace(match[0], '');
      } catch (error) {
        console.error('Error parsing card:', error);
      }
    }

    // Parse [ACTION:action1,action2]
    const actionRegex = /\[ACTION:([^\]]+)\]/g;
    while ((match = actionRegex.exec(content)) !== null) {
      const [, actionsStr] = match;
      const actions = actionsStr.split(',').map(a => a.trim());
      components.push(AIComponentBuilder.buildComponent({
        type: 'action',
        title: 'Available Actions',
        actions
      }));
      text = text.replace(match[0], '');
    }

    return { text: text.trim(), components };
  }
}
