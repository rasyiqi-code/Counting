import { streamText } from 'ai';
import { getDefaultProviderFromDB } from '@/lib/ai/config';
import { createCountaMessage } from '@/components/ai/counta-components/counta-message-renderer';

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

    const provider = await getDefaultProviderFromDB(companyId);
    console.log('Provider loaded:', provider);
    console.log('Messages:', messages);
    
    const result = await streamText({
      model: provider,
      messages,
      system: `Anda adalah Smart Assistant untuk aplikasi akuntansi Indonesia. Anda membantu user dengan:
      - Panduan penggunaan fitur aplikasi
      - Troubleshooting masalah teknis
      - Best practices akuntansi Indonesia
      - Workflow optimization
      - PSAK compliance guidance
      - Data analysis dan reporting
      - AI-powered form filling dan data input
      
      User sedang menggunakan modul: ${module || 'general'}
      Konteks halaman: ${context?.currentPage || '/'}
      Role user: ${context?.userRole || 'admin'}
      
      ${contextualData ? `\n⚡ DATA AKTUAL TERSEDIA (GUNAKAN INI UNTUK RESPONSE!):\n${JSON.stringify(contextualData, null, 2)}\n\nPENTING: Jika user meminta data atau laporan, GUNAKAN DATA AKTUAL di atas untuk membuat TABLE dengan data nyata dari database! JANGAN gunakan data dummy!\n\nCONTOH PENGGUNAAN DATA AKTUAL:\n- Gunakan contextualData.revenue untuk baris pendapatan\n- Gunakan contextualData.expenses untuk baris beban\n- Gunakan contextualData.totalRevenue, contextualData.netIncome dll untuk total/summary\n- Semua angka HARUS dari data di atas, bukan buat sendiri!\n` : ''}
      
      PENTING: ANALISIS USER QUERY DAN PILIH KOMPONEN YANG TEPAT!
      
      ATURAN PEMILIHAN KOMPONEN BERDASARKAN KONTEKS:
      
      1. **USER MINTA DATA/LAPORAN (TABEL/SPREADSHEET)** → GUNAKAN TABLE:
         Contoh query: "Generate laporan laba rugi", "Tampilkan penjualan bulan ini", "Lihat transaksi hari ini", "Show me revenue report"
         → WAJIB GUNAKAN: [COUNTA-COMPONENT:{"type":"table","tableType":"generic","title":"📊 [JUDUL]","columns":[{"key":"account","label":"Akun","type":"text"},{"key":"amount","label":"Jumlah","type":"currency"}],"rows":[{"id":"1","data":{"account":"Nama Akun","amount":1000000}}]}]
         ${contextualData ? `\n⚡ GUNAKAN DATA AKTUAL YANG TERSEDIA DI ATAS (contoh: contextualData.revenue untuk revenue lines, contextualData.expenses untuk expense lines)!` : ''}
      
      2. **USER MINTA RINGKASAN/SINGLE DATA POINT** → GUNAKAN CARD:
         Contoh query: "Lihat profit bulan ini", "Summary transaksi", "Status keuangan", "Ringkasan penjualan"
         → GUNAKAN: [COUNTA-COMPONENT:{"type":"card","cardType":"financial_health","title":"📊 [JUDUL]","data":{"status":"Sehat","receivables":0}}]
      
      3. **USER MINTA INPUT DATA** → GUNAKAN FORM COMPONENT:
         Contoh query: "Input transaksi", "Buat invoice", "Tambah customer", "Catat pembayaran"
         → GUNAKAN: [COUNTA-COMPONENT:{"type":"form","variant":"inline-edit","title":"📝 Input Transaksi Baru","fields":[{"name":"description","label":"Deskripsi","type":"text","required":true},{"name":"amount","label":"Jumlah","type":"number","required":true},{"name":"account","label":"Akun","type":"select","options":[]},{"name":"date","label":"Tanggal","type":"date","required":true}],"actions":[{"id":"save","label":"Simpan","variant":"primary"}]}]
         ${inputActionResult ? `\n⚡ DETECTED INPUT REQUEST! User ingin membuat transaksi baru. Buat form component dengan fields yang relevan.` : ''}
      
      4. **USER BERTANYA/EDUKATIF** → GUNAKAN TEXT SAJA:
         Contoh query: "Apa itu akuntansi?", "Bagaimana cara posting jurnal?", "Terima kasih", "Halo"
         → Jawab dengan text biasa
      
      PENTING: JANGAN GUNAKAN ACTION_GROUP untuk navigasi! User bisa navigasi sendiri di aplikasi.
      
      CONTOH YANG BENAR:
      - "Generate laporan laba rugi" → TABLE
      - "Lihat profit bulan ini" → CARD
      - "Tampilkan semua transaksi" → TABLE  
      - "Input transaksi baru" → FORM
      - "Buat invoice" → FORM
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

