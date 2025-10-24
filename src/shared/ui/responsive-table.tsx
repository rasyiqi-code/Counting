'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';
import { Card } from './card';
import { cn } from '../utils/cn';

interface ResponsiveTableProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveTable({ children, className }: ResponsiveTableProps) {
  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden border rounded-lg">
          {children}
        </div>
      </div>
    </div>
  );
}

// Mobile Card View Component for Tables
interface MobileCardItem {
  label: string;
  value: React.ReactNode;
  className?: string;
}

interface MobileCardProps {
  items: MobileCardItem[];
  actions?: React.ReactNode;
  className?: string;
}

export function MobileCard({ items, actions, className }: MobileCardProps) {
  return (
    <Card className={cn('p-4 space-y-3', className)}>
      {items.map((item, index) => (
        <div key={index} className="flex justify-between items-start gap-4">
          <span className="text-sm font-medium text-muted-foreground min-w-[100px]">
            {item.label}
          </span>
          <span className={cn('text-sm text-right flex-1', item.className)}>
            {item.value}
          </span>
        </div>
      ))}
      {actions && (
        <div className="pt-3 border-t flex justify-end gap-2">
          {actions}
        </div>
      )}
    </Card>
  );
}

// Export Table components for convenience
export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow };

