import { streamText } from 'ai';
import { getDefaultProviderFromDB } from '@/lib/ai/config';
import { createCountaMessage } from '@/components/ai/counta-components/counta-message-renderer';
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

    // Check if user wants to INPUT data (create transaction, add record, etc)
    if (userQuery.includes('input') || 
        userQuery.includes('tambah') || 
        userQuery.includes('buat') ||
        userQuery.includes('create') ||
        userQuery.includes('add') ||
        userQuery.includes('catat')) {
      
      // Extract transaction details from user message
      console.log('🔍 Detected INPUT request:', userQuery);
      
      // For now, just set a flag that we detected input intent
      // In the future, you can parse the message and create actual records
      inputActionResult = {
        detected: true,
        message: "Saya akan membantu Anda membuat transaksi baru. Silakan isi data berikut:"
      };
    }

    // Check if user wants income statement / laporan laba rugi
    if (userQuery.includes('laporan laba rugi') || 
        userQuery.includes('income statement') || 
        userQuery.includes('profit and loss') ||
        userQuery.includes('generate laporan')) {
      try {
        const { incomeStatementService } = await import('@/modules/reports/services/incomeStatement.service');
        const startDate = new Date(new Date().getFullYear(), 0, 1).toISOString();
        const endDate = new Date().toISOString();
        contextualData = await incomeStatementService.generate(companyId, { startDate, endDate });
        console.log('✅ Fetched income statement data:', contextualData);
      } catch (error) {
        console.error('❌ Error fetching income statement:', error);
      }
    }

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
        
        const totalCashBalance = cashAccounts.reduce((sum: number, account: any) => 
          sum + (account.balance || 0), 0
        );
        
        // Calculate receivables
        const receivablesAccounts = dbContext.currentBalances.filter((account: any) => 
          account.name?.toLowerCase().includes('piutang') || 
          account.name?.toLowerCase().includes('receivable') ||
          account.code?.startsWith('1-2-1') // Receivables account code
        );
        
        const totalReceivables = receivablesAccounts.reduce((sum: number, account: any) => 
          sum + (account.balance || 0), 0
        );
        
        // Calculate profit (simplified - revenue - expenses)
        const revenueAccounts = dbContext.currentBalances.filter((account: any) => 
          account.accountType === 'REVENUE'
        );
        
        const expenseAccounts = dbContext.currentBalances.filter((account: any) => 
          account.accountType === 'EXPENSE'
        );
        
        const totalRevenue = revenueAccounts.reduce((sum: number, account: any) => 
          sum + (account.balance || 0), 0
        );
        
        const totalExpenses = expenseAccounts.reduce((sum: number, account: any) => 
          sum + (account.balance || 0), 0
        );
        
        const netProfit = totalRevenue - totalExpenses;
        const profitPercentage = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
        
        contextualData = {
          cash_balance: totalCashBalance,
          receivables: totalReceivables,
          profit: Math.round(profitPercentage),
          profitIncrease: 0, // Would need historical data to calculate
          totalRevenue,
          totalExpenses,
          netProfit,
          analysis: {
            cashAccounts: cashAccounts.length,
            receivablesAccounts: receivablesAccounts.length,
            revenueAccounts: revenueAccounts.length,
            expenseAccounts: expenseAccounts.length
          }
        };
        
        console.log('✅ Analyzed financial data:', contextualData);
      } catch (error) {
        console.error('❌ Error analyzing financial data:', error);
      }
    }

    // Initialize AI system operations
    const systemOps = AISystemOperations;
    const documentProcessor = AIDocumentProcessor;
    
    // Get system context for AI with comprehensive analysis
    let systemContext = null;
    let comprehensiveAnalysis = null;
    
    try {
      console.log('🔍 Performing comprehensive data analysis...');
      const { AIDatabaseContext } = await import('@/lib/ai/database-context');
      const contextResult = await AIDatabaseContext.getContext(companyId);
      
      if (contextResult) {
        // Perform comprehensive financial analysis
        const cashAccounts = contextResult.currentBalances.filter((account: any) => 
          account.name?.toLowerCase().includes('kas') || 
          account.name?.toLowerCase().includes('cash') ||
          account.code?.startsWith('1-1-1')
        );
        
        const receivablesAccounts = contextResult.currentBalances.filter((account: any) => 
          account.name?.toLowerCase().includes('piutang') || 
          account.name?.toLowerCase().includes('receivable') ||
          account.code?.startsWith('1-2-1')
        );
        
        const revenueAccounts = contextResult.currentBalances.filter((account: any) => 
          account.accountType === 'REVENUE'
        );
        
        const expenseAccounts = contextResult.currentBalances.filter((account: any) => 
          account.accountType === 'EXPENSE'
        );
        
        const assetAccounts = contextResult.currentBalances.filter((account: any) => 
          account.accountType === 'ASSET'
        );
        
        const liabilityAccounts = contextResult.currentBalances.filter((account: any) => 
          account.accountType === 'LIABILITY'
        );
        
        const totalCashBalance = cashAccounts.reduce((sum: number, account: any) => 
          sum + (account.balance || 0), 0
        );
        
        const totalReceivables = receivablesAccounts.reduce((sum: number, account: any) => 
          sum + (account.balance || 0), 0
        );
        
        const totalRevenue = revenueAccounts.reduce((sum: number, account: any) => 
          sum + (account.balance || 0), 0
        );
        
        const totalExpenses = expenseAccounts.reduce((sum: number, account: any) => 
          sum + (account.balance || 0), 0
        );
        
        const totalAssets = assetAccounts.reduce((sum: number, account: any) => 
          sum + (account.balance || 0), 0
        );
        
        const totalLiabilities = liabilityAccounts.reduce((sum: number, account: any) => 
          sum + (account.balance || 0), 0
        );
        
        const netProfit = totalRevenue - totalExpenses;
        const profitPercentage = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
        
        comprehensiveAnalysis = {
          financial: {
            cashBalance: totalCashBalance,
            receivables: totalReceivables,
            totalRevenue,
            totalExpenses,
            netProfit,
            profitPercentage: Math.round(profitPercentage),
            totalAssets,
            totalLiabilities,
            equity: totalAssets - totalLiabilities
          },
          accounts: {
            cashAccounts: cashAccounts.length,
            receivablesAccounts: receivablesAccounts.length,
            revenueAccounts: revenueAccounts.length,
            expenseAccounts: expenseAccounts.length,
            assetAccounts: assetAccounts.length,
            liabilityAccounts: liabilityAccounts.length
          },
          transactions: {
            totalTransactions: contextResult.recentTransactions.length,
            recentTransactions: contextResult.recentTransactions.slice(0, 5)
          }
        };
        
        systemContext = {
          dataStatus: {
            hasCOA: contextResult.coa.length > 0,
            hasCustomers: contextResult.customers.length > 0,
            hasVendors: contextResult.vendors.length > 0,
            hasProducts: contextResult.products.length > 0,
            hasTransactions: contextResult.recentTransactions.length > 0
          },
          businessMetrics: {
            netIncome: netProfit,
            totalRevenue,
            totalExpenses,
            cashBalance: totalCashBalance,
            receivables: totalReceivables
          },
          recommendations: []
        };
        
        console.log('✅ Comprehensive analysis completed:', comprehensiveAnalysis);
      }
    } catch (error) {
      console.error('Error getting system context:', error);
    }

    const provider = await getDefaultProviderFromDB(companyId);
    console.log('Provider loaded:', provider);
    console.log('Messages:', messages);
    
    const result = await streamText({
      model: provider,
      messages,
      system: `Anda adalah Smart Assistant untuk aplikasi akuntansi Indonesia yang TERINTEGRASI dengan database dan business logic. Anda memiliki akses ke:

      🔗 **FITUR TERINTEGRASI:**
      - Akses real-time ke database (COA, customers, vendors, products, transactions)
      - Business logic dan validation rules
      - System operations (create accounts, customers, vendors, products, journal entries)
      - Document processing (invoice, receipt, bill, statement)
      - PSAK compliance dan Indonesian tax rules
      - Workflow automation dan smart suggestions
      
      📊 **SYSTEM CONTEXT TERSEDIA:**
      ${systemContext ? `
      - COA Status: ${systemContext.dataStatus.hasCOA ? '✅ Setup' : '❌ Belum setup'}
      - Customers: ${systemContext.dataStatus.hasCustomers ? '✅ Ada' : '❌ Belum ada'}
      - Vendors: ${systemContext.dataStatus.hasVendors ? '✅ Ada' : '❌ Belum ada'}
      - Products: ${systemContext.dataStatus.hasProducts ? '✅ Ada' : '❌ Belum ada'}
      - Transactions: ${systemContext.dataStatus.hasTransactions ? '✅ Ada' : '❌ Belum ada'}
      - Net Income: Rp ${systemContext.businessMetrics?.netIncome?.toLocaleString('id-ID') || '0'}
      - Cash Balance: Rp ${systemContext.businessMetrics?.cashBalance?.toLocaleString('id-ID') || '0'}
      - Receivables: Rp ${systemContext.businessMetrics?.receivables?.toLocaleString('id-ID') || '0'}
      ` : 'System context tidak tersedia'}
      
      📈 **ANALISIS DATA KOMPREHENSIF:**
      ${comprehensiveAnalysis ? `
      - Saldo Kas: Rp ${comprehensiveAnalysis.financial.cashBalance.toLocaleString('id-ID')}
      - Piutang: Rp ${comprehensiveAnalysis.financial.receivables.toLocaleString('id-ID')}
      - Total Pendapatan: Rp ${comprehensiveAnalysis.financial.totalRevenue.toLocaleString('id-ID')}
      - Total Beban: Rp ${comprehensiveAnalysis.financial.totalExpenses.toLocaleString('id-ID')}
      - Laba Bersih: Rp ${comprehensiveAnalysis.financial.netProfit.toLocaleString('id-ID')}
      - Profit Margin: ${comprehensiveAnalysis.financial.profitPercentage}%
      - Total Aset: Rp ${comprehensiveAnalysis.financial.totalAssets.toLocaleString('id-ID')}
      - Total Kewajiban: Rp ${comprehensiveAnalysis.financial.totalLiabilities.toLocaleString('id-ID')}
      - Ekuitas: Rp ${comprehensiveAnalysis.financial.equity.toLocaleString('id-ID')}
      - Total Transaksi: ${comprehensiveAnalysis.transactions.totalTransactions}
      ` : 'Analisis data tidak tersedia'}
      
      🎯 **KEMAMPUAN AI:**
      - **Database Operations**: Create/update accounts, customers, vendors, products, journal entries
      - **Document Processing**: Extract data dari invoice, receipt, bill, statement
      - **Smart Validation**: Validasi data sesuai business rules dan PSAK
      - **Workflow Automation**: Guide user melalui business processes
      - **Real-time Data**: Akses data aktual dari database
      - **Business Intelligence**: Analisis dan insights berdasarkan data nyata
      
      ⚠️ **WAJIB ANALISIS DATA SEBELUM RESPONSE:**
      - SELALU gunakan data aktual dari analisis di atas
      - JANGAN buat data dummy atau asumsi
      - Jika user bertanya tentang keuangan, gunakan comprehensiveAnalysis.financial
      - Jika user bertanya tentang transaksi, gunakan comprehensiveAnalysis.transactions
      - Jika user bertanya tentang akun, gunakan comprehensiveAnalysis.accounts
      - SELALU konfirmasi data yang digunakan dalam response
      
      📋 **REKOMENDASI SISTEM:**
      ${systemContext?.recommendations && systemContext.recommendations.length > 0 ? systemContext.recommendations.map((rec: any) => `- ${rec.type === 'critical' ? '🚨' : rec.type === 'important' ? '⚠️' : '💡'} ${rec.message}`).join('\n') : 'Tidak ada rekomendasi'}
      
      User sedang menggunakan modul: ${module || 'general'}
      Konteks halaman: ${context?.currentPage || '/'}
      Role user: ${context?.userRole || 'admin'}
      
      ${contextualData ? `\n⚡ DATA AKTUAL TERSEDIA (GUNAKAN INI UNTUK RESPONSE!):\n${JSON.stringify(contextualData, null, 2)}\n\nPENTING: Jika user meminta data atau laporan, GUNAKAN DATA AKTUAL di atas untuk membuat TABLE dengan data nyata dari database! JANGAN gunakan data dummy!\n\nCONTOH PENGGUNAAN DATA AKTUAL:\n- Gunakan contextualData.revenue untuk baris pendapatan\n- Gunakan contextualData.expenses untuk baris beban\n- Gunakan contextualData.totalRevenue, contextualData.netIncome dll untuk total/summary\n- Semua angka HARUS dari data di atas, bukan buat sendiri!\n` : ''}
      
      ${comprehensiveAnalysis ? `\n🔍 ANALISIS DATA YANG TERSEDIA (GUNAKAN INI UNTUK RESPONSE!):\n${JSON.stringify(comprehensiveAnalysis, null, 2)}\n\nPENTING: Jika user bertanya tentang keuangan, GUNAKAN comprehensiveAnalysis.financial! JANGAN buat data dummy!\n\nCONTOH PENGGUNAAN ANALISIS:\n- comprehensiveAnalysis.financial.cashBalance untuk saldo kas\n- comprehensiveAnalysis.financial.receivables untuk piutang\n- comprehensiveAnalysis.financial.netProfit untuk laba bersih\n- comprehensiveAnalysis.financial.profitPercentage untuk margin profit\n- comprehensiveAnalysis.transactions.totalTransactions untuk jumlah transaksi\n- Semua angka HARUS dari analisis di atas, bukan buat sendiri!\n` : ''}
      
      🎯 **ATURAN PEMILIHAN KOMPONEN BERDASARKAN KONTEKS:**
      
      1. **USER MINTA DATA/LAPORAN (TABEL/SPREADSHEET)** → GUNAKAN TABLE:
         Contoh query: "Generate laporan laba rugi", "Tampilkan penjualan bulan ini", "Lihat transaksi hari ini", "Show me revenue report"
         → WAJIB GUNAKAN: [COUNTA-COMPONENT:{"type":"table","tableType":"generic","title":"📊 [JUDUL]","columns":[{"key":"account","label":"Akun","type":"text"},{"key":"amount","label":"Jumlah","type":"currency"}],"rows":[{"id":"1","data":{"account":"Nama Akun","amount":1000000}}]}]
         ${contextualData ? `\n⚡ GUNAKAN DATA AKTUAL YANG TERSEDIA DI ATAS (contoh: contextualData.revenue untuk revenue lines, contextualData.expenses untuk expense lines)!` : ''}
      
      2. **USER MINTA RINGKASAN/SINGLE DATA POINT** → GUNAKAN CARD:
         Contoh query: "Lihat profit bulan ini", "Summary transaksi", "Status keuangan", "Ringkasan penjualan", "Berapa saldo kas", "Laba bulan ini"
         → GUNAKAN: [COUNTA-COMPONENT:{"type":"card","cardType":"financial_health","title":"📊 [JUDUL]","data":{"status":"Sehat","cash_balance":${comprehensiveAnalysis?.financial?.cashBalance || 0},"receivables":${comprehensiveAnalysis?.financial?.receivables || 0},"profit":${comprehensiveAnalysis?.financial?.profitPercentage || 0},"profitIncrease":0}}]
         ${comprehensiveAnalysis ? `\n⚡ GUNAKAN DATA AKTUAL DARI ANALISIS: cash_balance=${comprehensiveAnalysis.financial.cashBalance}, receivables=${comprehensiveAnalysis.financial.receivables}, profit=${comprehensiveAnalysis.financial.profitPercentage}%` : ''}
      
      3. **USER MINTA INPUT DATA** → GUNAKAN FORM COMPONENT:
         Contoh query: "Input transaksi", "Buat invoice", "Tambah customer", "Catat pembayaran"
         → GUNAKAN: [COUNTA-COMPONENT:{"type":"form","variant":"inline-edit","title":"📝 Input Transaksi Baru","fields":[{"name":"description","label":"Deskripsi","type":"text","required":true},{"name":"amount","label":"Jumlah","type":"number","required":true},{"name":"account","label":"Akun","type":"select","options":[]},{"name":"date","label":"Tanggal","type":"date","required":true}],"actions":[{"id":"save","label":"Simpan","variant":"primary"}]}]
         ${inputActionResult ? `\n⚡ DETECTED INPUT REQUEST! User ingin membuat transaksi baru. Buat form component dengan fields yang relevan.` : ''}
      
      4. **USER BERTANYA/EDUKATIF** → GUNAKAN TEXT SAJA:
         Contoh query: "Apa itu akuntansi?", "Bagaimana cara posting jurnal?", "Terima kasih", "Halo"
         → Jawab dengan text biasa
      
      5. **USER UPLOAD DOKUMEN** → GUNAKAN DOCUMENT PROCESSOR:
         Contoh query: "Upload invoice", "Scan receipt", "Process bill", "Extract data dari dokumen"
         → Gunakan document processor untuk extract data dan buat form dengan data yang sudah diisi
      
      🚀 **FITUR LANJUTAN:**
      - Jika user minta "buat akun baru", gunakan system operations untuk create account
      - Jika user minta "tambah customer", gunakan system operations untuk create customer
      - Jika user upload dokumen, gunakan document processor untuk extract data
      - Jika user minta validasi, gunakan business logic untuk validate data
      - Jika user minta workflow, gunakan business logic untuk get workflow steps
      
      PENTING: JANGAN GUNAKAN ACTION_GROUP untuk navigasi! User bisa navigasi sendiri di aplikasi.
      
      CONTOH YANG BENAR:
      - "Generate laporan laba rugi" → TABLE
      - "Lihat profit bulan ini" → CARD
      - "Tampilkan semua transaksi" → TABLE  
      - "Input transaksi baru" → FORM
      - "Buat invoice" → FORM
      - "Upload invoice" → DOCUMENT PROCESSOR + FORM
      - "Apa itu akuntansi?" → TEXT
      
      ANALISIS: Setiap query user itu berbeda, jadi pilih komponen yang match dengan maksud user!
      
      Gunakan bahasa Indonesia yang profesional.`,
      temperature: 0.7,
      onFinish: async (result) => {
        // Components will be parsed in the streaming response
        console.log('AI response finished');
      }
    });

    console.log('Stream result created, returning response');
    
    // Create custom streaming response that handles Counta components
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
            
            // After streaming is complete, check for Counta components
            const fullText = await result.text;
            const countaComponents = [];
            
            // Extract JSON from COUNTA-COMPONENT tags using a more robust method
            // Find all [COUNTA-COMPONENT:...] patterns
            const startPattern = '[COUNTA-COMPONENT:';
            let startIndex = fullText.indexOf(startPattern);
            
            while (startIndex !== -1) {
              const jsonStart = startIndex + startPattern.length;
              let braceCount = 0;
              let jsonEnd = jsonStart;
              let inString = false;
              let escapeNext = false;
              
              // Find the matching closing brace
              for (let i = jsonStart; i < fullText.length; i++) {
                const char = fullText[i];
                
                if (escapeNext) {
                  escapeNext = false;
                  continue;
                }
                
                if (char === '\\') {
                  escapeNext = true;
                  continue;
                }
                
                if (char === '"') {
                  inString = !inString;
                  continue;
                }
                
                if (!inString) {
                  if (char === '{') {
                    braceCount++;
                  } else if (char === '}') {
                    braceCount--;
                    if (braceCount === 0) {
                      jsonEnd = i;
                      break;
                    }
                  }
                }
              }
              
              if (jsonEnd > jsonStart) {
                try {
                  const jsonStr = fullText.substring(jsonStart, jsonEnd + 1);
                  const component = JSON.parse(jsonStr);
                  countaComponents.push(component);
                  console.log('Found Counta component:', component);
                } catch (e) {
                  console.error('Error parsing Counta component:', e);
                  console.error('JSON string:', fullText.substring(jsonStart, jsonEnd + 1));
                }
              }
              
              // Find next occurrence
              startIndex = fullText.indexOf(startPattern, jsonEnd + 1);
            }
            
            // Send Counta components if found
            if (countaComponents.length > 0) {
              const componentData = JSON.stringify({ countaComponents });
              controller.enqueue(encoder.encode(`data: ${componentData}\n\n`));
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

