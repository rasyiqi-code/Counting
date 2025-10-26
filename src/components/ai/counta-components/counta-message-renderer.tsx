'use client';

import React from 'react';
import { CountaMessage, CountaComponent } from './types';
import { AIComponentBuilder, AIResponseParser } from './component-builder';
import { ActionHandler, ActionContext } from './action-handler';
import { CountaCard } from './card-components';
import { CountaTable } from './table-components';
import { CountaStatus } from './status-components';
import { CountaForm } from './form-components';

interface CountaMessageRendererProps {
  message: CountaMessage;
  onAction?: (actionId: string, action: string, data?: any) => void;
  onCellEdit?: (rowId: string, field: string, value: any) => void;
  context?: ActionContext;
}

export function CountaMessageRenderer({ 
  message, 
  onAction, 
  onCellEdit,
  context
}: CountaMessageRendererProps) {
  const handleAction = async (actionId: string, action: string, data?: any) => {
    // Enhanced action handling with context
    if (context) {
      try {
        const result = await ActionHandler.executeAction(actionId, data || {}, context);
        
        if (result.success) {
          console.log('Action executed successfully:', result.message);
          // Emit success event
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('ai-action-success', {
              detail: { actionId, result }
            }));
          }
        } else {
          console.error('Action failed:', result.error);
          // Emit error event
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('ai-action-error', {
              detail: { actionId, error: result.error }
            }));
          }
        }
      } catch (error) {
        console.error('Action execution error:', error);
      }
    }
    
    // Call original onAction if provided
    if (onAction) {
      onAction(actionId, action, data);
    }
  };

  const renderComponent = (component: CountaComponent, index: number) => {
    switch (component.type) {
      case 'text':
        return (
          <div 
            key={index}
            className={`text-sm leading-relaxed ${
              component.variant === 'success' ? 'text-green-700' :
              component.variant === 'warning' ? 'text-yellow-700' :
              component.variant === 'error' ? 'text-red-700' :
              component.variant === 'info' ? 'text-blue-700' :
              'text-gray-800'
            } ${
              component.size === 'sm' ? 'text-xs' :
              component.size === 'lg' ? 'text-base' :
              'text-sm'
            } ${
              component.align === 'center' ? 'text-center' :
              component.align === 'right' ? 'text-right' :
              'text-left'
            }`}
          >
            {component.content}
          </div>
        );

      case 'card':
        return (
          <div key={index} className="my-3">
            <CountaCard 
              component={component} 
              onAction={onAction}
            />
          </div>
        );

      case 'table':
        return (
          <div key={index} className="my-3">
            <CountaTable 
              component={component} 
              onAction={onAction}
              onCellEdit={onCellEdit}
            />
          </div>
        );

      case 'action':
      case 'action_group':
        return (
          <div key={index} className="my-3">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-3">{component.title}</h3>
                <div className="flex flex-wrap gap-2">
                  {(component as any).actions?.map((action: any) => (
                    <button
                      key={action.id}
                      onClick={() => handleAction(action.id, action.action)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        action.variant === 'primary'
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'status':
        return (
          <div key={index} className="my-3">
            <CountaStatus 
              component={component} 
              onAction={onAction}
            />
          </div>
        );

      case 'chart':
        return (
          <div key={index} className="my-3">
            <div className="p-4 bg-gray-50 rounded-lg border">
              <h3 className="font-semibold text-gray-800 mb-2">{component.title}</h3>
              <div className="text-sm text-gray-600">
                📊 Chart component akan diimplementasikan dengan Chart.js atau Recharts
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Data: {JSON.stringify(component.data, null, 2)}
              </div>
            </div>
          </div>
        );

      case 'form':
        return (
          <div key={index} className="my-3">
            <CountaForm component={component} onAction={onAction} />
          </div>
        );

      case 'calendar':
        return (
          <div key={index} className="my-3">
            <div className="p-4 bg-gray-50 rounded-lg border">
              <h3 className="font-semibold text-gray-800 mb-2">{component.title}</h3>
              <div className="text-sm text-gray-600">
                📅 Calendar component akan diimplementasikan dengan date picker
              </div>
            </div>
          </div>
        );

      case 'notification':
        return (
          <div key={index} className="my-3">
            <div className={`p-4 rounded-lg border-l-4 ${
              component.severity === 'success' ? 'bg-green-50 border-green-400' :
              component.severity === 'warning' ? 'bg-yellow-50 border-yellow-400' :
              component.severity === 'error' ? 'bg-red-50 border-red-400' :
              'bg-blue-50 border-blue-400'
            }`}>
              <div className="flex items-start gap-2">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  component.severity === 'success' ? 'bg-green-100' :
                  component.severity === 'warning' ? 'bg-yellow-100' :
                  component.severity === 'error' ? 'bg-red-100' :
                  'bg-blue-100'
                }`}>
                  {component.severity === 'success' ? '✅' :
                   component.severity === 'warning' ? '⚠️' :
                   component.severity === 'error' ? '❌' :
                   'ℹ️'}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">{component.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{component.message}</p>
                  {component.actions && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {component.actions.map((action) => (
                        <button
                          key={action.id}
                          onClick={() => handleAction(action.id, action.action)}
                          className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div key={index} className="my-3 p-4 bg-gray-50 rounded-lg border">
            <div className="text-sm text-gray-600">
              Unknown component type: {(component as any).type}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-2">
      {message.components.map((component, index) => 
        renderComponent(component, index)
      )}
    </div>
  );
}

// Helper function untuk membuat CountaMessage dari response AI
export function createCountaMessage(
  contentOrComponents: string | CountaComponent[], 
  componentsOrMetadata?: CountaComponent[] | any,
  metadata?: any
): CountaMessage {
  // If first argument is array of components
  if (Array.isArray(contentOrComponents)) {
    return {
      id: Date.now().toString(),
      type: 'ai',
      timestamp: new Date(),
      components: contentOrComponents,
      metadata: componentsOrMetadata
    };
  }
  
  // If first argument is string content
  const content = contentOrComponents;
  const components = Array.isArray(componentsOrMetadata) ? componentsOrMetadata : [];
  
  return {
    id: Date.now().toString(),
    type: 'ai',
    timestamp: new Date(),
    components: [
      {
        type: 'text',
        content: content,
        variant: 'default'
      },
      ...components
    ],
    metadata
  };
}

// Helper function untuk membuat response berdasarkan context
export function createContextualResponse(
  context: string,
  data: any,
  actions?: any[]
): CountaMessage {
  const components: CountaComponent[] = [];

  // Add appropriate components based on context
  if (context === 'transaction_created') {
    components.push({
      type: 'card',
      variant: 'transaction',
      title: '🛒 TRANSAKSI DICATAT',
      data: data,
      status: 'success',
      actions: [
        { id: 'view', label: '👁️ Detail', action: 'view_transaction' },
        { id: 'edit', label: '✏️ Edit', action: 'edit_transaction' },
        { id: 'duplicate', label: '🔄 Duplikat', action: 'duplicate_transaction' }
      ]
    });
  }

  if (context === 'financial_health') {
    components.push({
      type: 'card',
      variant: 'financial-health',
      title: '❤️ HEALTH CHECK',
      data: data,
      actions: [
        { id: 'analyze', label: '📊 Analisis Mendalam', action: 'deep_analysis' },
        { id: 'recommend', label: '💡 Rekomendasi', action: 'get_recommendations' },
        { id: 'alert', label: '🔔 Setel Peringatan', action: 'set_alerts' }
      ]
    });
  }

  if (context === 'quick_actions') {
    components.push({
      type: 'action',
      variant: 'quick-actions',
      title: '⚡ QUICK ACTIONS',
      actions: actions || [],
      layout: 'grid'
    });
  }

  return createCountaMessage(
    `Response untuk konteks: ${context}`,
    components
  );
}
