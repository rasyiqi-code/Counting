'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Badge } from '@/shared/ui/badge';
import { Bot, Key, Save, Check, AlertCircle, Loader2 } from 'lucide-react';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { BorderBeam } from '@/components/ui/border-beam';
import { providerInfo } from '@/lib/ai/config';
import type { ProviderName } from '@/lib/ai/config';

interface AIProviderConfig {
  apiKey: string;
  baseUrl?: string;
  isEnabled: boolean;
}

export default function AISettingsPage() {
  const [configs, setConfigs] = useState<Record<ProviderName, AIProviderConfig>>({} as Record<ProviderName, AIProviderConfig>);
  const [defaultProvider, setDefaultProvider] = useState<ProviderName>('gemini');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [testingProvider, setTestingProvider] = useState<ProviderName | null>(null);

  // Initialize configs from server
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/ai/settings');
        if (response.ok) {
          const data = await response.json();
          const serverConfigs = {} as Record<ProviderName, AIProviderConfig>;
          
          // Initialize all providers as disabled
          Object.keys(providerInfo).forEach(provider => {
            serverConfigs[provider as ProviderName] = {
              apiKey: '',
              baseUrl: '',
              isEnabled: false
            };
          });
          
          // Update with server data
          data.settings.forEach((setting: any) => {
            serverConfigs[setting.provider as ProviderName] = {
              apiKey: setting.apiKey || '',
              baseUrl: setting.baseUrl || '',
              isEnabled: setting.isEnabled || false
            };
            
            if (setting.isDefault) {
              setDefaultProvider(setting.provider as ProviderName);
            }
          });
          
          setConfigs(serverConfigs);
        } else {
          // Fallback to localStorage if server fails
          const savedConfigs = localStorage.getItem('ai-provider-configs');
          const savedDefault = localStorage.getItem('ai-default-provider');
          
          if (savedConfigs) {
            setConfigs(JSON.parse(savedConfigs));
          } else {
            // Initialize with empty configs
            const initialConfigs = {} as Record<ProviderName, AIProviderConfig>;
            Object.keys(providerInfo).forEach(provider => {
              initialConfigs[provider as ProviderName] = {
                apiKey: '',
                baseUrl: '',
                isEnabled: false
              };
            });
            setConfigs(initialConfigs);
          }
          
          if (savedDefault) {
            setDefaultProvider(savedDefault as ProviderName);
          }
        }
      } catch (error) {
        console.error('Error loading AI settings:', error);
        // Fallback to localStorage
        const savedConfigs = localStorage.getItem('ai-provider-configs');
        const savedDefault = localStorage.getItem('ai-default-provider');
        
        if (savedConfigs) {
          setConfigs(JSON.parse(savedConfigs));
        }
        
        if (savedDefault) {
          setDefaultProvider(savedDefault as ProviderName);
        }
      }
    };
    
    loadSettings();
  }, []);

  const updateConfig = (provider: ProviderName, field: keyof AIProviderConfig, value: string | boolean) => {
    setConfigs(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        [field]: value
      }
    }));
  };

  const saveConfigs = async () => {
    setIsSaving(true);
    try {
      // Prepare settings for server
      const settings = Object.entries(configs).map(([provider, config]) => ({
        provider,
        apiKey: config.apiKey,
        baseUrl: config.baseUrl,
        isEnabled: config.isEnabled,
        isDefault: provider === defaultProvider,
      }));

      console.log('Saving settings:', { settings, defaultProvider });
      
      const response = await fetch('/api/ai/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });

      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (response.ok) {
        // Also save to localStorage as backup
        localStorage.setItem('ai-provider-configs', JSON.stringify(configs));
        localStorage.setItem('ai-default-provider', defaultProvider);
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        console.error('Server error:', responseData);
        throw new Error(responseData.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const testConnection = async (provider: ProviderName) => {
    const config = configs[provider];
    if (!config?.apiKey) {
      alert('Please enter API key first');
      return;
    }

    setTestingProvider(provider);

    try {
      const response = await fetch('/api/ai/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          provider,
          apiKey: config.apiKey,
          baseUrl: config.baseUrl 
        }),
      });

      if (response.ok) {
        const result = await response.json();
        // Show success notification
        const successMessage = `✅ Connection successful!\n\nProvider: ${providerInfo[provider].name}\nResponse: ${result.text}`;
        alert(successMessage);
      } else {
        const error = await response.json();
        // Show error notification
        const errorMessage = `❌ Connection failed!\n\nError: ${error.error || error.message || 'Unknown error'}`;
        alert(errorMessage);
      }
    } catch (error) {
      // Show network error notification
      const networkErrorMessage = `❌ Connection failed!\n\nError: ${error instanceof Error ? error.message : 'Network error'}`;
      alert(networkErrorMessage);
    } finally {
      setTestingProvider(null);
    }
  };

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <AnimatedGradientText className="text-2xl sm:text-3xl font-bold mb-2">
          AI Settings
        </AnimatedGradientText>
        <p className="text-sm sm:text-base text-muted-foreground">
          Konfigurasi API keys untuk berbagai AI providers
        </p>
      </div>

      <div className="space-y-6">
        {/* Default Provider Selection */}
        <Card className="relative overflow-hidden">
          <BorderBeam size={300} duration={15} />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Default AI Provider
            </CardTitle>
            <CardDescription>
              Pilih provider AI yang akan digunakan secara default
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="default-provider">Default Provider</Label>
                <Select value={defaultProvider} onValueChange={(value) => setDefaultProvider(value as ProviderName)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih default provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(providerInfo).map(([key, info]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <span>{info.name}</span>
                          {configs[key as ProviderName]?.isEnabled && (
                            <Badge variant="secondary" className="text-xs">Active</Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Provider Configurations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(providerInfo).map(([provider, info]) => (
            <Card key={provider} className="relative overflow-hidden">
              <BorderBeam size={200} duration={12} delay={Math.random() * 5} />
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{info.name}</CardTitle>
                      <CardDescription>{info.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={configs[provider as ProviderName]?.isEnabled ? "default" : "secondary"}>
                      {configs[provider as ProviderName]?.isEnabled ? "Enabled" : "Disabled"}
                    </Badge>
                    {testingProvider === provider && (
                      <Badge variant="outline" className="animate-pulse">
                        <Loader2 className="w-3 h-3 animate-spin mr-1" />
                        Testing
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`${provider}-enabled`} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`${provider}-enabled`}
                      checked={configs[provider as ProviderName]?.isEnabled || false}
                      onChange={(e) => updateConfig(provider as ProviderName, 'isEnabled', e.target.checked)}
                      className="rounded"
                    />
                    Enable {info.name}
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`${provider}-apikey`} className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    API Key
                  </Label>
                  <Input
                    id={`${provider}-apikey`}
                    type="password"
                    placeholder={`Enter ${info.name} API key`}
                    value={configs[provider as ProviderName]?.apiKey || ''}
                    onChange={(e) => updateConfig(provider as ProviderName, 'apiKey', e.target.value)}
                    disabled={!configs[provider as ProviderName]?.isEnabled}
                  />
                </div>

                {info.requiresBaseUrl && (
                  <div className="space-y-2">
                    <Label htmlFor={`${provider}-baseurl`}>Base URL (Optional)</Label>
                    <Input
                      id={`${provider}-baseurl`}
                      type="url"
                      placeholder="https://api.example.com"
                      value={configs[provider as ProviderName]?.baseUrl || ''}
                      onChange={(e) => updateConfig(provider as ProviderName, 'baseUrl', e.target.value)}
                      disabled={!configs[provider as ProviderName]?.isEnabled}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testConnection(provider as ProviderName)}
                      disabled={!configs[provider as ProviderName]?.isEnabled || !configs[provider as ProviderName]?.apiKey || testingProvider === provider}
                    >
                      {testingProvider === provider ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Testing...
                        </>
                      ) : (
                        'Test Connection'
                      )}
                    </Button>
                  </div>
                  
                  {configs[provider as ProviderName]?.apiKey && (
                    <div className="text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Key className="w-3 h-3" />
                        API Key: {configs[provider as ProviderName]?.apiKey?.substring(0, 8)}...
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Save Button */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Save Configuration</h3>
                <p className="text-sm text-muted-foreground">
                  Simpan konfigurasi AI providers ke local storage
                </p>
              </div>
              <div className="flex items-center gap-2">
                {saveStatus === 'success' && (
                  <div className="flex items-center gap-1 text-green-600 text-sm">
                    <Check className="h-4 w-4" />
                    Saved
                  </div>
                )}
                {saveStatus === 'error' && (
                  <div className="flex items-center gap-1 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    Error
                  </div>
                )}
                <Button onClick={saveConfigs} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Configuration'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-blue-900 mb-1">
                  AI Provider Configuration
                </h4>
                <p className="text-sm text-blue-800">
                  Konfigurasi disimpan di browser local storage. Pastikan untuk mengaktifkan provider yang ingin digunakan 
                  dan masukkan API key yang valid. Gemini adalah default provider yang sudah dikonfigurasi.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
