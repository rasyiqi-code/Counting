'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/shared/ui/button';
import { Bot, Sparkles, X, Zap } from 'lucide-react';
import { SmartChatAISDK } from './smart-chat-ai-sdk';

export function FloatingAIButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showPulse, setShowPulse] = useState(true);
  const [currentModule, setCurrentModule] = useState('general');

  // Auto pulse effect
  useEffect(() => {
    const interval = setInterval(() => {
      setShowPulse(prev => !prev);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Detect current module from URL
  useEffect(() => {
    const detectModule = () => {
      const path = window.location.pathname;
      if (path.includes('/master/')) return 'master-data';
      if (path.includes('/sales/')) return 'sales';
      if (path.includes('/purchases/')) return 'purchases';
      if (path.includes('/inventory/')) return 'inventory';
      if (path.includes('/general-ledger/')) return 'general-ledger';
      if (path.includes('/cash-bank/')) return 'cash-bank';
      if (path.includes('/fixed-assets/')) return 'fixed-assets';
      if (path.includes('/reports/')) return 'reports';
      if (path.includes('/settings/')) return 'settings';
      return 'general';
    };

    setCurrentModule(detectModule());
    
    // Listen for module changes (e.g., navigation)
    const handlePopState = () => {
      setCurrentModule(detectModule());
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Listen for smart suggestion apply event
  useEffect(() => {
    const handleApplySuggestion = (event: CustomEvent) => {
      const suggestion = event.detail;
      console.log('Smart suggestion applied:', suggestion);
      // Here you can implement specific actions based on suggestion
      // For example, redirect to specific pages, open forms, etc.
    };

    const handleCOASuggestion = (event: CustomEvent) => {
      const suggestion = event.detail;
      console.log('COA suggestion applied:', suggestion);
      // Open AI chat to show the suggestion
      setIsOpen(true);
      // You can pass the suggestion to the chat component
      setCurrentModule('master-data');
    };

    const handleCOAAccountCreated = (event: CustomEvent) => {
      const accountData = event.detail;
      console.log('New COA account created:', accountData);
      // Show success message in AI chat
      setIsOpen(true);
      setCurrentModule('master-data');
    };

    window.addEventListener('smart-ai-apply-suggestion', handleApplySuggestion as EventListener);
    window.addEventListener('coa-ai-apply-suggestion', handleCOASuggestion as EventListener);
    window.addEventListener('coa-account-created', handleCOAAccountCreated as EventListener);
    
    return () => {
      window.removeEventListener('smart-ai-apply-suggestion', handleApplySuggestion as EventListener);
      window.removeEventListener('coa-ai-apply-suggestion', handleCOASuggestion as EventListener);
      window.removeEventListener('coa-account-created', handleCOAAccountCreated as EventListener);
    };
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Floating AI Button */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40">
        {/* Multiple Pulse Ring Effects */}
        <div className="absolute inset-0 rounded-full pointer-events-none">
          {/* Ring 1 */}
          <div 
            className={`absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/30 to-purple-600/30 transition-all duration-1000 ${
              showPulse ? 'scale-150 animate-ping' : 'scale-100'
            }`}
            style={{ animationDelay: '0s' }}
          />
          {/* Ring 2 */}
          <div 
            className={`absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-600/20 transition-all duration-1000 ${
              showPulse ? 'scale-125 animate-ping' : 'scale-100'
            }`}
            style={{ animationDelay: '0.5s' }}
          />
          {/* Ring 3 */}
          <div 
            className={`absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/15 to-blue-600/15 transition-all duration-1000 ${
              showPulse ? 'scale-110 animate-ping' : 'scale-100'
            }`}
            style={{ animationDelay: '1s' }}
          />
        </div>

        {/* Main Button */}
        <Button
          onClick={() => {
            // Haptic feedback for mobile
            if ('vibrate' in navigator) {
              navigator.vibrate(50);
            }
            setIsOpen(true);
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`
            h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-2xl hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] 
            transition-all duration-300 border-2 border-white/20 relative overflow-hidden
            bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500
            hover:from-blue-600 hover:via-purple-700 hover:to-pink-600
            hover:scale-110 active:scale-95
            ${isHovered ? 'shadow-blue-500/60' : 'shadow-blue-500/40'}
            group
          `}
          size="lg"
        >
          {/* Shimmer Effect */}
          <div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent 
                       transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] 
                       transition-transform duration-1000"
          />
          
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)] animate-pulse" />
          </div>

          {/* Button Content */}
          <div className="relative z-10 flex items-center justify-center">
            <Bot className={`h-5 w-5 sm:h-6 sm:w-6 text-white drop-shadow-lg transition-all duration-300 ${
              isHovered ? 'rotate-12 scale-110' : ''
            }`} />
          </div>

          {/* Glowing Dot */}
          <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
        </Button>
        
        {/* AI Sparkle Effects */}
        <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 pointer-events-none">
          <div className="relative">
            <Sparkles className={`h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 drop-shadow-lg transition-all duration-500 ${showPulse ? 'animate-bounce' : 'animate-pulse'}`} />
            <div className="absolute inset-0 bg-yellow-400 blur-md opacity-50 animate-ping" />
          </div>
        </div>
        
        <div className="absolute -bottom-1 -left-1 pointer-events-none">
          <div className="relative">
            <Zap className={`h-3 w-3 sm:h-4 sm:w-4 text-cyan-400 drop-shadow-lg transition-all duration-700 ${showPulse ? 'animate-pulse' : 'opacity-60'}`} />
            <div className="absolute inset-0 bg-cyan-400 blur-sm opacity-40 animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
        </div>

        {/* Enhanced Tooltip - Hidden on mobile */}
        <div 
          className={`
            absolute right-16 top-1/2 -translate-y-1/2 
            bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white px-4 py-2.5 rounded-xl text-sm font-semibold
            shadow-2xl shadow-blue-500/20 border border-gray-700/50
            transition-all duration-300 pointer-events-none
            hidden sm:block backdrop-blur-sm
            ${isHovered ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-2 scale-95'}
          `}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-3 w-3 text-yellow-400 animate-pulse" />
            <span>AI Assistant</span>
          </div>
          {/* Arrow */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-2 h-2 bg-gradient-to-br from-gray-800 to-gray-900 rotate-45 border-r border-b border-gray-700/50" />
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl animate-pulse" />
        </div>
      </div>

      {/* Smart Chat AI SDK Modal */}
      <SmartChatAISDK 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
        currentModule={currentModule}
      />
    </>
  );
}
