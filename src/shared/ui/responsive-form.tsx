'use client';

import { cn } from '../utils/cn';

interface FormGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function FormGrid({ children, columns = 2, className }: FormGridProps) {
  const gridClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }[columns];

  return (
    <div className={cn('grid gap-4', gridClass, className)}>
      {children}
    </div>
  );
}

interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({ title, description, children, className }: FormSectionProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

interface FormActionsProps {
  children: React.ReactNode;
  align?: 'left' | 'right' | 'center';
  className?: string;
}

export function FormActions({ children, align = 'right', className }: FormActionsProps) {
  const alignClass = {
    left: 'justify-start',
    right: 'justify-end',
    center: 'justify-center',
  }[align];

  return (
    <div className={cn('flex flex-col sm:flex-row gap-3 pt-6 border-t', alignClass, className)}>
      {children}
    </div>
  );
}

