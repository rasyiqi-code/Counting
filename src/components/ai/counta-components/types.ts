// Counta Universal Remote Control - Component Types
// Library komponen untuk chat interface yang powerful

export interface CountaMessage {
  id: string;
  type: 'user' | 'ai';
  timestamp: Date;
  components: CountaComponent[];
  metadata?: {
    module?: string;
    context?: any;
    permissions?: string[];
  };
}

export type CountaComponent = 
  | TextComponent
  | CardComponent
  | TableComponent
  | ChartComponent
  | FormComponent
  | ActionComponent
  | StatusComponent
  | CalendarComponent
  | NotificationComponent;

// ===== TEXT COMPONENTS =====
export interface TextComponent {
  type: 'text';
  content: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  align?: 'left' | 'center' | 'right';
}

// ===== CARD COMPONENTS =====
export interface CardComponent {
  type: 'card';
  variant?: 'transaction' | 'financial-health' | 'document' | 'summary' | 'insight';
  cardType?: 'transaction_summary' | 'financial_health' | 'document' | 'summary' | 'insight';
  title: string;
  subtitle?: string;
  data: any;
  actions?: ActionButton[];
  status?: 'success' | 'warning' | 'error' | 'info' | 'pending';
}

export interface ActionButton {
  id: string;
  label: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  action: string;
  disabled?: boolean;
}

// ===== TABLE COMPONENTS =====
export interface TableComponent {
  type: 'table';
  variant?: 'editable' | 'reconciliation' | 'data' | 'comparison';
  tableType?: 'editable_transaction' | 'quick_reconciliation' | 'generic';
  title: string;
  columns: TableColumn[];
  rows: TableRow[];
  actions?: TableAction[];
  editable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
}

export interface TableColumn {
  key: string;
  label: string;
  type: 'text' | 'number' | 'currency' | 'date' | 'status' | 'action';
  width?: string;
  editable?: boolean;
  format?: string;
}

export interface TableRow {
  id: string;
  data: Record<string, any>;
  status?: 'success' | 'warning' | 'error' | 'pending';
  actions?: ActionButton[];
}

export interface TableAction {
  id: string;
  label: string;
  icon?: string;
  action: string;
  variant?: 'primary' | 'secondary' | 'danger';
}

// ===== CHART COMPONENTS =====
export interface ChartComponent {
  type: 'chart';
  variant: 'line' | 'bar' | 'pie' | 'trend' | 'comparison';
  title: string;
  data: ChartData;
  options?: ChartOptions;
  actions?: ActionButton[];
  interactive?: boolean;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
}

export interface ChartOptions {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  plugins?: any;
  scales?: any;
}

// ===== FORM COMPONENTS =====
export interface FormComponent {
  type: 'form';
  variant: 'inline-edit' | 'categorical' | 'search' | 'filter';
  title: string;
  fields: FormField[];
  actions?: ActionButton[];
  validation?: ValidationRule[];
}

export interface FormField {
  id: string;
  type: 'text' | 'number' | 'select' | 'date' | 'textarea' | 'search';
  label: string;
  value: any;
  placeholder?: string;
  options?: SelectOption[];
  required?: boolean;
  disabled?: boolean;
  validation?: ValidationRule[];
}

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: string;
}

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
}

// ===== ACTION COMPONENTS =====
export interface ActionComponent {
  type: 'action' | 'action_group';
  variant: 'context-aware' | 'quick-actions' | 'workflow' | 'approval';
  title: string;
  actions: ActionButton[];
  layout?: 'grid' | 'list' | 'stack';
  context?: any;
}

// ===== STATUS COMPONENTS =====
export interface StatusComponent {
  type: 'status';
  variant: 'progress' | 'health' | 'process' | 'system';
  title: string;
  status: 'success' | 'warning' | 'error' | 'info' | 'pending';
  message: string;
  progress?: number;
  steps?: StatusStep[];
  actions?: ActionButton[];
}

export interface StatusStep {
  id: string;
  label: string;
  status: 'completed' | 'current' | 'pending' | 'error';
  timestamp?: Date;
}

// ===== CALENDAR COMPONENTS =====
export interface CalendarComponent {
  type: 'calendar';
  variant: 'date-picker' | 'timeline' | 'schedule';
  title: string;
  selectedDate?: Date;
  events?: CalendarEvent[];
  actions?: ActionButton[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'due' | 'reminder' | 'meeting' | 'deadline';
  status?: 'completed' | 'pending' | 'overdue';
}

// ===== NOTIFICATION COMPONENTS =====
export interface NotificationComponent {
  type: 'notification';
  variant: 'alert' | 'reminder' | 'approval' | 'system';
  title: string;
  message: string;
  severity: 'info' | 'success' | 'warning' | 'error';
  actions?: ActionButton[];
  dismissible?: boolean;
  autoClose?: number;
}

// ===== RESPONSE COMPOSER =====
export class ResponseComposer {
  // DEPRECATED: Helper functions tidak dipakai lagi karena AI yang menentukan komponen
  // static createTransactionResponse(transaction: any): CountaComponent[] {
  //   return [
  //     {
  //       type: 'card',
  //       variant: 'transaction',
  //       title: '🛒 TRANSAKSI DICATAT',
  //       data: transaction,
  //       status: 'success',
  //       actions: [
  //         { id: 'view', label: '👁️ Detail', action: 'view_transaction' },
  //         { id: 'edit', label: '✏️ Edit', action: 'edit_transaction' },
  //         { id: 'duplicate', label: '🔄 Duplikat', action: 'duplicate_transaction' }
  //       ]
  //     }
  //   ];
  // }

  // static createFinancialHealthResponse(data: any): CountaComponent[] {
  //   return [
  //     {
  //       type: 'card',
  //       variant: 'financial-health',
  //       title: '❤️ HEALTH CHECK',
  //       data: data,
  //       actions: [
  //         { id: 'analyze', label: '📊 Analisis Mendalam', action: 'deep_analysis' },
  //         { id: 'recommend', label: '💡 Rekomendasi', action: 'get_recommendations' },
  //         { id: 'alert', label: '🔔 Setel Peringatan', action: 'set_alerts' }
  //       ]
  //     }
  //   ];
  // }

  // static createDocumentResponse(document: any): CountaComponent[] {
  //   return [
  //     {
  //       type: 'card',
  //       variant: 'document',
  //       title: '📄 DOKUMEN',
  //       data: document,
  //       actions: [
  //         { id: 'view', label: '📋 Lihat Detail', action: 'view_document' },
  //         { id: 'extract', label: '📋 Extract Data', action: 'extract_data' },
  //         { id: 'match', label: '🧾 Match Transaksi', action: 'match_transaction' }
  //       ]
  //     }
  //   ];
  // }

  // static createEditableTableResponse(data: any): CountaComponent[] {
  //   return [
  //     {
  //       type: 'table',
  //       variant: 'editable',
  //       title: '📋 EDIT TRANSAKSI',
  //       columns: [
  //         { key: 'field', label: 'Field', type: 'text' },
  //         { key: 'value', label: 'Nilai Saat Ini', type: 'text', editable: true },
  //         { key: 'action', label: 'Aksi', type: 'action' }
  //       ],
  //       rows: data.fields.map((field: any) => ({
  //         id: field.id,
  //         data: field,
  //         actions: [
  //           { id: 'edit', label: '✏️ Edit', action: 'edit_field' }
  //         ]
  //       })),
  //       actions: [
  //         { id: 'save', label: '💾 Simpan Perubahan', action: 'save_changes' },
  //         { id: 'cancel', label: '❌ Batalkan', action: 'cancel_edit' }
  //       ]
  //     }
  //   ];
  // }

  static createQuickActionsResponse(actions: any[]): CountaComponent[] {
    return [
      {
        type: 'action',
        variant: 'quick-actions',
        title: '⚡ QUICK ACTIONS',
        actions: actions,
        layout: 'grid'
      }
    ];
  }

  static createStatusResponse(status: any): CountaComponent[] {
    return [
      {
        type: 'status',
        variant: 'system',
        title: '🏥 SISTEM SEHAT',
        status: 'success',
        message: `Response time: ${status.responseTime}ms`,
        steps: status.components?.map((comp: any) => ({
          id: comp.id,
          label: comp.name,
          status: comp.status === 'online' ? 'completed' : 'error'
        })),
        actions: [
          { id: 'test', label: '🔧 Test Koneksi', action: 'test_connection' },
          { id: 'report', label: '📈 Performance Report', action: 'performance_report' }
        ]
      }
    ];
  }
}
