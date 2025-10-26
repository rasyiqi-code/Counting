'use client';

import { MagicAIChat } from '@/components/ai/magic-ai-chat';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Bot, Zap, Globe, Cpu, Database, Settings } from 'lucide-react';
import Link from 'next/link';

export default function AIChatPage() {
  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <AnimatedGradientText className="text-2xl sm:text-3xl font-bold mb-2">
          AI Assistant
        </AnimatedGradientText>
        <p className="text-sm sm:text-base text-muted-foreground">
          Chat with AI using multiple providers for accounting and business assistance
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              OpenAI
            </CardTitle>
            <CardDescription>GPT-5, GPT-4.1, GPT-4o</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant="default">GPT-5</Badge>
              <Badge variant="secondary">GPT-4o</Badge>
              <Badge variant="outline">GPT-4.1</Badge>
              <Badge variant="outline">o4-mini</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Claude
            </CardTitle>
            <CardDescription>Anthropic Claude models</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant="default">Claude-4.5-Sonnet</Badge>
              <Badge variant="secondary">Claude-4.5-Haiku</Badge>
              <Badge variant="outline">Claude-3.7-Sonnet</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Gemini
            </CardTitle>
            <CardDescription>Google Gemini models (Default)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant="default">Gemini-2.5-Flash</Badge>
              <Badge variant="secondary">Gemini-2.5-Pro</Badge>
              <Badge variant="outline">Gemini-2.0-Flash-Exp</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              DeepSeek
            </CardTitle>
            <CardDescription>DeepSeek AI models</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant="default">DeepSeek-v3.1</Badge>
              <Badge variant="secondary">DeepSeek-R1-0528</Badge>
              <Badge variant="outline">DeepSeek-Chat</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Grok
            </CardTitle>
            <CardDescription>xAI Grok models</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant="default">Grok-4</Badge>
              <Badge variant="secondary">Grok-4-Fast-Reasoning</Badge>
              <Badge variant="outline">Grok-3</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <Settings className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-blue-900 mb-1">
                  Configure AI Providers
                </h4>
                <p className="text-sm text-blue-800 mb-3">
                  Set up your API keys and configure AI providers in Settings. Gemini is configured by default.
                </p>
                <Link href="/settings/ai">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors">
                    Go to AI Settings
                  </button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <MagicAIChat />
    </div>
  );
}
