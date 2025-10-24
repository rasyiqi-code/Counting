import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting extended seed with dummy data...');

  const companyId = 'default-company-id';
  const userId = 'admin-user-id';

  // Get or create admin user
  let adminUser = await prisma.user.findUnique({
    where: { email: 'admin@contoh.com' },
  });

  if (!adminUser) {
    console.log('❌ Please run basic seed first: pnpm db:seed');
    return;
  }

  // 1. Create Customers (10)
  console.log('👥 Creating customers...');
  const customers = [];
  for (let i = 1; i <= 10; i++) {
    const customer = await prisma.contact.upsert({
      where: { 
        companyId_code: {
          companyId,
          code: `CUST-${String(i).padStart(4, '0')}`,
        },
      },
      update: {},
      create: {
        companyId,
        type: 'CUSTOMER',
        code: `CUST-${String(i).padStart(4, '0')}`,
        name: `Customer ${i} - ${['PT', 'CV', 'UD', 'Toko'][i % 4]} ${['Maju', 'Jaya', 'Sentosa', 'Abadi'][i % 4]}`,
        email: `customer${i}@email.com`,
        phone: `08${String(i).padStart(10, '0')}`,
        address: `Jl. Customer ${i} No. ${i * 10}`,
        city: ['Jakarta', 'Bandung', 'Surabaya', 'Semarang', 'Medan'][i % 5],
        province: ['DKI Jakarta', 'Jawa Barat', 'Jawa Timur', 'Jawa Tengah', 'Sumatera Utara'][i % 5],
        postalCode: `${10000 + i * 100}`,
        country: 'Indonesia',
        npwp: `01.${String(i).padStart(3, '0')}.${String(i).padStart(3, '0')}.1-${String(i).padStart(3, '0')}.000`,
        creditLimit: new Decimal(50000000 + i * 10000000),
        paymentTerms: 30,
      },
    });
    customers.push(customer);
  }
  console.log(`✅ Created ${customers.length} customers`);

  // 2. Create Vendors (8)
  console.log('🏪 Creating vendors...');
  const vendors = [];
  for (let i = 1; i <= 8; i++) {
    const vendor = await prisma.contact.upsert({
      where: {
        companyId_code: {
          companyId,
          code: `VEND-${String(i).padStart(4, '0')}`,
        },
      },
      update: {},
      create: {
        companyId,
        type: 'VENDOR',
        code: `VEND-${String(i).padStart(4, '0')}`,
        name: `Vendor ${i} - ${['PT', 'CV', 'UD'][i % 3]} Supplier ${['Prima', 'Utama', 'Mandiri'][i % 3]}`,
        email: `vendor${i}@supplier.com`,
        phone: `021${String(i).padStart(8, '0')}`,
        address: `Jl. Vendor ${i} No. ${i * 5}`,
        city: ['Jakarta', 'Tangerang', 'Bekasi', 'Bogor'][i % 4],
        province: ['DKI Jakarta', 'Banten', 'Jawa Barat'][i % 3],
        postalCode: `${15000 + i * 100}`,
        country: 'Indonesia',
        npwp: `02.${String(i).padStart(3, '0')}.${String(i).padStart(3, '0')}.2-${String(i).padStart(3, '0')}.000`,
        creditLimit: new Decimal(30000000 + i * 5000000),
        paymentTerms: 14,
      },
    });
    vendors.push(vendor);
  }
  console.log(`✅ Created ${vendors.length} vendors`);

  // 3. Create Products (20)
  console.log('📦 Creating products...');
  const products = [];
  const productCategories = ['Electronics', 'Furniture', 'Stationery', 'Hardware', 'Textiles'];
  const productNames = [
    'Laptop HP', 'Mouse Wireless', 'Keyboard Mechanical', 'Monitor LED 24"', 'Printer Laser',
    'Meja Kantor', 'Kursi Ergonomis', 'Lemari Arsip', 'Rak Buku', 'Filing Cabinet',
    'Kertas A4', 'Pulpen', 'Spidol', 'Stapler', 'Paper Clip',
    'Baut', 'Mur', 'Kunci', 'Obeng Set', 'Tang Kombinasi',
  ];

  for (let i = 0; i < 20; i++) {
    const product = await prisma.product.upsert({
      where: {
        companyId_sku: {
          companyId,
          sku: `PRD-${String(i + 1).padStart(4, '0')}`,
        },
      },
      update: {},
      create: {
        companyId,
        sku: `PRD-${String(i + 1).padStart(4, '0')}`,
        name: productNames[i],
        description: `${productNames[i]} - Kualitas premium untuk kebutuhan bisnis`,
        type: 'GOODS',
        category: productCategories[i % productCategories.length],
        unit: i < 5 ? 'PCS' : i < 10 ? 'UNIT' : 'BOX',
        purchasePrice: new Decimal((i + 1) * 50000),
        salePrice: new Decimal((i + 1) * 75000),
        stockMethod: 'FIFO',
        trackInventory: true,
        minStock: new Decimal(10 + i * 2),
        taxable: true,
      },
    });
    products.push(product);
  }
  console.log(`✅ Created ${products.length} products`);

  // 4. Create Sales Invoices - SKIPPED (Schema mismatch)
  console.log('💰 Skipping sales invoices (schema mismatch)...');
  /* 
  // TODO: Fix schema fields for Invoice/InvoiceItem
  const cashAccount = await prisma.chartOfAccount.findFirst({
    where: { companyId, code: '1-10100', accountType: 'ASSET' },
  });
  
  if (cashAccount) {
    for (let i = 1; i <= 15; i++) {
      const customer = customers[i % customers.length];
      const invoiceDate = new Date();
      invoiceDate.setDate(invoiceDate.getDate() - (30 - i * 2));

      // Generate 3 items per invoice
      const invoiceItems = [];
      let subtotal = new Decimal(0);
      
      for (let j = 0; j < 3; j++) {
        const product = products[(i * 3 + j) % products.length];
        const quantity = new Decimal(2 + j);
        const unitPrice = product.salePrice || new Decimal(100000);
        const amount = unitPrice.mul(quantity);
        subtotal = subtotal.add(amount);

        invoiceItems.push({
          productId: product.id,
          description: product.name,
          quantity,
          unitPrice,
          discount: new Decimal(0),
          taxAmount: new Decimal(0),
          amount,
        });
      }

      const taxAmount = subtotal.mul(0.11); // PPN 11%
      const totalAmount = subtotal.add(taxAmount);

      const invoice = await prisma.invoice.create({
        data: {
          companyId,
          contactId: customer.id,
          invoiceNumber: `INV/${new Date().getFullYear()}/${String(i).padStart(5, '0')}`,
          invoiceDate,
          dueDate: new Date(invoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000),
          subtotal,
          taxAmount,
          totalAmount,
          paidAmount: i <= 10 ? totalAmount : new Decimal(0), // 10 invoices paid
          balanceDue: i <= 10 ? new Decimal(0) : totalAmount,
          status: i <= 10 ? 'PAID' : 'UNPAID',
          notes: `Sales invoice for ${customer.name}`,
          items: {
            create: invoiceItems,
          },
        },
      });

      // Create journal entry - simplified to ensure balance
      await prisma.journalEntry.create({
        data: {
          journalNumber: `JRN/SI/${String(i).padStart(5, '0')}`,
          transactionDate: invoiceDate,
          description: `Sales Invoice ${invoice.invoiceNumber}`,
          reference: `SI-${invoice.id}`,
          totalDebit: totalAmount,
          totalCredit: totalAmount,
          status: 'POSTED',
          lines: {
            create: [
              {
                accountId: i <= 10 ? cashAccount.id : arAccount.id,
                description: 'AR/Cash from sales',
                debit: totalAmount,
                credit: new Decimal(0),
              },
              {
                accountId: revenueAccount.id,
                description: 'Sales revenue',
                debit: new Decimal(0),
                credit: totalAmount, // Simplified: credit = totalAmount (no separate tax)
              },
            ],
          },
        },
      });
    }
  }
  */

  // 5. Create Purchase Bills - SKIPPED (Schema mismatch)
  console.log('🛒 Skipping purchase bills (schema mismatch)...');
  /*
  // TODO: Fix schema fields for Invoice/InvoiceItem
  const apAccount = await prisma.chartOfAccount.findFirst({
    where: { companyId, code: '2-20100', accountType: 'LIABILITY' },
  });
  
  if (apAccount) {
    for (let i = 1; i <= 12; i++) {
      const vendor = vendors[i % vendors.length];
      const billDate = new Date();
      billDate.setDate(billDate.getDate() - (25 - i * 2));

      const billItems = [];
      let subtotal = new Decimal(0);

      for (let j = 0; j < 2; j++) {
        const product = products[(i * 2 + j) % products.length];
        const quantity = new Decimal(5 + j * 2);
        const unitPrice = product.purchasePrice || new Decimal(50000);
        const amount = unitPrice.mul(quantity);
        subtotal = subtotal.add(amount);

        billItems.push({
          productId: product.id,
          description: `Purchase ${product.name}`,
          quantity,
          unitPrice,
          discount: new Decimal(0),
          taxAmount: new Decimal(0),
          amount,
        });
      }

      const taxAmount = subtotal.mul(0.11);
      const totalAmount = subtotal.add(taxAmount);

      const bill = await prisma.invoice.create({
        data: {
          companyId,
          vendorId: vendor.id,
          billNumber: `BILL/${new Date().getFullYear()}/${String(i).padStart(5, '0')}`,
          billDate,
          dueDate: new Date(billDate.getTime() + 14 * 24 * 60 * 60 * 1000),
          subtotal,
          taxAmount,
          totalAmount,
          paidAmount: i <= 8 ? totalAmount : new Decimal(0),
          balanceDue: i <= 8 ? new Decimal(0) : totalAmount,
          status: i <= 8 ? 'PAID' : 'UNPAID',
          notes: `Purchase from ${vendor.name}`,
          items: {
            create: billItems,
          },
        },
      });

      // Create journal entry
      await prisma.journalEntry.create({
        data: {
          journalNumber: `JRN/PB/${String(i).padStart(5, '0')}`,
          transactionDate: billDate,
          description: `Purchase Bill ${bill.billNumber}`,
          reference: `PB-${bill.id}`,
          totalDebit: totalAmount,
          totalCredit: totalAmount,
          status: 'POSTED',
          lines: {
            create: [
              {
                accountId: cogsAccount.id,
                description: 'Purchase/COGS',
                debit: subtotal,
                credit: new Decimal(0),
              },
              {
                accountId: cogsAccount.id, // Simplified - should be tax credit account
                description: 'PPN Input',
                debit: taxAmount,
                credit: new Decimal(0),
              },
              {
                accountId: i <= 8 ? cashAccount.id : apAccount.id,
                description: 'AP/Cash for purchases',
                debit: new Decimal(0),
                credit: totalAmount,
              },
            ],
          },
        },
      });
    }
  }
  */

  // 4.1. Create Bank Account (if not exists)
  console.log('🏦 Creating bank account...');
  const cashAccountForBank = await prisma.chartOfAccount.findFirst({
    where: { companyId, accountType: 'ASSET', name: { contains: 'Kas' } },
  });
  
  let bankAccount = await prisma.bankAccount.findFirst({
    where: { companyId },
  });
  
  if (!bankAccount && cashAccountForBank) {
    bankAccount = await prisma.bankAccount.create({
      data: {
        companyId,
        name: 'BCA - Rekening Operasional',
        accountType: 'BANK',
        bankName: 'Bank Central Asia',
        accountNumber: '1234567890',
        accountHolder: 'PT Counting App',
        accountId: cashAccountForBank.id,
        balance: new Decimal(0),
        isDefault: true,
        isActive: true,
      },
    });
    console.log('✅ Created bank account');
  } else {
    console.log('✅ Bank account already exists or cash account not found');
  }

  // 5. Create Sales Invoices (15)
  console.log('💰 Creating sales invoices...');
  
  // Clean up existing invoices and payments to avoid unique constraint errors
  console.log('🧹 Cleaning up existing invoices and payments...');
  await prisma.paymentAllocation.deleteMany({ where: { payment: { companyId } } });
  await prisma.payment.deleteMany({ where: { companyId } });
  await prisma.invoiceItem.deleteMany({ where: { invoice: { companyId } } });
  await prisma.invoice.deleteMany({ where: { companyId } });
  await prisma.journalEntry.deleteMany({ where: { journal: { companyId, sourceType: { in: ['SALES', 'PAYMENT', 'PURCHASE'] } } } });
  await prisma.journal.deleteMany({ where: { companyId, sourceType: { in: ['SALES', 'PAYMENT', 'PURCHASE'] } } });
  
  const salesInvoices = [];
  
  // Get revenue account
  const revenueAccount = await prisma.chartOfAccount.findFirst({
    where: { companyId, accountType: 'REVENUE' },
  });
  
  // Get cash account
  const cashAccount = await prisma.chartOfAccount.findFirst({
    where: { companyId, accountType: 'ASSET', name: { contains: 'Kas' } },
  });
  
  // Get receivables account
  const receivablesAccount = await prisma.chartOfAccount.findFirst({
    where: { companyId, accountType: 'ASSET', name: { contains: 'Piutang' } },
  });

  if (revenueAccount && cashAccount && receivablesAccount && customers.length > 0 && products.length > 0) {
    for (let i = 1; i <= 15; i++) {
      const customer = customers[i % customers.length];
      const invoiceDate = new Date(2024, 0, 1 + i * 2); // Spread over time
      const dueDate = new Date(invoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days later
      
      // Select 1-3 random products
      const numItems = Math.floor(Math.random() * 3) + 1;
      const selectedProducts: any[] = [];
      for (let j = 0; j < numItems; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        if (!selectedProducts.find(p => p.id === product.id)) {
          selectedProducts.push(product);
        }
      }
      
      // Calculate totals
      let subtotal = 0;
      const items = selectedProducts.map(product => {
        const quantity = Math.floor(Math.random() * 5) + 1;
        const unitPrice = Number(product.salePrice || 0);
        const total = quantity * unitPrice;
        subtotal += total;
        
        return {
          productId: product.id,
          quantity,
          unitPrice,
          total,
        };
      });
      
      const taxRate = 0.11; // 11% PPN
      const taxAmount = subtotal * taxRate;
      const totalAmount = subtotal + taxAmount;
      
      // Create invoice
      const invoice = await prisma.invoice.create({
        data: {
          companyId,
          type: 'SALES',
          invoiceNo: `INV-${String(i).padStart(4, '0')}`,
          date: invoiceDate,
          dueDate,
          contactId: customer.id,
          subtotal: new Decimal(subtotal),
          taxAmount: new Decimal(taxAmount),
          total: new Decimal(totalAmount),
          status: i <= 10 ? 'PAID' : 'PENDING', // First 10 are paid
        },
      });
      
      // Create invoice items
      for (const item of items) {
        await prisma.invoiceItem.create({
          data: {
            invoiceId: invoice.id,
            productId: item.productId,
            quantity: new Decimal(item.quantity),
            unitPrice: new Decimal(item.unitPrice),
            subtotal: new Decimal(item.total),
            total: new Decimal(item.total),
          },
        });
      }
      
      // Create journal entries for paid invoices
      if (i <= 10) {
        // Create journal first
        const journal = await prisma.journal.create({
          data: {
            companyId,
            journalNo: `JRN-${String(i).padStart(4, '0')}`,
            date: invoiceDate,
            description: `Sales invoice ${invoice.invoiceNo}`,
            status: 'POSTED',
            sourceType: 'SALES',
            sourceId: invoice.id,
          },
        });
        
        // Debit: Cash/Bank
        await prisma.journalEntry.create({
          data: {
            journalId: journal.id,
            accountId: cashAccount.id,
            debit: new Decimal(totalAmount),
            credit: new Decimal(0),
            description: `Sales invoice ${invoice.invoiceNo}`,
          },
        });
        
        // Credit: Revenue
        await prisma.journalEntry.create({
          data: {
            journalId: journal.id,
            accountId: revenueAccount.id,
            debit: new Decimal(0),
            credit: new Decimal(subtotal),
            description: `Sales revenue ${invoice.invoiceNo}`,
          },
        });
        
        // Credit: Tax Payable (if tax > 0)
        if (taxAmount > 0) {
          const taxAccount = await prisma.chartOfAccount.findFirst({
            where: { companyId, accountType: 'LIABILITY', name: { contains: 'PPN' } },
          });
          
          if (taxAccount) {
            await prisma.journalEntry.create({
              data: {
                journalId: journal.id,
                accountId: taxAccount.id,
                debit: new Decimal(0),
                credit: new Decimal(taxAmount),
                description: `PPN ${invoice.invoiceNo}`,
              },
            });
          }
        }
      } else {
        // For pending invoices, create receivables entry
        const journal = await prisma.journal.create({
          data: {
            companyId,
            journalNo: `JRN-${String(i).padStart(4, '0')}`,
            date: invoiceDate,
            description: `Sales invoice ${invoice.invoiceNo}`,
            status: 'POSTED',
            sourceType: 'SALES',
            sourceId: invoice.id,
          },
        });
        
        // Debit: Receivables
        await prisma.journalEntry.create({
          data: {
            journalId: journal.id,
            accountId: receivablesAccount.id,
            debit: new Decimal(totalAmount),
            credit: new Decimal(0),
            description: `Sales invoice ${invoice.invoiceNo}`,
          },
        });
        
        // Credit: Revenue
        await prisma.journalEntry.create({
          data: {
            journalId: journal.id,
            accountId: revenueAccount.id,
            debit: new Decimal(0),
            credit: new Decimal(subtotal),
            description: `Sales revenue ${invoice.invoiceNo}`,
          },
        });
      }
      
      salesInvoices.push(invoice);
    }
    console.log('✅ Created 15 sales invoices with journal entries');
    
    // 5.1. Create Sales Payments for some pending invoices
    console.log('💰 Creating sales payments...');
    
    const pendingInvoices = salesInvoices.filter(inv => inv.status === 'PENDING').slice(0, 3);
    const salesPayments: any[] = [];
    
    if (pendingInvoices.length > 0 && bankAccount) {
      for (let i = 0; i < pendingInvoices.length; i++) {
        const invoiceData = pendingInvoices[i];
        
        // Fetch invoice with contact details
        const invoice = await prisma.invoice.findUnique({
          where: { id: invoiceData.id },
          include: { contact: true },
        });
        
        if (!invoice) continue;
        
        const paymentDate = new Date(invoice.date);
        paymentDate.setDate(paymentDate.getDate() + 5 + i * 2); // Payment a few days after invoice
        
        const paymentAmount = Number(invoice.total.toString());
        
        // Create payment
        const payment = await prisma.payment.create({
          data: {
            companyId,
            paymentNo: `PAY-${String(i + 1).padStart(4, '0')}`,
            type: 'RECEIVE',
            contactId: invoice.contactId,
            bankAccountId: bankAccount.id,
            date: paymentDate,
            amount: new Decimal(paymentAmount),
            paymentMethod: 'BANK_TRANSFER',
            referenceNo: `TRF-${String(i + 1).padStart(6, '0')}`,
            description: `Payment for ${invoice.invoiceNo}`,
            status: 'COMPLETED',
          },
        });
        
        // Create payment allocation (link payment to invoice)
        await prisma.paymentAllocation.create({
          data: {
            paymentId: payment.id,
            invoiceId: invoice.id,
            amount: new Decimal(paymentAmount),
          },
        });
        
        // Update invoice paid amount and status
        await prisma.invoice.update({
          where: { id: invoice.id },
          data: {
            paidAmount: new Decimal(paymentAmount),
            status: 'PAID',
          },
        });
        
        // Create journal entry for the payment
        const paymentJournal = await prisma.journal.create({
          data: {
            companyId,
            journalNo: `JRN-PAY-${String(i + 1).padStart(4, '0')}`,
            date: paymentDate,
            description: `Payment received ${payment.paymentNo}`,
            status: 'POSTED',
            sourceType: 'PAYMENT',
            sourceId: payment.id,
          },
        });
        
        // Debit: Bank/Cash (increase cash)
        await prisma.journalEntry.create({
          data: {
            journalId: paymentJournal.id,
            accountId: cashAccount.id,
            debit: new Decimal(paymentAmount),
            credit: new Decimal(0),
            description: `Payment received from ${invoice.contact?.name || 'customer'}`,
          },
        });
        
        // Credit: Accounts Receivable (decrease receivables)
        await prisma.journalEntry.create({
          data: {
            journalId: paymentJournal.id,
            accountId: receivablesAccount.id,
            debit: new Decimal(0),
            credit: new Decimal(paymentAmount),
            description: `Payment for ${invoice.invoiceNo}`,
          },
        });
        
        salesPayments.push(payment);
      }
      console.log(`✅ Created ${salesPayments.length} sales payments with journal entries`);
    }
  } else {
    console.log('⚠️ Skipping sales invoices - missing required accounts or data');
  }

  // 6. Create Purchase Bills (12)
  console.log('🛒 Creating purchase bills...');
  
  const expenseAccount = await prisma.chartOfAccount.findFirst({
    where: { companyId, accountType: 'EXPENSE' },
  });
  
  const payablesAccount = await prisma.chartOfAccount.findFirst({
    where: { companyId, code: '2-1100', accountType: 'LIABILITY' },
  });
  
  const taxAccountForBills = await prisma.chartOfAccount.findFirst({
    where: { companyId, code: '2-1200', accountType: 'LIABILITY' },
  });
  
  const purchaseBills: any[] = [];
  
  if (expenseAccount && payablesAccount && cashAccount && vendors.length > 0 && products.length > 0) {
    for (let i = 1; i <= 12; i++) {
      const vendor = vendors[i % vendors.length];
      const billDate = new Date(2024, 0, 1 + i * 2); // Spread over time
      const dueDate = new Date(billDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days later
      
      // Select 1-3 random products
      const numItems = Math.floor(Math.random() * 3) + 1;
      const selectedProducts: any[] = [];
      for (let j = 0; j < numItems; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        if (!selectedProducts.find(p => p.id === product.id)) {
          selectedProducts.push(product);
        }
      }
      
      // Calculate totals
      let subtotal = 0;
      const items = selectedProducts.map(product => {
        const quantity = Math.floor(Math.random() * 10) + 1;
        const unitPrice = Number(product.purchasePrice || 0);
        const total = quantity * unitPrice;
        subtotal += total;
        
        return {
          productId: product.id,
          quantity,
          unitPrice,
          total,
        };
      });
      
      const taxRate = 0.11; // 11% PPN
      const taxAmount = subtotal * taxRate;
      const totalAmount = subtotal + taxAmount;
      
      // Create bill (using Invoice model with type='PURCHASE')
      const bill = await prisma.invoice.create({
        data: {
          companyId,
          type: 'PURCHASE',
          invoiceNo: `BILL-${String(i).padStart(4, '0')}`,
          date: billDate,
          dueDate,
          contactId: vendor.id,
          subtotal: new Decimal(subtotal),
          taxAmount: new Decimal(taxAmount),
          total: new Decimal(totalAmount),
          status: i <= 8 ? 'PAID' : 'PENDING', // First 8 are paid
        },
      });
      
      // Create bill items
      for (const item of items) {
        await prisma.invoiceItem.create({
          data: {
            invoiceId: bill.id,
            productId: item.productId,
            quantity: new Decimal(item.quantity),
            unitPrice: new Decimal(item.unitPrice),
            subtotal: new Decimal(item.total),
            total: new Decimal(item.total),
          },
        });
      }
      
      // Create journal entries for paid bills
      if (i <= 8) {
        // Create journal first
        const journal = await prisma.journal.create({
          data: {
            companyId,
            journalNo: `JRN-BILL-${String(i).padStart(4, '0')}`,
            date: billDate,
            description: `Purchase bill ${bill.invoiceNo}`,
            status: 'POSTED',
            sourceType: 'PURCHASE',
            sourceId: bill.id,
          },
        });
        
        // Simplified journal entries to ensure balance
        // Debit: Expense (total amount)
        await prisma.journalEntry.create({
          data: {
            journalId: journal.id,
            accountId: expenseAccount.id,
            debit: new Decimal(totalAmount),
            credit: new Decimal(0),
            description: `Purchase expense ${bill.invoiceNo}`,
          },
        });
        
        // Credit: Cash (total amount)
        await prisma.journalEntry.create({
          data: {
            journalId: journal.id,
            accountId: cashAccount.id,
            debit: new Decimal(0),
            credit: new Decimal(totalAmount),
            description: `Payment for ${bill.invoiceNo}`,
          },
        });
        
        // Update bill as paid
        await prisma.invoice.update({
          where: { id: bill.id },
          data: {
            paidAmount: new Decimal(totalAmount),
            status: 'PAID',
          },
        });
      } else {
        // For pending bills, create payables entry
        const journal = await prisma.journal.create({
          data: {
            companyId,
            journalNo: `JRN-BILL-${String(i).padStart(4, '0')}`,
            date: billDate,
            description: `Purchase bill ${bill.invoiceNo}`,
            status: 'POSTED',
            sourceType: 'PURCHASE',
            sourceId: bill.id,
          },
        });
        
        // Simplified journal entries to ensure balance
        // Debit: Expense (total amount)
        await prisma.journalEntry.create({
          data: {
            journalId: journal.id,
            accountId: expenseAccount.id,
            debit: new Decimal(totalAmount),
            credit: new Decimal(0),
            description: `Purchase expense ${bill.invoiceNo}`,
          },
        });
        
        // Credit: Accounts Payable (total amount)
        await prisma.journalEntry.create({
          data: {
            journalId: journal.id,
            accountId: payablesAccount.id,
            debit: new Decimal(0),
            credit: new Decimal(totalAmount),
            description: `Accounts payable ${bill.invoiceNo}`,
          },
        });
      }
      
      purchaseBills.push(bill);
    }
    console.log('✅ Created 12 purchase bills with journal entries');
    
    // 6.1. Create Purchase Payments for some pending bills
    console.log('💸 Creating purchase payments...');
    
    const pendingBills = purchaseBills.filter(bill => bill.status === 'PENDING').slice(0, 2);
    const purchasePayments: any[] = [];
    
    if (pendingBills.length > 0 && bankAccount) {
      for (let i = 0; i < pendingBills.length; i++) {
        const billData = pendingBills[i];
        
        // Fetch bill with contact details
        const bill = await prisma.invoice.findUnique({
          where: { id: billData.id },
          include: { contact: true },
        });
        
        if (!bill) continue;
        
        const paymentDate = new Date(bill.date);
        paymentDate.setDate(paymentDate.getDate() + 7 + i * 3); // Payment a week after bill
        
        const paymentAmount = Number(bill.total.toString());
        
        // Create payment
        const payment = await prisma.payment.create({
          data: {
            companyId,
            paymentNo: `PAY-BILL-${String(i + 1).padStart(4, '0')}`,
            type: 'PAY',
            contactId: bill.contactId,
            bankAccountId: bankAccount.id,
            date: paymentDate,
            amount: new Decimal(paymentAmount),
            paymentMethod: 'BANK_TRANSFER',
            referenceNo: `TRF-BILL-${String(i + 1).padStart(6, '0')}`,
            description: `Payment for ${bill.invoiceNo}`,
            status: 'COMPLETED',
          },
        });
        
        // Create payment allocation (link payment to bill)
        await prisma.paymentAllocation.create({
          data: {
            paymentId: payment.id,
            invoiceId: bill.id,
            amount: new Decimal(paymentAmount),
          },
        });
        
        // Update bill paid amount and status
        await prisma.invoice.update({
          where: { id: bill.id },
          data: {
            paidAmount: new Decimal(paymentAmount),
            status: 'PAID',
          },
        });
        
        // Create journal entry for the payment
        const paymentJournal = await prisma.journal.create({
          data: {
            companyId,
            journalNo: `JRN-PAYBILL-${String(i + 1).padStart(4, '0')}`,
            date: paymentDate,
            description: `Payment made ${payment.paymentNo}`,
            status: 'POSTED',
            sourceType: 'PAYMENT',
            sourceId: payment.id,
          },
        });
        
        // Debit: Accounts Payable (decrease payables)
        await prisma.journalEntry.create({
          data: {
            journalId: paymentJournal.id,
            accountId: payablesAccount.id,
            debit: new Decimal(paymentAmount),
            credit: new Decimal(0),
            description: `Payment to ${bill.contact?.name || 'vendor'}`,
          },
        });
        
        // Credit: Bank/Cash (decrease cash)
        await prisma.journalEntry.create({
          data: {
            journalId: paymentJournal.id,
            accountId: cashAccount.id,
            debit: new Decimal(0),
            credit: new Decimal(paymentAmount),
            description: `Payment for ${bill.invoiceNo}`,
          },
        });
        
        purchasePayments.push(payment);
      }
      console.log(`✅ Created ${purchasePayments.length} purchase payments with journal entries`);
    }
  } else {
    console.log('⚠️ Skipping purchase bills - missing required accounts or data');
  }

  // 7. Create Inventory Data (Stock Items, Movements, Adjustments)
  console.log('📦 Creating inventory data...');
  
  // 7.1. Create Inventory Items (current stock levels)
  const inventoryItems: any[] = [];
  if (products.length > 0) {
    for (let i = 0; i < Math.min(15, products.length); i++) {
      const product = products[i];
      const quantity = Math.floor(Math.random() * 100) + 10;
      const avgCost = Number(product.purchasePrice || 0);
      const totalValue = quantity * avgCost;
      
      const inventoryItem = await prisma.inventoryItem.create({
        data: {
          companyId,
          productId: product.id,
          warehouseId: 'default',
          quantity: new Decimal(quantity),
          value: new Decimal(totalValue),
          averageCost: new Decimal(avgCost),
        },
      });
      
      inventoryItems.push(inventoryItem);
    }
    console.log(`✅ Created ${inventoryItems.length} inventory items`);
  }
  
  // 7.2. Create Stock Movements (stock card history)
  const stockMovements: any[] = [];
  if (inventoryItems.length > 0) {
    for (let i = 0; i < 30; i++) {
      const inventoryItem = inventoryItems[Math.floor(Math.random() * inventoryItems.length)];
      const product = products.find(p => p.id === inventoryItem.productId);
      
      const movementTypes = ['IN', 'OUT', 'ADJUSTMENT'];
      const movementType = movementTypes[Math.floor(Math.random() * movementTypes.length)];
      
      const referenceTypes = ['PURCHASE', 'SALES', 'ADJUSTMENT', 'TRANSFER'];
      const referenceType = referenceTypes[Math.floor(Math.random() * referenceTypes.length)];
      
      const quantity = Math.floor(Math.random() * 20) + 1;
      const unitCost = Number(product?.purchasePrice || 0);
      const totalCost = quantity * unitCost;
      
      const movementDate = new Date(2024, 0, 1 + i);
      
      const movement = await prisma.stockMovement.create({
        data: {
          companyId,
          productId: inventoryItem.productId,
          warehouseId: 'default',
          movementType,
          quantity: new Decimal(movementType === 'OUT' ? -quantity : quantity),
          unitCost: new Decimal(unitCost),
          totalCost: new Decimal(totalCost),
          date: movementDate,
          referenceNo: `${referenceType}-${String(i + 1).padStart(4, '0')}`,
          referenceType,
          notes: `${movementType} - ${referenceType} transaction`,
        },
      });
      
      stockMovements.push(movement);
    }
    console.log(`✅ Created ${stockMovements.length} stock movements`);
  }
  
  // 7.3. Create Stock Adjustments (using stock movements with type ADJUSTMENT)
  const adjustments: any[] = [];
  if (inventoryItems.length > 0) {
    for (let i = 0; i < 5; i++) {
      const inventoryItem = inventoryItems[Math.floor(Math.random() * inventoryItems.length)];
      const product = products.find(p => p.id === inventoryItem.productId);
      
      const adjustmentTypes = ['INCREASE', 'DECREASE', 'RECOUNT'];
      const adjustmentType = adjustmentTypes[Math.floor(Math.random() * adjustmentTypes.length)];
      
      const adjustmentQty = Math.floor(Math.random() * 10) + 1;
      const isDecrease = adjustmentType === 'DECREASE';
      
      const unitCost = Number(product?.purchasePrice || 0);
      const totalCost = adjustmentQty * unitCost;
      
      const adjustmentDate = new Date(2024, 0, 10 + i * 3);
      
      const adjustment = await prisma.stockMovement.create({
        data: {
          companyId,
          productId: inventoryItem.productId,
          warehouseId: 'default',
          movementType: 'ADJUSTMENT',
          quantity: new Decimal(isDecrease ? -adjustmentQty : adjustmentQty),
          unitCost: new Decimal(unitCost),
          totalCost: new Decimal(totalCost),
          date: adjustmentDate,
          referenceNo: `ADJ-${String(i + 1).padStart(4, '0')}`,
          referenceType: 'ADJUSTMENT',
          notes: `Stock ${adjustmentType} - ${product?.name || 'Product'}`,
        },
      });
      
      // Update inventory item quantity
      const currentQty = Number(inventoryItem.quantity.toString());
      const newQty = isDecrease ? currentQty - adjustmentQty : currentQty + adjustmentQty;
      
      await prisma.inventoryItem.update({
        where: { id: inventoryItem.id },
        data: {
          quantity: new Decimal(Math.max(0, newQty)),
          value: new Decimal(Math.max(0, newQty) * unitCost),
        },
      });
      
      adjustments.push(adjustment);
    }
    console.log(`✅ Created ${adjustments.length} stock adjustments`);
  }

  // 8. Create Fixed Assets (5)
  console.log('🏢 Creating fixed assets...');
  const assetAccount = await prisma.chartOfAccount.findFirst({
    where: { companyId, code: '1-13000', accountType: 'ASSET' },
  });

  if (assetAccount) {
    const assetTypes = [
      { name: 'Laptop HP Pavilion', category: 'EQUIPMENT', price: 15000000, usefulLife: 4 },
      { name: 'Printer Canon', category: 'EQUIPMENT', price: 5000000, usefulLife: 5 },
      { name: 'Meja Kantor Eksekutif', category: 'FURNITURE', price: 8000000, usefulLife: 8 },
      { name: 'AC Split 2 PK', category: 'EQUIPMENT', price: 6500000, usefulLife: 10 },
      { name: 'Mobil Toyota Avanza', category: 'VEHICLE', price: 250000000, usefulLife: 8 },
    ];

    for (let i = 0; i < assetTypes.length; i++) {
      const assetType = assetTypes[i];
      const purchaseDate = new Date();
      purchaseDate.setMonth(purchaseDate.getMonth() - (6 - i));

      await prisma.fixedAsset.create({
        data: {
          companyId,
          assetNo: `FA-${String(i + 1).padStart(4, '0')}`,
          name: assetType.name,
          category: assetType.category,
          description: `${assetType.name} untuk operasional kantor`,
          purchaseDate,
          purchasePrice: new Decimal(assetType.price),
          usefulLife: assetType.usefulLife,
          residualValue: new Decimal(assetType.price * 0.1),
          depreciationMethod: 'STRAIGHT_LINE',
          accumulatedDepreciation: new Decimal(0),
          bookValue: new Decimal(assetType.price),
          status: 'ACTIVE',
          assetAccountId: assetAccount.id,
          depreciationExpenseAccountId: assetAccount.id, // Temporary - should be expense account
          accumulatedDepreciationAccountId: assetAccount.id, // Temporary - should be contra-asset account
        },
      });
    }
    console.log('✅ Created 5 fixed assets');
  }

  console.log('');
  console.log('✨ Extended seed completed successfully!');
  console.log('');
  console.log('📊 Summary:');
  console.log(`   - Bank Account: ${bankAccount ? '1 (BCA)' : '0'}`);
  console.log(`   - Customers: ${customers.length}`);
  console.log(`   - Vendors: ${vendors.length}`);
  console.log(`   - Products: ${products.length}`);
  console.log(`   - Sales Invoices: ${salesInvoices.length}`);
  console.log('   - Sales Payments: 3 (linked to invoices)');
  console.log(`   - Purchase Bills: ${purchaseBills.length}`);
  console.log('   - Purchase Payments: 2 (linked to bills)');
  console.log(`   - Inventory Items: ${inventoryItems.length}`);
  console.log(`   - Stock Movements: ${stockMovements.length}`);
  console.log(`   - Stock Adjustments: ${adjustments.length}`);
  console.log('   - Fixed Assets: 5');
  console.log('');
  console.log('🎯 You can now explore the application with realistic data!');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Extended seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

