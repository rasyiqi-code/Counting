import { streamText } from 'ai';
import { getDefaultProviderFromDB } from '@/lib/ai/config';
// Using streamlined approach - no need for counta-components
import { AISystemOperations } from '@/lib/ai/system-operations';
import { AIDocumentProcessor } from '@/lib/ai/document-processor';

export async function POST(req: Request) {
  try {
    // For now, use a default company ID (in production, get from session)
    const companyId = 'default-company-id';

    const { messages, module, context } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response('Messages are required', { status: 400 });
    }

    // Get the last user message
    const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop();
    const userQuery = lastUserMessage?.content?.toLowerCase() || '';

    // Detect what kind of data user needs
    let contextualData: any = null;
    let inputActionResult: any = null;

    // Check if user wants cash balance / saldo kas
    if (userQuery.includes('saldo kas') || 
        userQuery.includes('cash balance') || 
        userQuery.includes('berapa kas') ||
        userQuery.includes('laba bulan ini') ||
        userQuery.includes('profit bulan ini')) {
      try {
        console.log('🔍 Analyzing cash and financial data...');
        
        // Get database context for analysis
        const { AIDatabaseContext } = await import('@/lib/ai/database-context');
        const dbContext = await AIDatabaseContext.getContext(companyId);
        
        // Calculate cash balance from cash accounts
        const cashAccounts = dbContext.currentBalances.filter((account: any) => 
          account.name?.toLowerCase().includes('kas') || 
          account.name?.toLowerCase().includes('cash') ||
          account.code?.startsWith('1-1-1') // Cash account code
        );
        
        const totalCashBalance = Math.round(cashAccounts.reduce((sum: number, account: any) => 
          sum + (parseFloat(account.balance) || 0), 0
        ));
        
        // Calculate receivables
        const receivablesAccounts = dbContext.currentBalances.filter((account: any) => 
          account.name?.toLowerCase().includes('piutang') || 
          account.name?.toLowerCase().includes('receivable') ||
          account.code?.startsWith('1-2-1') // Receivables account code
        );
        
        const totalReceivables = Math.round(receivablesAccounts.reduce((sum: number, account: any) => 
          sum + (parseFloat(account.balance) || 0), 0
        ));
        
        // Calculate profit (simplified - revenue - expenses)
        const revenueAccounts = dbContext.currentBalances.filter((account: any) => 
          account.accountType === 'REVENUE'
        );
        
        const expenseAccounts = dbContext.currentBalances.filter((account: any) => 
          account.accountType === 'EXPENSE'
        );
        
        const totalRevenue = Math.round(revenueAccounts.reduce((sum: number, account: any) => 
          sum + (parseFloat(account.balance) || 0), 0
        ));
        
        const totalExpenses = Math.round(expenseAccounts.reduce((sum: number, account: any) => 
          sum + (parseFloat(account.balance) || 0), 0
        ));
        
        const netProfit = totalRevenue - totalExpenses;
        const profitPercentage = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
        
        contextualData = {
          cash_balance: totalCashBalance,
          receivables: totalReceivables,
          profit: Math.round(profitPercentage),
          totalRevenue,
          totalExpenses,
          netProfit,
          cashDetails: {
            totalDebit: Math.round(cashAccounts.reduce((sum, account) => sum + (account.balance > 0 ? account.balance : 0), 0)),
            totalCredit: Math.round(Math.abs(cashAccounts.reduce((sum, account) => sum + (account.balance < 0 ? account.balance : 0), 0))),
            hasTransactions: dbContext.recentTransactions.length > 0,
            transactionCount: dbContext.recentTransactions.length
          }
        };
        
        console.log('✅ Analyzed financial data:', contextualData);
      } catch (error) {
        console.error('❌ Error analyzing financial data:', error);
      }
    }

    const provider = await getDefaultProviderFromDB(companyId);
    console.log('Provider loaded:', provider);
    console.log('Messages:', messages);
    
    const result = await streamText({
      model: provider,
      messages,
      system: `Anda adalah Smart Assistant untuk aplikasi akuntansi Indonesia. Berikan response yang RAPI, SINGKAT, dan TERSTRUKTUR.

**ATURAN RESPONSE:**
1. JANGAN tampilkan raw data tags seperti [FINANCIAL:] di response user
2. Gunakan format yang RAPI dengan bullet points
3. Berikan informasi SINGKAT dan JELAS
4. Gunakan format angka yang benar (tidak ada "NaN" atau "0-249750")

**KHUSUS UNTUK SALDO KAS:**
Jika user bertanya tentang saldo kas, gunakan format ini:

**💰 Saldo Kas Saat Ini: Rp [ANGKA]**

**📊 Breakdown:**
• Total Penerimaan: Rp [ANGKA]
• Total Pengeluaran: Rp [ANGKA]  
• Status: [Defisit/Surplus/Seimbang]

**💡 Saran:** [Saran singkat berdasarkan status]

**DATA YANG TERSEDIA:**
${contextualData ? `
- Saldo Kas: Rp ${contextualData.cash_balance.toLocaleString('id-ID')}
- Total Penerimaan: Rp ${contextualData.cashDetails.totalDebit.toLocaleString('id-ID')}
- Total Pengeluaran: Rp ${contextualData.cashDetails.totalCredit.toLocaleString('id-ID')}
- Status: ${contextualData.cash_balance < 0 ? 'Defisit' : contextualData.cash_balance > 0 ? 'Surplus' : 'Seimbang'}
` : 'Tidak ada data tersedia'}

Gunakan bahasa Indonesia yang profesional dan response yang singkat.`,
      temperature: 0.7,
      onFinish: async (result) => {
        console.log('AI response finished');
      }
    });

    console.log('Stream result created, returning response');
    
    // Create custom streaming response
    const encoder = new TextEncoder();
    
    return new Response(
      new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of result.textStream) {
              // Send the text content
              const data = JSON.stringify({ content: chunk });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
            
            // Send completion signal
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          } catch (error) {
            console.error('Streaming error:', error);
            controller.error(error);
          }
        }
      }),
      {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      }
    );
  } catch (error) {
    console.error('AI chat stream error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
