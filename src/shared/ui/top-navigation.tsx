'use client';

import { TabNavigation } from './tab-navigation';

interface TopNavigationProps {
  className?: string;
  isCollapsed?: boolean;
  onToggleSidebar?: () => void;
  isMobileOpen?: boolean;
  onMobileToggle?: () => void;
}

export function TopNavigation({ className, isCollapsed, onToggleSidebar, isMobileOpen, onMobileToggle }: TopNavigationProps) {
  return (
    <div className={`bg-background ${className}`}>
      {/* Tab Navigation */}
      <TabNavigation 
        isCollapsed={isCollapsed}
        onToggleSidebar={onToggleSidebar}
        isMobileOpen={isMobileOpen}
        onMobileToggle={onMobileToggle}
      />
    </div>
  );
}
