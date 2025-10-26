'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Badge } from '@/shared/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { TableComponent, TableRow as TableRowType, ActionButton } from './types';
import { 
  Edit, 
  Save, 
  X, 
  Check, 
  AlertTriangle,
  Clock,
  DollarSign,
  Calendar,
  User,
  Building,
  Search,
  Filter,
  FileText
} from 'lucide-react';

interface TableComponentProps {
  component: TableComponent;
  onAction?: (actionId: string, action: string, data?: any) => void;
  onCellEdit?: (rowId: string, field: string, value: any) => void;
}

export function CountaTable({ component, onAction, onCellEdit }: TableComponentProps) {
  const [editingCell, setEditingCell] = useState<{rowId: string, field: string} | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleCellEdit = (rowId: string, field: string, currentValue: any) => {
    setEditingCell({ rowId, field });
    setEditValue(currentValue);
  };

  const handleCellSave = () => {
    if (editingCell) {
      onCellEdit?.(editingCell.rowId, editingCell.field, editValue);
      setEditingCell(null);
      setEditValue('');
    }
  };

  const handleCellCancel = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const renderEditableTable = () => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-gray-800">
          📋 {component.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {component.columns.map((column) => (
                <TableHead key={column.key} className="font-semibold">
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {component.rows.map((row) => (
              <TableRow key={row.id} className="hover:bg-gray-50">
                {component.columns.map((column) => (
                  <TableCell key={column.key} className="py-3">
                    {column.type === 'action' ? (
                      <div className="flex gap-1">
                        {row.actions?.map((action) => (
                          <Button
                            key={action.id}
                            variant="ghost"
                            size="sm"
                            onClick={() => onAction?.(action.id, action.action, row.data)}
                            className="h-8 w-8 p-0"
                          >
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    ) : editingCell?.rowId === row.id && editingCell?.field === column.key ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="h-8 text-sm"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          onClick={handleCellSave}
                          className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCellCancel}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-sm">
                          {column.type === 'currency' 
                            ? new Intl.NumberFormat('id-ID', { 
                                style: 'currency', 
                                currency: 'IDR' 
                              }).format(row.data[column.key])
                            : row.data[column.key]
                          }
                        </span>
                        {column.editable && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCellEdit(row.id, column.key, row.data[column.key])}
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {component.actions && (
          <div className="flex flex-wrap gap-2 pt-4 border-t mt-4">
            {component.actions.map((action) => (
              <Button
                key={action.id}
                variant={action.variant === 'primary' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onAction?.(action.id, action.action)}
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

  const renderReconciliationTable = () => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-blue-800">
          🔄 {component.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">Bank Statement</TableHead>
              <TableHead className="font-semibold">Counta Records</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {component.rows.map((row) => (
              <TableRow key={row.id} className="hover:bg-gray-50">
                <TableCell className="py-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{row.data.bankDescription}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Intl.NumberFormat('id-ID', { 
                        style: 'currency', 
                        currency: 'IDR' 
                      }).format(row.data.bankAmount)}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3">
                  {row.data.countaRecord ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{row.data.countaRecord}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Intl.NumberFormat('id-ID', { 
                          style: 'currency', 
                          currency: 'IDR' 
                        }).format(row.data.countaAmount)}
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400 italic">Tidak ada record</span>
                  )}
                </TableCell>
                <TableCell className="py-3">
                  <Badge 
                    variant={row.status === 'success' ? 'default' : 'secondary'}
                    className={
                      row.status === 'success' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }
                  >
                    {row.status === 'success' ? '✅ Linked' : '⏳ Pending'}
                  </Badge>
                </TableCell>
                <TableCell className="py-3">
                  <div className="flex gap-1">
                    {row.actions?.map((action) => (
                      <Button
                        key={action.id}
                        variant="outline"
                        size="sm"
                        onClick={() => onAction?.(action.id, action.action, row.data)}
                        className="text-xs"
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {component.actions && (
          <div className="flex flex-wrap gap-2 pt-4 border-t mt-4">
            {component.actions.map((action) => (
              <Button
                key={action.id}
                variant={action.variant === 'primary' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onAction?.(action.id, action.action)}
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

  const renderDataTable = () => (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-gray-800">
            📊 {component.title}
          </CardTitle>
          {component.filterable && (
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari..."
                  className="pl-8 h-8 text-sm"
                />
              </div>
              <Button variant="outline" size="sm" className="h-8">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {component.columns.map((column) => (
                <TableHead key={column.key} className="font-semibold">
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {component.rows.map((row) => (
              <TableRow key={row.id} className="hover:bg-gray-50">
                {component.columns.map((column) => (
                  <TableCell key={column.key} className="py-3">
                    {column.type === 'status' ? (
                      <Badge 
                        variant={row.status === 'success' ? 'default' : 'secondary'}
                        className={
                          row.status === 'success' 
                            ? 'bg-green-100 text-green-800' 
                            : row.status === 'warning'
                            ? 'bg-yellow-100 text-yellow-800'
                            : row.status === 'error'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }
                      >
                        {row.data[column.key]}
                      </Badge>
                    ) : column.type === 'currency' ? (
                      <span className="font-medium">
                        {new Intl.NumberFormat('id-ID', { 
                          style: 'currency', 
                          currency: 'IDR' 
                        }).format(row.data[column.key])}
                      </span>
                    ) : (
                      <span className="text-sm">{row.data[column.key]}</span>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {component.actions && (
          <div className="flex flex-wrap gap-2 pt-4 border-t mt-4">
            {component.actions.map((action) => (
              <Button
                key={action.id}
                variant={action.variant === 'primary' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onAction?.(action.id, action.action)}
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

  // Use tableType if available, otherwise fall back to variant
  const tableType = component.tableType || component.variant;
  
  switch (tableType) {
    case 'editable':
    case 'editable_transaction':
      return renderEditableTable();
    case 'reconciliation':
    case 'quick_reconciliation':
      return renderReconciliationTable();
    case 'data':
    case 'comparison':
    case 'generic':
      return renderDataTable();
    default:
      return renderDataTable();
  }
}
