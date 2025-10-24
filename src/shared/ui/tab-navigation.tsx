'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/shared/utils/cn';
import { Button } from './button';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Tab {
  id: string;
  title: string;
  href: string;
  isActive: boolean;
}

interface TabNavigationProps {
  className?: string;
  isCollapsed?: boolean;
  onToggleSidebar?: () => void;
  isMobileOpen?: boolean;
  onMobileToggle?: () => void;
}

export function TabNavigation({ className, isCollapsed = false, onToggleSidebar, isMobileOpen, onMobileToggle }: TabNavigationProps) {
  const pathname = usePathname();
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Generate tab title from pathname
  const generateTabTitle = (path: string) => {
    const segments = path.split('/').filter(Boolean);
    
    if (segments.length === 0 || (segments.length === 1 && segments[0] === 'dashboard')) {
      return 'Dashboard';
    }

    // Get the last segment and convert to readable title
    const lastSegment = segments[segments.length - 1];
    return lastSegment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Add new tab when pathname changes
  useEffect(() => {
    const newTab: Tab = {
      id: pathname,
      title: generateTabTitle(pathname),
      href: pathname,
      isActive: true
    };

    setTabs(prevTabs => {
      // Remove active state from other tabs
      const updatedTabs = prevTabs.map(tab => ({ ...tab, isActive: false }));
      
      // Check if tab already exists
      const existingTabIndex = updatedTabs.findIndex(tab => tab.href === pathname);
      
      if (existingTabIndex !== -1) {
        // Update existing tab to active
        updatedTabs[existingTabIndex].isActive = true;
        return updatedTabs;
      } else {
        // Add new tab
        return [...updatedTabs, newTab];
      }
    });
  }, [pathname]);

  const closeTab = (tabId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setTabs(prevTabs => {
      const newTabs = prevTabs.filter(tab => tab.id !== tabId);
      
      // If we're closing the active tab, make the last tab active
      if (newTabs.length > 0 && prevTabs.find(tab => tab.id === tabId)?.isActive) {
        newTabs[newTabs.length - 1].isActive = true;
      }
      
      return newTabs;
    });
  };

  return (
    <div className={cn('flex items-center bg-muted/30 border-b border-border relative', className)}>
      {/* Sidebar Toggle Button - All Screen Sizes */}
      {(onToggleSidebar || onMobileToggle) && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 ml-2 mr-1 shrink-0"
          onClick={() => {
            // On mobile, toggle mobile sidebar
            if (isMobile && onMobileToggle) {
              onMobileToggle();
            } else if (onToggleSidebar) {
              // On desktop, toggle sidebar collapse
              onToggleSidebar();
            }
          }}
        >
          {isMobile ? (
            // Mobile: show based on mobile state
            isMobileOpen ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )
          ) : (
            // Desktop: show based on collapse state
            isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )
          )}
        </Button>
      )}
      
      <div className="flex items-center overflow-x-auto scrollbar-hide flex-1 min-w-0 relative">
        {/* Scroll indicators for mobile */}
        <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-muted/30 to-transparent pointer-events-none z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-muted/30 to-transparent pointer-events-none z-10" />
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={cn(
              'flex items-center min-w-0 border-r border-border last:border-r-0 flex-shrink-0',
              tab.isActive
                ? 'bg-background border-b-2 border-b-primary'
                : 'bg-muted/50 hover:bg-muted/70'
            )}
          >
            <Link
              href={tab.href}
              className={cn(
                'flex items-center px-4 py-2 text-sm font-medium transition-colors min-w-0 whitespace-nowrap',
                tab.isActive
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <span className="truncate max-w-32 sm:max-w-48">{tab.title}</span>
            </Link>
            
            {tabs.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 ml-1 mr-2 hover:bg-destructive hover:text-destructive-foreground"
                onClick={(e) => closeTab(tab.id, e)}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
