'use client';

import { cn } from '../utils/cn';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export function PageWrapper({ 
  children, 
  className,
  maxWidth = 'full'
}: PageWrapperProps) {
  const maxWidthClass = {
    none: 'max-w-none',
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full'
  }[maxWidth];

  return (
    <div className={cn(
      'p-4 sm:p-6 lg:p-8 w-full',
      maxWidthClass,
      className
    )}>
      {children}
    </div>
  );
}

interface PageGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
  responsive?: boolean;
}

export function PageGrid({ 
  children, 
  columns = 2, 
  className,
  responsive = true
}: PageGridProps) {
  const getGridClass = () => {
    if (!responsive) {
      return `grid-cols-${columns}`;
    }

    // Responsive grid classes
    const responsiveClasses = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
      5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
      6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'
    };

    return responsiveClasses[columns];
  };

  return (
    <div className={cn(
      'grid gap-4 sm:gap-6',
      getGridClass(),
      className
    )}>
      {children}
    </div>
  );
}

interface PageSectionProps {
  children: React.ReactNode;
  className?: string;
  spacing?: 'none' | 'sm' | 'md' | 'lg';
}

export function PageSection({ 
  children, 
  className,
  spacing = 'md'
}: PageSectionProps) {
  const spacingClass = {
    none: '',
    sm: 'mb-4 sm:mb-6',
    md: 'mb-6 sm:mb-8',
    lg: 'mb-8 sm:mb-12'
  }[spacing];

  return (
    <div className={cn(spacingClass, className)}>
      {children}
    </div>
  );
}
