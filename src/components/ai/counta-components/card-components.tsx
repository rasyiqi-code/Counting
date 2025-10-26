'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { CardComponent, ActionButton } from './types';
import { 
  Eye, 
  Edit, 
  Copy, 
  FileText, 
  Heart, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Calendar,
  User,
  Building
} from 'lucide-react';

interface CardComponentProps {
  component: CardComponent;
  onAction?: (actionId: string, action: string, data?: any) => void;
}

export function CountaCard({ component, onAction }: CardComponentProps) {
  const [isCompleted, setIsCompleted] = useState(false);

  const handleAction = (actionId: string, action: string, data: any) => {
    // Jika action adalah "record_expense" atau "confirm_transaction", set completed
    if (action === 'record_expense' || action === 'confirm_transaction' || action.includes('confirm')) {
      setIsCompleted(true);
    }
    onAction?.(actionId, action, data);
  };

  const renderTransactionCard = () => (
    <Card className="border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-green-800">
            {component.title}
          </CardTitle>
          {isCompleted && (
            <Badge variant="outline" className="bg-green-100 text-green-800">
              Berhasil
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-500" />
            <span className="font-medium">Deskripsi:</span>
            <span className="text-gray-700">{component.data.description}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-gray-500" />
            <span className="font-medium">Jumlah:</span>
            <span className="font-semibold text-green-700">
              {new Intl.NumberFormat('id-ID', { 
                style: 'currency', 
                currency: 'IDR' 
              }).format(component.data.amount)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-gray-500" />
            <span className="font-medium">Metode:</span>
            <span className="text-gray-700">{component.data.method}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="font-medium">Department:</span>
            <span className="text-gray-700">{component.data.department}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="font-medium">Tanggal:</span>
            <span className="text-gray-700">{component.data.date}</span>
          </div>
        </div>
        
        {component.actions && (
          <div className="flex flex-wrap gap-2 pt-3 border-t">
            {component.actions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                size="sm"
                onClick={() => handleAction(action.id, action.action, component.data)}
                className="text-xs"
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderFinancialHealthCard = () => (
    <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-blue-800">
            {component.title}
          </CardTitle>
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            {component.data.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 gap-3 text-sm">
          <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="font-medium">Arus Kas:</span>
            </div>
            <Badge className="bg-green-100 text-green-800">{component.data.cashFlow || 'Sehat'}</Badge>
          </div>
          
          {component.data.cash_balance !== undefined && (
            <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium">Saldo Kas:</span>
              </div>
              <span className="text-green-700 font-semibold">
                {new Intl.NumberFormat('id-ID', { 
                  style: 'currency', 
                  currency: 'IDR' 
                }).format(component.data.cash_balance)}
              </span>
            </div>
          )}
          
          <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="font-medium">{component.data.receivablesLabel || 'Piutang'}:</span>
            </div>
            <span className="text-yellow-700 font-semibold">
              {component.data.receivablesFormatted || (component.data.receivables !== undefined ? 
                new Intl.NumberFormat('id-ID', { 
                  style: 'currency', 
                  currency: 'IDR' 
                }).format(component.data.receivables) : 'Rp0')}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="font-medium">{component.data.profitLabel || 'Profit'}:</span>
            </div>
            <span className="text-blue-700 font-semibold">
              {component.data.profitFormatted || (component.data.profit !== undefined ? 
                `${component.data.profit}% (↑${component.data.profitIncrease || 0}% vs bulan lalu)` : 
                '0% (↑0% vs bulan lalu)')}
            </span>
          </div>
        </div>
        
        {component.actions && (
          <div className="flex flex-wrap gap-2 pt-3 border-t">
            {component.actions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                size="sm"
                onClick={() => handleAction(action.id, action.action, component.data)}
                className="text-xs"
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderDocumentCard = () => (
    <Card className="border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-purple-800">
            {component.title}
          </CardTitle>
          <Badge variant="outline" className="bg-purple-100 text-purple-800">
            {component.data.status || 'Baru'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-gray-500" />
            <span className="font-medium">{component.data.supplierLabel || 'Supplier'}:</span>
            <span className="text-gray-700">{component.data.supplier}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-gray-500" />
            <span className="font-medium">{component.data.totalLabel || 'Total'}:</span>
            <span className="font-semibold text-purple-700">
              {component.data.totalFormatted || new Intl.NumberFormat('id-ID', { 
                style: 'currency', 
                currency: 'IDR' 
              }).format(component.data.total)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="font-medium">{component.data.dateLabel || 'Tanggal'}:</span>
            <span className="text-gray-700">{component.data.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-500" />
            <span className="font-medium">{component.data.documentNumberLabel || 'No. Dokumen'}:</span>
            <span className="text-gray-700 font-mono text-xs">{component.data.documentNumber}</span>
          </div>
        </div>
        
        {component.actions && (
          <div className="flex flex-wrap gap-2 pt-3 border-t">
            {component.actions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                size="sm"
                onClick={() => handleAction(action.id, action.action, component.data)}
                className="text-xs"
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderSummaryCard = () => (
    <Card className="border-l-4 border-l-gray-500 bg-gradient-to-r from-gray-50 to-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-gray-800">
          📊 {component.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          {Object.entries(component.data).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="font-medium text-gray-600 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}:
              </span>
              <span className="text-gray-800">{String(value)}</span>
            </div>
          ))}
        </div>
        
        {component.actions && (
          <div className="flex flex-wrap gap-2 pt-3 border-t mt-3">
            {component.actions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                size="sm"
                onClick={() => handleAction(action.id, action.action, component.data)}
                className="text-xs"
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderInsightCard = () => (
    <Card className="border-l-4 border-l-indigo-500 bg-gradient-to-r from-indigo-50 to-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-indigo-800">
          💡 {component.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-gray-700">{component.data.insight}</p>
          {component.data.recommendations && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-800">Rekomendasi:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                {component.data.recommendations.map((rec: string, index: number) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {component.actions && (
          <div className="flex flex-wrap gap-2 pt-3 border-t mt-3">
            {component.actions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                size="sm"
                onClick={() => handleAction(action.id, action.action, component.data)}
                className="text-xs"
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Use cardType if available, otherwise fall back to variant
  const cardType = component.cardType || component.variant;
  
  switch (cardType) {
    case 'transaction':
    case 'transaction_summary':
      return renderTransactionCard();
    case 'financial-health':
    case 'financial_health':
      return renderFinancialHealthCard();
    case 'document':
      return renderDocumentCard();
    case 'summary':
      return renderSummaryCard();
    case 'insight':
      return renderInsightCard();
    default:
      return renderSummaryCard();
  }
}
