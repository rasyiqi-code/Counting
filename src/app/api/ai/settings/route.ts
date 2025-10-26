import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/database/prisma';
import crypto from 'crypto';

// Encryption key (in production, use environment variable)
const ENCRYPTION_KEY = process.env.AI_ENCRYPTION_KEY || 'your-32-character-secret-key-here!';
const ALGORITHM = 'aes-256-cbc';

function encrypt(text: string): string {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    return text; // Return plain text if encryption fails
  }
}

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
        return encryptedText; // Return as-is if both methods fail
      }
    }
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedText; // Return as-is if decryption fails
  }
}

// GET - Get AI settings for company
export async function GET(request: NextRequest) {
  try {
    // For now, use a default company ID (in production, get from session)
    const companyId = 'default-company-id';

    const settings = await prisma.aISettings.findMany({
      where: { companyId },
      select: {
        id: true,
        provider: true,
        apiKey: true,
        baseUrl: true,
        isEnabled: true,
        isDefault: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Decrypt API keys
    const decryptedSettings = settings.map(setting => ({
      ...setting,
      apiKey: setting.apiKey ? decrypt(setting.apiKey) : '',
    }));

    return NextResponse.json({ settings: decryptedSettings });
  } catch (error) {
    console.error('Error fetching AI settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create or update AI settings
export async function POST(request: NextRequest) {
  try {
    // For now, use a default company ID (in production, get from session)
    const companyId = 'default-company-id';

    const body = await request.json();
    console.log('Received settings:', body);

    const { settings } = body;

    // Validate settings
    if (!Array.isArray(settings)) {
      console.error('Settings is not an array:', settings);
      return NextResponse.json({ error: 'Settings must be an array' }, { status: 400 });
    }

    const results = [];

    for (const setting of settings) {
      console.log('Processing setting:', setting);
      let { provider, apiKey, baseUrl, isEnabled, isDefault } = setting;

      if (!provider) {
        console.error('Provider is required for setting:', setting);
        return NextResponse.json({ error: 'Provider is required' }, { status: 400 });
      }

      // Encrypt API key if provided
      const encryptedApiKey = apiKey ? encrypt(apiKey) : '';
      console.log('Encrypted API key for provider:', provider);

      // If setting as default, unset other defaults
      if (isDefault) {
        console.log('Setting as default, unsetting other defaults');
        await prisma.aISettings.updateMany({
          where: { 
            companyId,
            isDefault: true 
          },
          data: { isDefault: false }
        });
      }

      // Auto-set as default if this is the only enabled provider with API key
      if (isEnabled && apiKey && !isDefault) {
        const enabledProvidersCount = await prisma.aISettings.count({
          where: {
            companyId,
            isEnabled: true,
            apiKey: { not: '' }
          }
        });

        if (enabledProvidersCount <= 1) {
          console.log('Auto-setting as default (only enabled provider with API key)');
          await prisma.aISettings.updateMany({
            where: { 
              companyId,
              isDefault: true 
            },
            data: { isDefault: false }
          });
          // Update the isDefault variable for this iteration
          isDefault = true;
        }
      }

      // Upsert setting
      console.log('Upserting setting for provider:', provider);
      const result = await prisma.aISettings.upsert({
        where: {
          companyId_provider: {
            companyId,
            provider,
          },
        },
        update: {
          apiKey: encryptedApiKey,
          baseUrl: baseUrl || null,
          isEnabled,
          isDefault,
          updatedAt: new Date(),
        },
        create: {
          companyId,
          provider,
          apiKey: encryptedApiKey,
          baseUrl: baseUrl || null,
          isEnabled,
          isDefault,
        },
      });

      console.log('Successfully upserted setting:', result);
      results.push({
        id: result.id,
        provider: result.provider,
        isEnabled: result.isEnabled,
        isDefault: result.isDefault,
      });
    }

    return NextResponse.json({ 
      success: true, 
      settings: results 
    });
  } catch (error) {
    console.error('Error saving AI settings:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE - Delete AI settings
export async function DELETE(request: NextRequest) {
  try {
    // For now, use a default company ID (in production, get from session)
    const companyId = 'default-company-id';

    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider');

    if (!provider) {
      return NextResponse.json({ error: 'Provider is required' }, { status: 400 });
    }

    await prisma.aISettings.delete({
      where: {
        companyId_provider: {
          companyId,
          provider,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting AI settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
