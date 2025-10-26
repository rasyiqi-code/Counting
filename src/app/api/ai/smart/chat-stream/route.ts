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
    
    // If no specific query detected, provide general financial summary
    let provideGeneralSummary = false;

    // Check if user wants transaction data (invoices, payments, AR aging, etc.)
    if (userQuery.includes('customer yang belum bayar') || 
        userQuery.includes('piutang') ||
        userQuery.includes('ar aging') ||
        userQuery.includes('invoice yang belum dibayar') ||
        userQuery.includes('pembayaran') ||
        userQuery.includes('transaksi penjualan') ||
        userQuery.includes('transaksi pembelian') ||
        userQuery.includes('laporan penjualan') ||
        userQuery.includes('laporan pembelian')) {
      try {
        console.log('🔍 Fetching transaction data...');
        
        // Get database context for transaction analysis
        const { AIDatabaseContext } = await import('@/lib/ai/database-context');
        const dbContext = await AIDatabaseContext.getContext(companyId);
        
        // Calculate AR Aging
        const salesInvoices = dbContext.invoices.filter((invoice: any) => invoice.type === 'SALES');
        const unpaidInvoices = salesInvoices.filter((invoice: any) => 
          parseFloat(invoice.paidAmount) < parseFloat(invoice.total)
        );
        
        // Calculate AP Aging
        const purchaseInvoices = dbContext.invoices.filter((invoice: any) => invoice.type === 'PURCHASE');
        const unpaidPurchases = purchaseInvoices.filter((invoice: any) => 
          parseFloat(invoice.paidAmount) < parseFloat(invoice.total)
        );
        
        // Calculate total receivables and payables
        const totalReceivables = unpaidInvoices.reduce((sum: number, invoice: any) => 
          sum + (parseFloat(invoice.total) - parseFloat(invoice.paidAmount)), 0
        );
        
        const totalPayables = unpaidPurchases.reduce((sum: number, invoice: any) => 
          sum + (parseFloat(invoice.total) - parseFloat(invoice.paidAmount)), 0
        );
        
        contextualData = {
          invoices: dbContext.invoices,
          payments: dbContext.payments,
          salesInvoices,
          purchaseInvoices,
          unpaidInvoices,
          unpaidPurchases,
          totalReceivables: Math.round(totalReceivables),
          totalPayables: Math.round(totalPayables),
          summary: {
            totalInvoices: dbContext.invoices.length,
            totalPayments: dbContext.payments.length,
            unpaidSalesCount: unpaidInvoices.length,
            unpaidPurchaseCount: unpaidPurchases.length,
            totalReceivables,
            totalPayables
          }
        };
        
        console.log('✅ Fetched transaction data:', contextualData);
      } catch (error) {
        console.error('❌ Error fetching transaction data:', error);
      }
    }
    
    // Check if user wants fixed assets data (assets register, depreciation, disposal)
    if (userQuery.includes('fixed asset') || 
        userQuery.includes('aset tetap') ||
        userQuery.includes('assets register') ||
        userQuery.includes('register aset') ||
        userQuery.includes('depreciation') ||
        userQuery.includes('penyusutan') ||
        userQuery.includes('disposal') ||
        userQuery.includes('pelepasan aset') ||
        userQuery.includes('laporan aset') ||
        userQuery.includes('asset report')) {
      try {
        console.log('🔍 Fetching fixed assets data...');
        
        // Get database context for fixed assets analysis
        const { AIDatabaseContext } = await import('@/lib/ai/database-context');
        const dbContext = await AIDatabaseContext.getContext(companyId);
        
        // Calculate fixed assets summary
        const totalAssetValue = dbContext.fixedAssets.reduce((sum: number, asset: any) => 
          sum + (parseFloat(asset.bookValue) || 0), 0
        );
        
        const totalDepreciation = dbContext.fixedAssets.reduce((sum: number, asset: any) => 
          sum + (parseFloat(asset.accumulatedDepreciation) || 0), 0
        );
        
        const activeAssets = dbContext.fixedAssets.filter((asset: any) => asset.status === 'ACTIVE');
        const disposedAssets = dbContext.fixedAssets.filter((asset: any) => asset.status === 'DISPOSED');
        
        // Group by category
        const assetsByCategory = dbContext.fixedAssets.reduce((acc: any, asset: any) => {
          if (!acc[asset.category]) {
            acc[asset.category] = 0;
          }
          acc[asset.category]++;
          return acc;
        }, {});
        
        contextualData = {
          fixedAssets: dbContext.fixedAssets,
          totalAssetValue: Math.round(totalAssetValue),
          totalDepreciation: Math.round(totalDepreciation),
          activeAssets,
          disposedAssets,
          assetsByCategory,
          summary: {
            totalAssets: dbContext.fixedAssets.length,
            activeCount: activeAssets.length,
            disposedCount: disposedAssets.length,
            totalAssetValue,
            totalDepreciation
          }
        };
        
        console.log('✅ Fetched fixed assets data:', contextualData);
      } catch (error) {
        console.error('❌ Error fetching fixed assets data:', error);
      }
    }
    
    // Check if user wants reports data (trial balance, income statement, balance sheet, cash flow, tax reports)
    // Also check for general financial queries
    if (userQuery.includes('trial balance') || 
        userQuery.includes('neraca saldo') ||
        userQuery.includes('income statement') || 
        userQuery.includes('laporan laba rugi') ||
        userQuery.includes('balance sheet') ||
        userQuery.includes('neraca') ||
        userQuery.includes('cash flow') ||
        userQuery.includes('arus kas') ||
        userQuery.includes('tax report') ||
        userQuery.includes('laporan pajak') ||
        userQuery.includes('ledger') ||
        userQuery.includes('buku besar') ||
        userQuery.includes('other income') ||
        userQuery.includes('pendapatan lain') ||
        userQuery.includes('other expense') ||
        userQuery.includes('beban lain') ||
        userQuery.includes('bank transfer') ||
        userQuery.includes('transfer bank') ||
        // Add general financial queries
        userQuery.includes('laporan keuangan') ||
        userQuery.includes('financial report') ||
        userQuery.includes('status keuangan') ||
        userQuery.includes('financial status') ||
        userQuery.includes('summary') ||
        userQuery.includes('ringkasan') ||
        userQuery === '' || // Empty query - show general financial summary
        userQuery.length < 3) { // Very short queries
      try {
        console.log('🔍 Fetching reports data...');
        
        // Get database context for reports analysis
        const { AIDatabaseContext } = await import('@/lib/ai/database-context');
        const dbContext = await AIDatabaseContext.getContext(companyId);
        
        // Calculate financial reports data
        const assetAccounts = dbContext.coa.filter((account: any) => account.accountType === 'ASSET');
        const liabilityAccounts = dbContext.coa.filter((account: any) => account.accountType === 'LIABILITY');
        const equityAccounts = dbContext.coa.filter((account: any) => account.accountType === 'EQUITY');
        const revenueAccounts = dbContext.coa.filter((account: any) => account.accountType === 'REVENUE');
        const expenseAccounts = dbContext.coa.filter((account: any) => account.accountType === 'EXPENSE');
        
        const totalAssets = assetAccounts.reduce((sum: number, account: any) => 
          sum + (parseFloat(account.balance) || 0), 0
        );
        
        const totalLiabilities = liabilityAccounts.reduce((sum: number, account: any) => 
          sum + (parseFloat(account.balance) || 0), 0
        );
        
        const totalEquity = equityAccounts.reduce((sum: number, account: any) => 
          sum + (parseFloat(account.balance) || 0), 0
        );
        
        const totalRevenue = revenueAccounts.reduce((sum: number, account: any) => 
          sum + (parseFloat(account.balance) || 0), 0
        );
        
        const totalExpenses = expenseAccounts.reduce((sum: number, account: any) => 
          sum + (parseFloat(account.balance) || 0), 0
        );
        
        const netIncome = totalRevenue - totalExpenses;
        
        contextualData = {
          coa: dbContext.coa,
          journals: dbContext.journals,
          journalEntries: dbContext.journalEntries,
          taxRates: dbContext.taxRates,
          accountingPeriods: dbContext.accountingPeriods,
          totalAssets: Math.round(totalAssets),
          totalLiabilities: Math.round(totalLiabilities),
          totalEquity: Math.round(totalEquity),
          totalRevenue: Math.round(totalRevenue),
          totalExpenses: Math.round(totalExpenses),
          netIncome: Math.round(netIncome),
          summary: {
            totalAccounts: dbContext.coa.length,
            totalJournals: dbContext.journals.length,
            totalJournalEntries: dbContext.journalEntries.length,
            totalTaxRates: dbContext.taxRates.length,
            totalPeriods: dbContext.accountingPeriods.length,
            totalAssets,
            totalLiabilities,
            totalEquity,
            totalRevenue,
            totalExpenses,
            netIncome
          }
        };
        
        console.log('✅ Fetched reports data:', contextualData);
      } catch (error) {
        console.error('❌ Error fetching reports data:', error);
      }
    }
    
    // Check if user wants inventory data (stock card, adjustments, transfers, valuation)
    if (userQuery.includes('stock card') || 
        userQuery.includes('kartu stok') ||
        userQuery.includes('persediaan') ||
        userQuery.includes('inventory') ||
        userQuery.includes('stok barang') ||
        userQuery.includes('adjustment') ||
        userQuery.includes('penyesuaian stok') ||
        userQuery.includes('transfer stok') ||
        userQuery.includes('valuasi persediaan') ||
        userQuery.includes('stock movement') ||
        userQuery.includes('pergerakan stok') ||
        userQuery.includes('laporan stok') ||
        userQuery.includes('stock report')) {
      try {
        console.log('🔍 Fetching inventory data...');
        
        // Get database context for inventory analysis
        const { AIDatabaseContext } = await import('@/lib/ai/database-context');
        const dbContext = await AIDatabaseContext.getContext(companyId);
        
        // Calculate inventory summary
        const totalInventoryValue = dbContext.inventoryItems.reduce((sum: number, item: any) => 
          sum + (parseFloat(item.value) || 0), 0
        );
        
        const totalStockQuantity = dbContext.inventoryItems.reduce((sum: number, item: any) => 
          sum + (parseFloat(item.quantity) || 0), 0
        );
        
        // Group by movement type
        const movementTypes = dbContext.stockMovements.reduce((acc: any, movement: any) => {
          if (!acc[movement.movementType]) {
            acc[movement.movementType] = 0;
          }
          acc[movement.movementType]++;
          return acc;
        }, {});
        
        // Find low stock items
        const lowStockItems = dbContext.inventoryItems.filter((item: any) => 
          parseFloat(item.quantity) <= 10 // Assuming 10 is low stock threshold
        );
        
        // Find high value items
        const highValueItems = dbContext.inventoryItems.filter((item: any) => 
          parseFloat(item.value) >= 1000000 // Assuming 1M is high value threshold
        );
        
        contextualData = {
          inventoryItems: dbContext.inventoryItems,
          stockMovements: dbContext.stockMovements,
          totalInventoryValue: Math.round(totalInventoryValue),
          totalStockQuantity: Math.round(totalStockQuantity),
          movementTypes,
          lowStockItems,
          highValueItems,
          summary: {
            totalItems: dbContext.inventoryItems.length,
            totalMovements: dbContext.stockMovements.length,
            lowStockCount: lowStockItems.length,
            highValueCount: highValueItems.length,
            totalInventoryValue,
            totalStockQuantity
          }
        };
        
        console.log('✅ Fetched inventory data:', contextualData);
      } catch (error) {
        console.error('❌ Error fetching inventory data:', error);
      }
    }
    
    // Check if user wants master data (customers, vendors, products, etc.)
    if (userQuery.includes('list customer') || 
        userQuery.includes('daftar customer') ||
        userQuery.includes('list vendor') || 
        userQuery.includes('daftar vendor') ||
        userQuery.includes('list product') || 
        userQuery.includes('daftar product') ||
        userQuery.includes('list coa') || 
        userQuery.includes('daftar coa') ||
        userQuery.includes('list bank') || 
        userQuery.includes('daftar bank')) {
      try {
        console.log('🔍 Fetching master data...');
        
        // Get database context for master data
        const { AIDatabaseContext } = await import('@/lib/ai/database-context');
        const dbContext = await AIDatabaseContext.getContext(companyId);
        
        contextualData = {
          customers: dbContext.customers,
          vendors: dbContext.vendors,
          products: dbContext.products,
          coa: dbContext.coa,
          bankAccounts: dbContext.coa.filter((account: any) => 
            account.name?.toLowerCase().includes('bank') || 
            account.name?.toLowerCase().includes('rekening') ||
            account.code?.startsWith('1-1-2') // Bank account code
          ),
          summary: {
            totalCustomers: dbContext.customers.length,
            totalVendors: dbContext.vendors.length,
            totalProducts: dbContext.products.length,
            totalCOA: dbContext.coa.length,
            totalBankAccounts: dbContext.coa.filter((account: any) => 
              account.name?.toLowerCase().includes('bank') || 
              account.name?.toLowerCase().includes('rekening') ||
              account.code?.startsWith('1-1-2')
            ).length
          }
        };
        
        console.log('✅ Fetched master data:', contextualData);
      } catch (error) {
        console.error('❌ Error fetching master data:', error);
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
    
    // Fallback: If no specific data was fetched, provide general financial summary
    if (!contextualData) {
      try {
        console.log('🔍 Providing general financial summary...');
        
        // Get database context for general summary
        const { AIDatabaseContext } = await import('@/lib/ai/database-context');
        const dbContext = await AIDatabaseContext.getContext(companyId);
        
        // Calculate general financial data
        const assetAccounts = dbContext.coa.filter((account: any) => account.accountType === 'ASSET');
        const liabilityAccounts = dbContext.coa.filter((account: any) => account.accountType === 'LIABILITY');
        const equityAccounts = dbContext.coa.filter((account: any) => account.accountType === 'EQUITY');
        const revenueAccounts = dbContext.coa.filter((account: any) => account.accountType === 'REVENUE');
        const expenseAccounts = dbContext.coa.filter((account: any) => account.accountType === 'EXPENSE');
        
        const totalAssets = assetAccounts.reduce((sum: number, account: any) => 
          sum + (parseFloat(account.balance) || 0), 0
        );
        
        const totalLiabilities = liabilityAccounts.reduce((sum: number, account: any) => 
          sum + (parseFloat(account.balance) || 0), 0
        );
        
        const totalEquity = equityAccounts.reduce((sum: number, account: any) => 
          sum + (parseFloat(account.balance) || 0), 0
        );
        
        const totalRevenue = revenueAccounts.reduce((sum: number, account: any) => 
          sum + (parseFloat(account.balance) || 0), 0
        );
        
        const totalExpenses = expenseAccounts.reduce((sum: number, account: any) => 
          sum + (parseFloat(account.balance) || 0), 0
        );
        
        const netIncome = totalRevenue - totalExpenses;
        
        contextualData = {
          coa: dbContext.coa,
          journals: dbContext.journals,
          journalEntries: dbContext.journalEntries,
          taxRates: dbContext.taxRates,
          accountingPeriods: dbContext.accountingPeriods,
          totalAssets: Math.round(totalAssets),
          totalLiabilities: Math.round(totalLiabilities),
          totalEquity: Math.round(totalEquity),
          totalRevenue: Math.round(totalRevenue),
          totalExpenses: Math.round(totalExpenses),
          netIncome: Math.round(netIncome),
          summary: {
            totalAccounts: dbContext.coa.length,
            totalJournals: dbContext.journals.length,
            totalJournalEntries: dbContext.journalEntries.length,
            totalTaxRates: dbContext.taxRates.length,
            totalPeriods: dbContext.accountingPeriods.length,
            totalAssets,
            totalLiabilities,
            totalEquity,
            totalRevenue,
            totalExpenses,
            netIncome
          }
        };
        
        console.log('✅ Provided general financial summary:', contextualData);
      } catch (error) {
        console.error('❌ Error providing general summary:', error);
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

**KHUSUS UNTUK DATA TRANSAKSI:**
Jika user bertanya tentang customer yang belum bayar, piutang, invoice, pembayaran, gunakan format ini:

**💰 [JENIS DATA] - Total: [JUMLAH]**

**📊 Summary:**
• Total Invoices: [JUMLAH]
• Total Payments: [JUMLAH]
• Unpaid Sales: [JUMLAH] invoice
• Unpaid Purchases: [JUMLAH] invoice
• Total Receivables: Rp [ANGKA]
• Total Payables: Rp [ANGKA]

**📝 Detail Data:**
${contextualData?.unpaidInvoices?.length > 0 ? `• Unpaid Sales: ${contextualData.unpaidInvoices.map((inv: any) => `${inv.contact.name} - ${inv.invoiceNo} (Rp ${parseFloat(inv.total).toLocaleString('id-ID')})`).join(', ')}` : '• Unpaid Sales: Tidak ada'}
${contextualData?.unpaidPurchases?.length > 0 ? `• Unpaid Purchases: ${contextualData.unpaidPurchases.map((inv: any) => `${inv.contact.name} - ${inv.invoiceNo} (Rp ${parseFloat(inv.total).toLocaleString('id-ID')})`).join(', ')}` : '• Unpaid Purchases: Tidak ada'}

**💡 Saran:** ${contextualData?.summary?.totalReceivables > 0 ? 'Ada piutang yang perlu ditagih. Pertimbangkan untuk mengirim reminder pembayaran' : 'Tidak ada piutang yang tertunggak'}

**KHUSUS UNTUK DATA ASET TETAP:**
Jika user bertanya tentang fixed asset, aset tetap, assets register, depreciation, disposal, gunakan format ini:

**🏢 Data Aset Tetap - Total: [JUMLAH]**

**📊 Summary:**
• Total Assets: [JUMLAH] aset
• Active Assets: [JUMLAH] aset
• Disposed Assets: [JUMLAH] aset
• Total Asset Value: Rp [ANGKA]
• Total Depreciation: Rp [ANGKA]

**📋 Detail Data:**
${contextualData?.activeAssets?.length > 0 ? `• Active Assets: ${contextualData.activeAssets.map((asset: any) => `${asset.name} (${asset.category}) - Rp ${parseFloat(asset.bookValue).toLocaleString('id-ID')}`).join(', ')}` : '• Active Assets: Tidak ada'}
${contextualData?.disposedAssets?.length > 0 ? `• Disposed Assets: ${contextualData.disposedAssets.map((asset: any) => `${asset.name} (${asset.category}) - Rp ${parseFloat(asset.disposalAmount || 0).toLocaleString('id-ID')}`).join(', ')}` : '• Disposed Assets: Tidak ada'}

**📈 Assets by Category:**
${contextualData?.assetsByCategory ? Object.entries(contextualData.assetsByCategory).map(([category, count]) => `• ${category}: ${count} aset`).join('\n') : '• Tidak ada data kategori'}

**💡 Saran:** ${contextualData?.summary?.totalAssets > 0 ? 'Aset tetap sudah terdaftar. Pertimbangkan untuk melakukan review berkala' : 'Belum ada aset tetap yang terdaftar'}

**KHUSUS UNTUK LAPORAN KEUANGAN:**
Jika user bertanya tentang trial balance, income statement, balance sheet, cash flow, tax reports, ledger, gunakan format ini:

**📊 Laporan Keuangan - Status: [STATUS]**

**💰 Financial Summary:**
• Total Assets: Rp [ANGKA]
• Total Liabilities: Rp [ANGKA]
• Total Equity: Rp [ANGKA]
• Total Revenue: Rp [ANGKA]
• Total Expenses: Rp [ANGKA]
• Net Income: Rp [ANGKA]

**📋 Detail Reports:**
• Total Accounts: [JUMLAH] akun
• Total Journals: [JUMLAH] jurnal
• Total Journal Entries: [JUMLAH] entry
• Total Tax Rates: [JUMLAH] tarif pajak
• Total Periods: [JUMLAH] periode

**📈 Account Types:**
• Asset Accounts: [JUMLAH] akun
• Liability Accounts: [JUMLAH] akun
• Equity Accounts: [JUMLAH] akun
• Revenue Accounts: [JUMLAH] akun
• Expense Accounts: [JUMLAH] akun

**💡 Saran:** ${contextualData?.summary?.netIncome > 0 ? 'Perusahaan dalam kondisi profit. Pertahankan performa yang baik' : 'Perusahaan mengalami kerugian. Evaluasi kembali strategi bisnis'}

**KHUSUS UNTUK DATA PERSEDIAAN:**
Jika user bertanya tentang stock card, persediaan, inventory, adjustment, transfer stok, valuasi, gunakan format ini:

**📦 Data Persediaan - Total: [JUMLAH]**

**📊 Summary:**
• Total Items: [JUMLAH] produk
• Total Movements: [JUMLAH] pergerakan
• Low Stock Items: [JUMLAH] item
• High Value Items: [JUMLAH] item
• Total Inventory Value: Rp [ANGKA]
• Total Stock Quantity: [JUMLAH] unit

**📋 Detail Data:**
${contextualData?.lowStockItems?.length > 0 ? `• Low Stock: ${contextualData.lowStockItems.map((item: any) => `${item.product.name} (${item.quantity} ${item.product.unit})`).join(', ')}` : '• Low Stock: Tidak ada'}
${contextualData?.highValueItems?.length > 0 ? `• High Value: ${contextualData.highValueItems.map((item: any) => `${item.product.name} (Rp ${parseFloat(item.value).toLocaleString('id-ID')})`).join(', ')}` : '• High Value: Tidak ada'}

**📈 Movement Types:**
${contextualData?.movementTypes ? Object.entries(contextualData.movementTypes).map(([type, count]) => `• ${type}: ${count} pergerakan`).join('\n') : '• Tidak ada pergerakan stok'}

**💡 Saran:** ${contextualData?.summary?.lowStockCount > 0 ? 'Ada item dengan stok rendah. Pertimbangkan untuk restock' : 'Stok dalam kondisi normal'}

**KHUSUS UNTUK MASTER DATA:**
Jika user bertanya tentang customers, vendors, products, coa, atau bank accounts, gunakan format ini:

**📋 [JENIS DATA] - Total: [JUMLAH]**

**📊 Summary:**
• Total Customers: [JUMLAH]
• Total Vendors: [JUMLAH]
• Total Products: [JUMLAH]
• Total COA: [JUMLAH]
• Total Bank Accounts: [JUMLAH]

**📝 Detail Data:**
${contextualData?.customers?.length > 0 ? `• Customers: ${contextualData.customers.map((c: any) => c.name).join(', ')}` : '• Customers: Belum ada data'}
${contextualData?.vendors?.length > 0 ? `• Vendors: ${contextualData.vendors.map((v: any) => v.name).join(', ')}` : '• Vendors: Belum ada data'}
${contextualData?.products?.length > 0 ? `• Products: ${contextualData.products.map((p: any) => p.name).join(', ')}` : '• Products: Belum ada data'}

**💡 Saran:** ${contextualData?.summary?.totalCustomers === 0 ? 'Pertimbangkan untuk menambahkan data customer untuk memulai transaksi penjualan' : 'Data master sudah tersedia, siap untuk transaksi'}

**DATA YANG TERSEDIA:**
${contextualData ? `
${contextualData.cash_balance !== undefined ? `
**💰 Data Keuangan:**
- Saldo Kas: Rp ${contextualData.cash_balance.toLocaleString('id-ID')}
- Total Penerimaan: Rp ${contextualData.cashDetails.totalDebit.toLocaleString('id-ID')}
- Total Pengeluaran: Rp ${contextualData.cashDetails.totalCredit.toLocaleString('id-ID')}
- Status: ${contextualData.cash_balance < 0 ? 'Defisit' : contextualData.cash_balance > 0 ? 'Surplus' : 'Seimbang'}
` : ''}

${contextualData.totalReceivables !== undefined ? `
**💳 Data Transaksi:**
- Total Invoices: ${contextualData.summary.totalInvoices}
- Total Payments: ${contextualData.summary.totalPayments}
- Unpaid Sales: ${contextualData.summary.unpaidSalesCount} invoice
- Unpaid Purchases: ${contextualData.summary.unpaidPurchaseCount} invoice
- Total Receivables: Rp ${contextualData.totalReceivables.toLocaleString('id-ID')}
- Total Payables: Rp ${contextualData.totalPayables.toLocaleString('id-ID')}

**📋 Detail Unpaid:**
${contextualData.unpaidInvoices.length > 0 ? `• Unpaid Sales: ${contextualData.unpaidInvoices.map((inv: any) => `${inv.contact.name} - ${inv.invoiceNo} (Rp ${parseFloat(inv.total).toLocaleString('id-ID')})`).join(', ')}` : '• Unpaid Sales: Tidak ada'}
${contextualData.unpaidPurchases.length > 0 ? `• Unpaid Purchases: ${contextualData.unpaidPurchases.map((inv: any) => `${inv.contact.name} - ${inv.invoiceNo} (Rp ${parseFloat(inv.total).toLocaleString('id-ID')})`).join(', ')}` : '• Unpaid Purchases: Tidak ada'}
` : ''}

${contextualData.totalInventoryValue !== undefined ? `
**📦 Data Persediaan:**
- Total Items: ${contextualData.summary.totalItems} produk
- Total Movements: ${contextualData.summary.totalMovements} pergerakan
- Low Stock Items: ${contextualData.summary.lowStockCount} item
- High Value Items: ${contextualData.summary.highValueCount} item
- Total Inventory Value: Rp ${contextualData.totalInventoryValue.toLocaleString('id-ID')}
- Total Stock Quantity: ${contextualData.totalStockQuantity.toLocaleString('id-ID')} unit

**📋 Detail Inventory:**
${contextualData.lowStockItems.length > 0 ? `• Low Stock: ${contextualData.lowStockItems.map((item: any) => `${item.product.name} (${item.quantity} ${item.product.unit})`).join(', ')}` : '• Low Stock: Tidak ada'}
${contextualData.highValueItems.length > 0 ? `• High Value: ${contextualData.highValueItems.map((item: any) => `${item.product.name} (Rp ${parseFloat(item.value).toLocaleString('id-ID')})`).join(', ')}` : '• High Value: Tidak ada'}

**📈 Movement Types:**
${contextualData.movementTypes ? Object.entries(contextualData.movementTypes).map(([type, count]) => `• ${type}: ${count} pergerakan`).join('\n') : '• Tidak ada pergerakan stok'}
` : ''}

${contextualData.totalAssetValue !== undefined ? `
**🏢 Data Aset Tetap:**
- Total Assets: ${contextualData.summary.totalAssets} aset
- Active Assets: ${contextualData.summary.activeCount} aset
- Disposed Assets: ${contextualData.summary.disposedCount} aset
- Total Asset Value: Rp ${contextualData.totalAssetValue.toLocaleString('id-ID')}
- Total Depreciation: Rp ${contextualData.totalDepreciation.toLocaleString('id-ID')}

**📋 Detail Assets:**
${contextualData.activeAssets.length > 0 ? `• Active Assets: ${contextualData.activeAssets.map((asset: any) => `${asset.name} (${asset.category}) - Rp ${parseFloat(asset.bookValue).toLocaleString('id-ID')}`).join(', ')}` : '• Active Assets: Tidak ada'}
${contextualData.disposedAssets.length > 0 ? `• Disposed Assets: ${contextualData.disposedAssets.map((asset: any) => `${asset.name} (${asset.category}) - Rp ${parseFloat(asset.disposalAmount || 0).toLocaleString('id-ID')}`).join(', ')}` : '• Disposed Assets: Tidak ada'}

**📈 Assets by Category:**
${contextualData.assetsByCategory ? Object.entries(contextualData.assetsByCategory).map(([category, count]) => `• ${category}: ${count} aset`).join('\n') : '• Tidak ada data kategori'}
` : ''}

${contextualData.totalAssets !== undefined ? `
**📊 Laporan Keuangan:**
- Total Assets: Rp ${contextualData.totalAssets.toLocaleString('id-ID')}
- Total Liabilities: Rp ${contextualData.totalLiabilities.toLocaleString('id-ID')}
- Total Equity: Rp ${contextualData.totalEquity.toLocaleString('id-ID')}
- Total Revenue: Rp ${contextualData.totalRevenue.toLocaleString('id-ID')}
- Total Expenses: Rp ${contextualData.totalExpenses.toLocaleString('id-ID')}
- Net Income: Rp ${contextualData.netIncome.toLocaleString('id-ID')}

**📋 Detail Reports:**
- Total Accounts: ${contextualData.summary.totalAccounts} akun
- Total Journals: ${contextualData.summary.totalJournals} jurnal
- Total Journal Entries: ${contextualData.summary.totalJournalEntries} entry
- Total Tax Rates: ${contextualData.summary.totalTaxRates} tarif pajak
- Total Periods: ${contextualData.summary.totalPeriods} periode
` : ''}

${contextualData.customers !== undefined ? `
**👥 Master Data:**
- Total Customers: ${contextualData.summary.totalCustomers}
- Total Vendors: ${contextualData.summary.totalVendors}
- Total Products: ${contextualData.summary.totalProducts}
- Total COA: ${contextualData.summary.totalCOA}
- Total Bank Accounts: ${contextualData.summary.totalBankAccounts}

**📋 Detail Data:**
${contextualData.customers.length > 0 ? `• Customers: ${contextualData.customers.map((c: any) => c.name).join(', ')}` : '• Customers: Belum ada data'}
${contextualData.vendors.length > 0 ? `• Vendors: ${contextualData.vendors.map((v: any) => v.name).join(', ')}` : '• Vendors: Belum ada data'}
${contextualData.products.length > 0 ? `• Products: ${contextualData.products.map((p: any) => p.name).join(', ')}` : '• Products: Belum ada data'}
` : ''}
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
