'use client';

import { useEffect, useState } from 'react';

// Floating particles effect
export function FloatingParticles() {
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, delay: number}>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-30 animate-pulse"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: '3s'
          }}
        />
      ))}
    </div>
  );
}

// Gradient border effect
export function GradientBorder({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg p-[1px]">
        <div className="bg-white rounded-lg h-full w-full">
          {children}
        </div>
      </div>
    </div>
  );
}

// Animated background
export function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,rgba(120,219,255,0.1),transparent_50%)]" />
    </div>
  );
}

// Typing animation
export function TypingAnimation({ text, speed = 50 }: { text: string, speed?: number }) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed]);

  return <span>{displayText}</span>;
}

// Magic sparkle effect
export function MagicSparkle({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute ${className}`}>
      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
      <div className="w-1 h-1 bg-yellow-300 rounded-full absolute top-0.5 left-0.5 animate-pulse" />
    </div>
  );
}

// Glow effect
export function GlowEffect({ children, color = 'blue' }: { children: React.ReactNode, color?: 'blue' | 'purple' | 'pink' | 'green' }) {
  const colorClasses = {
    blue: 'shadow-blue-500/50',
    purple: 'shadow-purple-500/50',
    pink: 'shadow-pink-500/50',
    green: 'shadow-green-500/50'
  };

  return (
    <div className={`relative ${colorClasses[color]}`}>
      <div className="absolute inset-0 bg-current opacity-20 blur-xl" />
      <div className="relative">
        {children}
      </div>
    </div>
  );
}
