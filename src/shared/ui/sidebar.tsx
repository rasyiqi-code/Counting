'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/shared/utils/cn';
import {
  LayoutDashboard,
  Database,
  ShoppingCart,
  ShoppingBag,
  Warehouse,
  FileText,
  Banknote,
  Building2,
  Calendar,
  Settings,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Button } from './button';

const menuItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Master Data',
    href: '/master',
    icon: Database,
    subItems: [
      { title: 'Chart of Accounts', href: '/master/coa' },
      { title: 'Customers', href: '/master/customers' },
      { title: 'Vendors', href: '/master/vendors' },
      { title: 'Products', href: '/master/products' },
      { title: 'Bank Accounts', href: '/master/bank-accounts' },
    ],
  },
  {
    title: 'Penjualan',
    href: '/sales',
    icon: ShoppingCart,
    subItems: [
      { title: 'Invoices', href: '/sales/invoices' },
      { title: 'Payments', href: '/sales/payments' },
      { title: 'AR Aging', href: '/sales/ar-aging' },
    ],
  },
  {
    title: 'Pembelian',
    href: '/purchases',
    icon: ShoppingBag,
    subItems: [
      { title: 'Bills', href: '/purchases/bills' },
      { title: 'Payments', href: '/purchases/payments' },
      { title: 'AP Aging', href: '/purchases/ap-aging' },
    ],
  },
  {
    title: 'Persediaan',
    href: '/inventory',
    icon: Warehouse,
    subItems: [
      { title: 'Stock Card', href: '/inventory/stock-card' },
      { title: 'Adjustments', href: '/inventory/adjustments' },
      { title: 'Transfers', href: '/inventory/transfers' },
      { title: 'Valuation', href: '/inventory/valuation' },
    ],
  },
  {
    title: 'Buku Besar',
    href: '/general-ledger',
    icon: BookOpen,
    subItems: [
      { title: 'Journals', href: '/general-ledger/journals' },
      { title: 'Ledger', href: '/general-ledger/ledger' },
      { title: 'Trial Balance', href: '/general-ledger/trial-balance' },
    ],
  },
  {
    title: 'Laporan',
    href: '/reports',
    icon: FileText,
    subItems: [
      { title: 'Income Statement', href: '/reports/income-statement' },
      { title: 'Balance Sheet', href: '/reports/balance-sheet' },
      { title: 'Cash Flow', href: '/reports/cash-flow' },
      { title: 'Tax Reports', href: '/reports/tax' },
    ],
  },
  {
    title: 'Kas & Bank',
    href: '/cash-bank',
    icon: Banknote,
    subItems: [
      { title: 'Other Income', href: '/cash-bank/other-income' },
      { title: 'Other Expense', href: '/cash-bank/other-expense' },
      { title: 'Bank Transfer', href: '/cash-bank/bank-transfer' },
    ],
  },
  {
    title: 'Aset Tetap',
    href: '/fixed-assets',
    icon: Building2,
    subItems: [
      { title: 'Assets Register', href: '/fixed-assets/register' },
      { title: 'Depreciation', href: '/fixed-assets/depreciation' },
      { title: 'Disposal', href: '/fixed-assets/disposal' },
    ],
  },
  {
    title: 'Tutup Buku',
    href: '/period',
    icon: Calendar,
    subItems: [
      { title: 'Monthly Closing', href: '/period/monthly-closing' },
      { title: 'Year-End Closing', href: '/period/year-end-closing' },
    ],
  },
  {
    title: 'Pengaturan',
    href: '/settings',
    icon: Settings,
  },
];

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  isMobileOpen?: boolean;
  onMobileToggle?: () => void;
}

export function Sidebar({ isCollapsed: propIsCollapsed, onToggle, isMobileOpen: propIsMobileOpen, onMobileToggle }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(propIsCollapsed ?? true);
  const [isMobileOpen, setIsMobileOpen] = useState(propIsMobileOpen ?? false);
  const [isMobile, setIsMobile] = useState(false);

  // Sync with prop changes
  React.useEffect(() => {
    if (propIsCollapsed !== undefined) {
      setIsCollapsed(propIsCollapsed);
    }
  }, [propIsCollapsed]);

  // Sync mobile state with props
  React.useEffect(() => {
    if (propIsMobileOpen !== undefined) {
      setIsMobileOpen(propIsMobileOpen);
    }
  }, [propIsMobileOpen]);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile sidebar when route changes
  useEffect(() => {
    if (isMobileOpen) {
      setIsMobileOpen(false);
      // Don't call onMobileToggle here to avoid infinite loop
    }
  }, [pathname]);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      if (mobile) {
        // On mobile, close mobile sidebar when resizing
        setIsMobileOpen(false);
        // Don't call onMobileToggle here to avoid infinite loop
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => {
            setIsMobileOpen(false);
            // Call parent toggle to sync state
            onMobileToggle?.();
          }}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed lg:sticky top-0 left-0 z-40 h-screen bg-background border-r border-border transition-all duration-300 ease-in-out overflow-hidden shadow-lg',
          isCollapsed ? 'w-16' : 'w-64',
          // Mobile
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        style={{ 
          // Solid background, no transparency
          backgroundColor: 'hsl(var(--background))',
          borderColor: 'hsl(var(--border))',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)'
        }}
      >

        {/* Navigation */}
        <nav className="p-4 space-y-2 overflow-y-auto overflow-x-hidden h-screen scrollbar-hide bg-background/95 backdrop-blur-sm">
          {menuItems.map((item) => (
            <div key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 group relative',
                  pathname === item.href || pathname?.startsWith(item.href + '/')
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:shadow-sm',
                  isCollapsed && 'justify-center gap-0 px-2'
                )}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span className="truncate">{item.title}</span>}
              </Link>

              {/* SubItems - Hidden when collapsed */}
              {item.subItems && !isCollapsed && pathname?.startsWith(item.href) && (
                <div className="ml-7 mt-1 space-y-1">
                  {item.subItems.map((subItem) => (
                    <Link
                      key={subItem.href}
                      href={subItem.href}
                      className={cn(
                        'block px-3 py-1.5 rounded-md text-xs transition-all duration-200',
                        pathname === subItem.href
                          ? 'bg-secondary text-secondary-foreground font-medium shadow-sm'
                          : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground hover:shadow-sm'
                      )}
                    >
                      {subItem.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

    </>
  );
}
