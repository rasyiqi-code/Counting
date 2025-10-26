'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { providerInfo, getProviderConfig, type ProviderName } from '@/lib/ai/config';
import { Bot, Zap, Globe, Cpu, Database } from 'lucide-react';

interface AIProviderSelectorProps {
  selectedProvider: ProviderName;
  onProviderChange: (provider: ProviderName) => void;
  className?: string;
}

const providerIcons = {
  openai: Bot,
  claude: Bot,
  gemini: Globe,
  deepseek: Cpu,
  qwen: Cpu,
  glm: Cpu,
  grok: Zap,
  openrouter: Database,
  ollama: Cpu,
};

export function AIProviderSelector({ 
  selectedProvider, 
  onProviderChange, 
  className 
}: AIProviderSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentProvider = providerInfo[selectedProvider];
  const Icon = providerIcons[selectedProvider];

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            AI Provider
          </CardTitle>
          <CardDescription>
            Select your preferred AI provider for responses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Select value={selectedProvider} onValueChange={onProviderChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select AI provider" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(providerInfo).map(([key, info]) => {
                  const ProviderIcon = providerIcons[key as ProviderName];
                  const config = getProviderConfig(key as ProviderName);
                  const isEnabled = config?.isEnabled || (key === 'gemini'); // Gemini is enabled by default
                  
                  return (
                    <SelectItem key={key} value={key} disabled={!isEnabled}>
                      <div className="flex items-center gap-2">
                        <ProviderIcon className="h-4 w-4" />
                        <span>{info.name}</span>
                        {isEnabled ? (
                          <Badge variant="secondary" className="text-xs">Active</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">Disabled</Badge>
                        )}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Current Provider:</span>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Icon className="h-3 w-3" />
                  {currentProvider.name}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground">
                {currentProvider.description}
              </p>

              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">Available Models:</span>
                <div className="flex flex-wrap gap-1">
                  {currentProvider.models.map((model) => (
                    <Badge key={model} variant="outline" className="text-xs">
                      {model}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Provider Status:</span>
                  {(() => {
                    const config = getProviderConfig(selectedProvider);
                    const isEnabled = config?.isEnabled || (selectedProvider === 'gemini');
                    return (
                      <Badge variant={isEnabled ? "default" : "secondary"}>
                        {isEnabled ? "Enabled" : "Disabled"}
                      </Badge>
                    );
                  })()}
                </div>
                {(() => {
                  const config = getProviderConfig(selectedProvider);
                  const isEnabled = config?.isEnabled || (selectedProvider === 'gemini');
                  if (!isEnabled) {
                    return (
                      <p className="text-xs text-muted-foreground mt-1">
                        Enable this provider in AI Settings to use it.
                      </p>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
