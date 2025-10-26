import { generateText, generateObject, streamText } from 'ai';
import { getModel, type ProviderName } from './config';
import { z } from 'zod';

// Text generation utility
export async function generateAIResponse(
  prompt: string,
  provider: ProviderName = 'openai',
  model?: string,
  options?: {
    maxTokens?: number;
    temperature?: number;
    systemPrompt?: string;
  }
) {
  const result = await generateText({
    model: getModel(provider, model),
    prompt,
    temperature: options?.temperature || 0.7,
    system: options?.systemPrompt,
  });

  return result;
}

// Structured data generation
export async function generateStructuredData<T>(
  prompt: string,
  schema: z.ZodSchema<T>,
  provider: ProviderName = 'openai',
  model?: string,
  options?: {
    maxTokens?: number;
    temperature?: number;
    systemPrompt?: string;
  }
) {
  const result = await generateObject({
    model: getModel(provider, model),
    prompt,
    schema,
    maxTokens: options?.maxTokens || 1000,
    temperature: options?.temperature || 0.7,
    system: options?.systemPrompt,
  });

  return result;
}

// Streaming text generation
export async function streamAIResponse(
  prompt: string,
  provider: ProviderName = 'openai',
  model?: string,
  options?: {
    maxTokens?: number;
    temperature?: number;
    systemPrompt?: string;
  }
) {
  const result = await streamText({
    model: getModel(provider, model),
    prompt,
    temperature: options?.temperature || 0.7,
    system: options?.systemPrompt,
  });

  return result;
}


// Accounting-specific AI utilities
export const accountingPrompts = {
  // Chart of Accounts suggestions
  suggestAccountCode: (accountName: string, accountType: string) => 
    `Suggest a proper account code for "${accountName}" (${accountType}) in Indonesian accounting system. Return only the code format like "1-1-1".`,
  
  // Journal entry suggestions
  suggestJournalEntry: (description: string, amount: number) =>
    `Suggest proper journal entries for: "${description}" with amount ${amount}. Include debit and credit accounts with proper Indonesian accounting standards.`,
  
  // Financial analysis
  analyzeFinancialData: (data: any) =>
    `Analyze this financial data and provide insights: ${JSON.stringify(data)}. Focus on Indonesian accounting principles.`,
  
  // Tax calculations
  calculateTax: (amount: number, taxType: string) =>
    `Calculate ${taxType} tax for amount ${amount} based on Indonesian tax regulations.`,
  
  // Invoice generation
  generateInvoiceDescription: (items: any[]) =>
    `Generate professional invoice description for these items: ${JSON.stringify(items)}. Use Indonesian business language.`,
};

// Predefined schemas for structured data
export const accountingSchemas = {
  accountSuggestion: z.object({
    code: z.string().describe('Account code in format like 1-1-1'),
    name: z.string().describe('Account name'),
    type: z.enum(['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE', 'COGS']),
    description: z.string().describe('Account description'),
  }),
  
  journalEntry: z.object({
    debitAccount: z.string().describe('Debit account code'),
    creditAccount: z.string().describe('Credit account code'),
    amount: z.number().describe('Transaction amount'),
    description: z.string().describe('Journal entry description'),
  }),
  
  financialAnalysis: z.object({
    insights: z.array(z.string()).describe('Key financial insights'),
    recommendations: z.array(z.string()).describe('Business recommendations'),
    risks: z.array(z.string()).describe('Potential risks identified'),
  }),
};
