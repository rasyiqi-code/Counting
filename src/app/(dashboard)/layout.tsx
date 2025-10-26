'use client';

import { Sidebar } from '@/shared/ui/sidebar';
import { TopNavigation } from '@/shared/ui/top-navigation';
import { FloatingAIButton } from '@/components/ai/floating-ai-button';
import { useState, useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  // Detect mobile and set appropriate default states
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      if (mobile) {
        // On mobile: sidebar should be expanded by default
        setIsCollapsed(false);
      } else {
        // On desktop: sidebar can be collapsed by default
        setIsCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="grid grid-cols-[auto_1fr] h-screen overflow-hidden">
      <Sidebar 
        isCollapsed={isCollapsed} 
        onToggle={toggleSidebar}
        isMobileOpen={isMobileOpen}
        onMobileToggle={toggleMobile}
      />
      <div className="flex flex-col overflow-hidden">
        <TopNavigation 
          isCollapsed={isCollapsed}
          onToggleSidebar={toggleSidebar}
          isMobileOpen={isMobileOpen}
          onMobileToggle={toggleMobile}
        />
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="min-h-full">
            {children}
          </div>
        </main>
      </div>
      
      {/* Floating AI Button */}
      <FloatingAIButton />
    </div>
  );
}

