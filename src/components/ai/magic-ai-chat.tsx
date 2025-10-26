'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { AIProviderSelector } from './ai-provider-selector';
import { Bot, Send, User, Sparkles } from 'lucide-react';
import type { ProviderName } from '@/lib/ai/config';
import { getDefaultProvider } from '@/lib/ai/config';
import { FloatingParticles, AnimatedBackground, MagicSparkle, GlowEffect } from './magic-effects';

interface MagicAIChatProps {
  className?: string;
  initialProvider?: ProviderName;
}

export function MagicAIChat({ className, initialProvider }: MagicAIChatProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{id: string, role: 'user' | 'assistant', content: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ProviderName>(initialProvider || getDefaultProvider());

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const userMessage = { id: Date.now().toString(), role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/completion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: input,
          provider: selectedProvider 
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');
      
      const data = await response.json();
      const aiMessage = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant' as const, 
        content: data.text 
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI Error:', error);
      const errorMessage = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant' as const, 
        content: 'Sorry, I encountered an error. Please try again.' 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={className}>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1">
          <AIProviderSelector
            selectedProvider={selectedProvider}
            onProviderChange={setSelectedProvider}
          />
        </div>
        
        <div className="lg:col-span-3">
          <Card className="relative overflow-hidden">
            <AnimatedBackground />
            <FloatingParticles />
            
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2">
                <GlowEffect color="blue">
                  <div className="relative">
                    <Bot className="h-5 w-5" />
                    <MagicSparkle className="-top-1 -right-1" />
                  </div>
                </GlowEffect>
                AI Assistant
                <div className="ml-auto">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span>Connected</span>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="relative">
              <div className="space-y-4">
                <ScrollArea className="h-96 w-full border rounded-lg p-4 bg-white/50 backdrop-blur-sm">
                  <div className="space-y-4">
                    {messages.length === 0 && (
                      <div className="text-center text-muted-foreground py-8">
                        <GlowEffect color="purple">
                          <div className="relative mb-4">
                            <Bot className="h-12 w-12 mx-auto opacity-50" />
                            <MagicSparkle className="top-0 right-0" />
                            <MagicSparkle className="bottom-0 left-0" />
                          </div>
                        </GlowEffect>
                        <p className="text-lg font-medium">Start a conversation with AI</p>
                        <p className="text-sm">Ask about accounting, business, or any questions you have</p>
                        <div className="mt-4 flex flex-wrap gap-2 justify-center">
                          <Button variant="outline" size="sm" onClick={() => setInput("Bagaimana cara membuat jurnal penjualan?")}>
                            Journal Entry
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setInput("Jelaskan tentang Chart of Accounts")}>
                            Chart of Accounts
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setInput("Cara menghitung PPN")}>
                            Tax Calculation
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div className={`flex gap-3 max-w-[80%] ${
                          message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                        }`}>
                          <GlowEffect color={message.role === 'user' ? 'blue' : 'green'}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center relative ${
                              message.role === 'user' 
                                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                                : 'bg-gradient-to-r from-green-500 to-teal-500 text-white'
                            }`}>
                              {message.role === 'user' ? (
                                <User className="h-4 w-4" />
                              ) : (
                                <Bot className="h-4 w-4" />
                              )}
                              {message.role === 'assistant' && (
                                <MagicSparkle className="-top-1 -right-1" />
                              )}
                            </div>
                          </GlowEffect>
                          <div className={`rounded-lg px-4 py-2 relative ${
                            message.role === 'user'
                              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                              : 'bg-white/80 backdrop-blur-sm border shadow-sm'
                          }`}>
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            {message.role === 'assistant' && (
                              <MagicSparkle className="-bottom-1 -right-1" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {isLoading && (
                      <div className="flex gap-3">
                        <GlowEffect color="green">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center">
                            <Bot className="h-4 w-4 text-white" />
                          </div>
                        </GlowEffect>
                        <div className="bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2 border shadow-sm">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:0.1s]" />
                            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                
                <form onSubmit={onSubmit} className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    disabled={isLoading}
                    className="flex-1 bg-white/80 backdrop-blur-sm border-0 shadow-sm focus:ring-2 focus:ring-blue-500"
                  />
                  <GlowEffect color="blue">
                    <Button 
                      type="submit" 
                      disabled={isLoading || !input.trim()}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </GlowEffect>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
