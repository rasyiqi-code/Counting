import { NextRequest, NextResponse } from 'next/server';
import { getDefaultProviderFromDB } from '@/lib/ai/config';
import { coaSystemPrompts } from '@/lib/ai/coa-prompts';

export async function POST(request: NextRequest) {
  try {
    const { existingAccounts, businessType } = await request.json();

    if (!existingAccounts || !Array.isArray(existingAccounts)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid existing accounts data'
      });
    }

    // Analyze existing accounts to identify gaps
    const analysisPrompt = `Sebagai ahli akuntansi Indonesia, analisis Chart of Accounts berikut dan identifikasi akun-akun yang kurang atau perlu ditambahkan:

    Akun yang sudah ada:
    ${JSON.stringify(existingAccounts, null, 2)}

    Jenis bisnis: ${businessType || 'Umum'}

    Berikan analisis:
    1. Akun-akun penting yang masih kurang
    2. Akun-akun yang disarankan untuk ditambahkan
    3. Prioritas setiap akun (high/medium/low)
    4. Alasan mengapa akun tersebut diperlukan

    Format response dalam JSON:
    {
      "suggestedAccounts": [
        {
          "name": "Nama Akun",
          "type": "ASSET|LIABILITY|EQUITY|REVENUE|EXPENSE",
          "code": "1-1-1",
          "priority": "high|medium|low",
          "reason": "Alasan mengapa akun ini diperlukan"
        }
      ],
      "analysis": {
        "totalExisting": 0,
        "missingCritical": 0,
        "recommendations": []
      }
    }

    Fokus pada akun-akun yang benar-benar diperlukan untuk operasional bisnis yang sehat.`;

    // Get AI provider
    const provider = await getDefaultProviderFromDB('default-company');
    
    const completion = await provider.generateText({
      messages: [
        {
          role: 'system',
          content: coaSystemPrompts.expert
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ],
      temperature: 0.3,
      maxTokens: 2000
    });

    const response = completion.text;
    
    if (!response) {
      throw new Error('No response from AI');
    }

    // Parse the JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(response);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback response
      parsedResponse = {
        suggestedAccounts: [
          {
            name: 'Kas',
            type: 'ASSET',
            code: '1-1-1',
            priority: 'high',
            reason: 'Akun kas dasar untuk transaksi harian'
          },
          {
            name: 'Bank BCA',
            type: 'ASSET', 
            code: '1-1-2',
            priority: 'high',
            reason: 'Akun bank untuk penyimpanan dana'
          }
        ],
        analysis: {
          totalExisting: existingAccounts.length,
          missingCritical: 2,
          recommendations: ['Tambahkan akun kas dan bank untuk operasional dasar']
        }
      };
    }

    return NextResponse.json({
      success: true,
      suggestedAccounts: parsedResponse.suggestedAccounts || [],
      analysis: parsedResponse.analysis || {}
    });

  } catch (error) {
    console.error('Error analyzing COA gaps:', error);
    
    // Fallback response
    return NextResponse.json({
      success: true,
      suggestedAccounts: [
        {
          name: 'Kas',
          type: 'ASSET',
          code: '1-1-1',
          priority: 'high',
          reason: 'Akun kas dasar untuk transaksi harian'
        },
        {
          name: 'Bank BCA',
          type: 'ASSET',
          code: '1-1-2', 
          priority: 'high',
          reason: 'Akun bank untuk penyimpanan dana'
        },
        {
          name: 'Piutang Usaha',
          type: 'ASSET',
          code: '1-2-1',
          priority: 'medium',
          reason: 'Akun piutang untuk penjualan kredit'
        },
        {
          name: 'Hutang Usaha',
          type: 'LIABILITY',
          code: '2-1-1',
          priority: 'high',
          reason: 'Akun hutang untuk pembelian kredit'
        },
        {
          name: 'Modal',
          type: 'EQUITY',
          code: '3-1-1',
          priority: 'high',
          reason: 'Akun modal pemilik perusahaan'
        },
        {
          name: 'Penjualan',
          type: 'REVENUE',
          code: '4-1-1',
          priority: 'high',
          reason: 'Akun pendapatan utama'
        }
      ],
      analysis: {
        totalExisting: 0,
        missingCritical: 6,
        recommendations: ['Tambahkan akun-akun dasar untuk operasional bisnis']
      }
    });
  }
}
