import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { getModel } from '@/lib/ai/config';
import type { ProviderName } from '@/lib/ai/config';

export async function POST(request: NextRequest) {
  try {
    const { provider, apiKey, baseUrl } = await request.json();

    if (!provider || !apiKey) {
      return NextResponse.json(
        { error: 'Provider and API key are required' },
        { status: 400 }
      );
    }

    // Create a temporary provider with the provided API key
    let model;
    try {
      if (provider === 'openai') {
        const { createOpenAI } = await import('@ai-sdk/openai');
        const tempProvider = createOpenAI({ apiKey });
        model = tempProvider('gpt-4o');
      } else if (provider === 'claude') {
        const { createAnthropic } = await import('@ai-sdk/anthropic');
        const tempProvider = createAnthropic({ apiKey });
        model = tempProvider('claude-4.5-sonnet');
      } else if (provider === 'gemini') {
        const { createGoogleGenerativeAI } = await import('@ai-sdk/google');
        const tempProvider = createGoogleGenerativeAI({ apiKey });
        model = tempProvider('gemini-2.5-flash');
      } else if (provider === 'deepseek') {
        const { createOpenAI } = await import('@ai-sdk/openai');
        const tempProvider = createOpenAI({ 
          apiKey, 
          baseURL: baseUrl || 'https://api.deepseek.com/v1' 
        });
        model = tempProvider('deepseek-v3.1');
      } else if (provider === 'qwen') {
        const { createOpenAI } = await import('@ai-sdk/openai');
        const tempProvider = createOpenAI({ 
          apiKey, 
          baseURL: baseUrl || 'https://dashscope.aliyuncs.com/compatible-mode/v1' 
        });
        model = tempProvider('qwen-plus');
      } else if (provider === 'glm') {
        const { createOpenAI } = await import('@ai-sdk/openai');
        const tempProvider = createOpenAI({ 
          apiKey, 
          baseURL: baseUrl || 'https://open.bigmodel.cn/api/paas/v4' 
        });
        model = tempProvider('glm-4');
      } else if (provider === 'grok') {
        const { createOpenAI } = await import('@ai-sdk/openai');
        const tempProvider = createOpenAI({ 
          apiKey, 
          baseURL: baseUrl || 'https://api.x.ai/v1' 
        });
        model = tempProvider('grok-4');
      } else if (provider === 'openrouter') {
        const { createOpenAI } = await import('@ai-sdk/openai');
        const tempProvider = createOpenAI({ 
          apiKey, 
          baseURL: baseUrl || 'https://openrouter.ai/api/v1' 
        });
        model = tempProvider('openai/gpt-5');
      } else if (provider === 'ollama') {
        const { createOpenAI } = await import('@ai-sdk/openai');
        const tempProvider = createOpenAI({ 
          apiKey: 'ollama', 
          baseURL: baseUrl || 'http://localhost:11434/v1' 
        });
        model = tempProvider('llama3.1');
      } else {
        return NextResponse.json(
          { error: 'Unsupported provider' },
          { status: 400 }
        );
      }

      // Test the connection with a simple prompt
      const result = await generateText({
        model,
        prompt: 'Hello, this is a connection test. Please respond with "Connection successful!"',
      });

      return NextResponse.json({
        success: true,
        text: result.text,
        usage: result.usage,
      });

    } catch (error) {
      console.error('Test connection error:', error);
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          return NextResponse.json(
            { error: 'Invalid API key' },
            { status: 401 }
          );
        } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
          return NextResponse.json(
            { error: 'API key does not have permission' },
            { status: 403 }
          );
        } else if (error.message.includes('429') || error.message.includes('rate limit')) {
          return NextResponse.json(
            { error: 'Rate limit exceeded' },
            { status: 429 }
          );
        } else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
          return NextResponse.json(
            { error: 'Cannot connect to API endpoint. Check base URL.' },
            { status: 400 }
          );
        }
      }

      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Connection test failed' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Test connection route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
