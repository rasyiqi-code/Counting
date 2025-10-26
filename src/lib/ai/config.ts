import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import crypto from 'crypto';

// Encryption key (in production, use environment variable)
const ENCRYPTION_KEY = process.env.AI_ENCRYPTION_KEY || 'your-32-character-secret-key-here!';
const ALGORITHM = 'aes-256-cbc';

function decrypt(encryptedText: string): string {
  try {
    // Check if it's new format (with IV) or old format (without IV)
    if (encryptedText.includes(':')) {
      // New format with IV
      const textParts = encryptedText.split(':');
      const iv = Buffer.from(textParts.shift()!, 'hex');
      const encryptedData = textParts.join(':');
      const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv);
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } else {
      // Old format without IV - try legacy decryption
      try {
        const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
      } catch (legacyError) {
        console.error('Legacy decryption failed:', legacyError);
        return ''; // Return empty if both methods fail
      }
    }
  } catch (error) {
    console.error('Decryption error:', error);
    return '';
  }
}

// OpenAI Configuration
export const openaiProvider = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Claude (Anthropic) Configuration
export const claudeProvider = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Gemini (Google) Configuration
export const geminiProvider = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY || '',
});

// DeepSeek Configuration (using OpenAI-compatible API)
export const deepseekProvider = createOpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || '',
  baseURL: 'https://api.deepseek.com/v1',
});

// Qwen Configuration (using OpenAI-compatible API)
export const qwenProvider = createOpenAI({
  apiKey: process.env.QWEN_API_KEY || '',
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
});

// GLM Configuration (using OpenAI-compatible API)
export const glmProvider = createOpenAI({
  apiKey: process.env.GLM_API_KEY || '',
  baseURL: 'https://open.bigmodel.cn/api/paas/v4',
});

// Grok Configuration (using OpenAI-compatible API)
export const grokProvider = createOpenAI({
  apiKey: process.env.GROK_API_KEY || '',
  baseURL: 'https://api.x.ai/v1',
});

// OpenRouter Configuration
export const openrouterProvider = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || '',
  baseURL: 'https://openrouter.ai/api/v1',
});

// Ollama Configuration (Local)
export const ollamaProvider = createOpenAI({
  apiKey: 'ollama', // Ollama doesn't require API key
  baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1',
});

// Provider mapping for easy access
export const providers = {
  openai: openaiProvider,
  claude: claudeProvider,
  gemini: geminiProvider,
  deepseek: deepseekProvider,
  qwen: qwenProvider,
  glm: glmProvider,
  grok: grokProvider,
  openrouter: openrouterProvider,
  ollama: ollamaProvider,
} as const;

export type ProviderName = keyof typeof providers;

// Default provider selection
export const getProvider = (providerName: ProviderName = 'openai') => {
  return providers[providerName];
};

// Get model function for each provider with dynamic configuration
export const getModel = (providerName: ProviderName, modelName?: string) => {
  const defaultModel = getDefaultModel(providerName);
  const model = modelName || defaultModel;
  
  // Get dynamic configuration from localStorage if available
  if (typeof window !== 'undefined') {
    const config = getProviderConfig(providerName);
    if (config?.apiKey) {
      // Create provider with user's API key
      if (providerName === 'openai') {
        const provider = createOpenAI({ apiKey: config.apiKey });
        return provider(model);
      } else if (providerName === 'claude') {
        const provider = createAnthropic({ apiKey: config.apiKey });
        return provider(model);
      } else if (providerName === 'gemini') {
        const provider = createGoogleGenerativeAI({ apiKey: config.apiKey });
        return provider(model);
      } else if (config.baseUrl) {
        const provider = createOpenAI({ 
          apiKey: config.apiKey, 
          baseURL: config.baseUrl 
        });
        return provider(model);
      }
    }
  }
  
  // Fallback to default provider
  const provider = providers[providerName];
  return provider(model);
};

// Get default model for each provider
function getDefaultModel(provider: ProviderName): string {
  const defaultModels = {
    openai: 'gpt-4o',
    claude: 'claude-4.5-sonnet',
    gemini: 'gemini-2.5-flash',
    deepseek: 'deepseek-v3.1',
    qwen: 'qwen-plus',
    glm: 'glm-4',
    grok: 'grok-4',
    openrouter: 'openai/gpt-5',
    ollama: 'llama3.1',
  };

  return defaultModels[provider];
}

// Get default provider from localStorage or use gemini
export const getDefaultProvider = (): ProviderName => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('ai-default-provider');
    return (saved as ProviderName) || 'gemini';
  }
  return 'gemini';
};

// Get provider config from localStorage
export const getProviderConfig = (provider: ProviderName) => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('ai-provider-configs');
    if (saved) {
      const configs = JSON.parse(saved);
      return configs[provider];
    }
  }
  return null;
};

// Provider information for UI
export const providerInfo = {
  openai: {
    name: 'OpenAI',
    models: ['gpt-4o', 'o4-mini', 'gpt-4.1', 'gpt-5', 'gpt-5-mini', 'gpt-5-nano', 'gpt-4o-mini', 'gpt-4-turbo'],
    description: 'OpenAI GPT models',
    requiresBaseUrl: false,
  },
  claude: {
    name: 'Claude (Anthropic)',
    models: ['claude-4.5-sonnet', 'claude-4.5-haiku', 'claude-3.7-sonnet', 'claude-3.5-sonnet-20241022', 'claude-3.5-haiku-20241022', 'claude-3-opus-20240229'],
    description: 'Anthropic Claude models',
    requiresBaseUrl: false,
  },
  gemini: {
    name: 'Gemini (Google)',
    models: ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash-exp', 'gemini-1.5-pro', 'gemini-1.5-flash'],
    description: 'Google Gemini models',
    requiresBaseUrl: false,
  },
  deepseek: {
    name: 'DeepSeek',
    models: ['deepseek-v3.1', 'deepseek-r1-0528', 'deepseek-chat', 'deepseek-coder'],
    description: 'DeepSeek AI models',
    requiresBaseUrl: true,
  },
  qwen: {
    name: 'Qwen (Alibaba)',
    models: ['qwen-plus', 'qwen-max', 'qwen-turbo'],
    description: 'Alibaba Qwen models',
    requiresBaseUrl: true,
  },
  glm: {
    name: 'GLM (Zhipu AI)',
    models: ['glm-4', 'glm-4v', 'glm-3-turbo'],
    description: 'Zhipu AI GLM models',
    requiresBaseUrl: true,
  },
  grok: {
    name: 'Grok (xAI)',
    models: ['grok-4', 'grok-4-fast-reasoning', 'grok-4-fast-non-reasoning', 'grok-3', 'grok-3-mini', 'grok-code-fast-1', 'grok-2'],
    description: 'xAI Grok models',
    requiresBaseUrl: true,
  },
  openrouter: {
    name: 'OpenRouter',
    models: ['openai/gpt-4o', 'openai/gpt-5', 'anthropic/claude-4.5-sonnet', 'google/gemini-2.5-pro', 'meta-llama/llama-3.1-8b-instruct'],
    description: 'OpenRouter aggregated models',
    requiresBaseUrl: true,
  },
  ollama: {
    name: 'Ollama (Local)',
    models: ['llama3.1', 'llama3', 'mistral', 'codellama', 'qwen', 'deepseek-coder'],
    description: 'Local Ollama models',
    requiresBaseUrl: true,
  },
} as const;

// Get AI settings from database
export async function getAISettings(companyId: string) {
  try {
    const { prisma } = await import('@/shared/database/prisma');
    const settings = await prisma.aISettings.findMany({
      where: { 
        companyId,
        isEnabled: true 
      },
    });

    return settings.map((setting: any) => ({
      provider: setting.provider,
      apiKey: setting.apiKey ? decrypt(setting.apiKey) : '',
      baseUrl: setting.baseUrl,
      isEnabled: setting.isEnabled,
      isDefault: setting.isDefault,
    }));
  } catch (error) {
    console.error('Error fetching AI settings:', error);
    return [];
  }
}

// Get default provider from database
export async function getDefaultProviderFromDB(companyId: string): Promise<any> {
  try {
    const { prisma } = await import('@/shared/database/prisma');
    
    // First try to find default provider
    let defaultSetting = await prisma.aISettings.findFirst({
      where: { 
        companyId,
        isDefault: true,
        isEnabled: true 
      },
    });

    // If no default provider or no API key, find any enabled provider with API key
    if (!defaultSetting || !defaultSetting.apiKey) {
      console.log('No default provider found, searching for any enabled provider with API key');
      defaultSetting = await prisma.aISettings.findFirst({
        where: { 
          companyId,
          isEnabled: true,
          apiKey: { not: '' }
        },
        orderBy: { updatedAt: 'desc' } // Get most recently updated
      });
    }

    if (defaultSetting && defaultSetting.apiKey) {
      const apiKey = decrypt(defaultSetting.apiKey);
      const baseUrl = defaultSetting.baseUrl;

      console.log('Using provider from database:', defaultSetting.provider);
      console.log('API key length:', apiKey.length);
      console.log('Base URL:', baseUrl);

      if (defaultSetting.provider === 'openai') {
        const provider = createOpenAI({
          apiKey,
          baseURL: baseUrl || undefined,
        });
        return provider('gpt-4o');
      } else if (defaultSetting.provider === 'claude') {
        const provider = createAnthropic({
          apiKey,
        });
        return provider('claude-4.5-sonnet');
      } else if (defaultSetting.provider === 'gemini') {
        const provider = createGoogleGenerativeAI({
          apiKey,
        });
        return provider('gemini-2.5-flash');
      } else if (baseUrl) {
        // Custom providers (deepseek, qwen, etc.)
        const provider = createOpenAI({
          apiKey,
          baseURL: baseUrl,
        });
        return provider('gpt-4o');
      }
    }

    console.log('No enabled provider with API key found, using fallback provider');
    // Fallback to environment variables
    return geminiProvider('gemini-2.5-flash');
  } catch (error) {
    console.error('Error getting default provider:', error);
    return geminiProvider('gemini-2.5-flash');
  }
}
