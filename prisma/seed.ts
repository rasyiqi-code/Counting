import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // 1. Create default company
  console.log('📊 Creating default company...');
  const company = await prisma.company.upsert({
    where: { id: 'default-company-id' },
    update: {},
    create: {
      id: 'default-company-id',
      name: 'PT. Contoh Perusahaan',
      legalName: 'PT. Contoh Perusahaan Indonesia',
      address: 'Jl. Sudirman No. 123',
      city: 'Jakarta',
      province: 'DKI Jakarta',
      postalCode: '12345',
      country: 'Indonesia',
      phone: '021-1234567',
      email: 'info@contoh.com',
      npwp: '01.234.567.8-910.000',
      baseCurrency: 'IDR',
      fiscalYearStart: new Date('2025-01-01'),
    },
  });
  console.log('✅ Company created:', company.name);

  // 2. Create admin user
  console.log('👤 Creating admin user...');
  const hashedPassword = await hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@contoh.com' },
    update: {},
    create: {
      email: 'admin@contoh.com',
      name: 'Administrator',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      companyId: company.id,
    },
  });
  console.log('✅ Admin user created:', adminUser.email);
  console.log('   Password: admin123 (change in production!)');

  // 3. Create Chart of Accounts (COA) - Indonesian Standard
  console.log('📋 Creating Chart of Accounts...');
  
  const accounts = [
    // ASET (1)
    { code: '1', name: 'ASET', type: 'ASSET', category: 'CURRENT_ASSET', parentId: null },
    { code: '1-1', name: 'Aset Lancar', type: 'ASSET', category: 'CURRENT_ASSET', parentId: null },
    { code: '1-1100', name: 'Kas', type: 'ASSET', category: 'CURRENT_ASSET', parentId: null },
    { code: '1-1200', name: 'Bank', type: 'ASSET', category: 'CURRENT_ASSET', parentId: null },
    { code: '1-1300', name: 'Piutang Usaha', type: 'ASSET', category: 'CURRENT_ASSET', parentId: null },
    { code: '1-1400', name: 'Persediaan', type: 'ASSET', category: 'CURRENT_ASSET', parentId: null },
    { code: '1-1500', name: 'PPN Masukan', type: 'ASSET', category: 'CURRENT_ASSET', parentId: null },
    { code: '1-1600', name: 'Uang Muka Pembelian', type: 'ASSET', category: 'CURRENT_ASSET', parentId: null },
    { code: '1-1700', name: 'Biaya Dibayar Dimuka', type: 'ASSET', category: 'CURRENT_ASSET', parentId: null },
    
    { code: '1-2', name: 'Aset Tetap', type: 'ASSET', category: 'FIXED_ASSET', parentId: null },
    { code: '1-2100', name: 'Tanah', type: 'ASSET', category: 'FIXED_ASSET', parentId: null },
    { code: '1-2200', name: 'Bangunan', type: 'ASSET', category: 'FIXED_ASSET', parentId: null },
    { code: '1-2300', name: 'Kendaraan', type: 'ASSET', category: 'FIXED_ASSET', parentId: null },
    { code: '1-2400', name: 'Peralatan Kantor', type: 'ASSET', category: 'FIXED_ASSET', parentId: null },
    { code: '1-2900', name: 'Akumulasi Penyusutan', type: 'ASSET', category: 'FIXED_ASSET', parentId: null },

    // LIABILITAS (2)
    { code: '2', name: 'LIABILITAS', type: 'LIABILITY', category: 'CURRENT_LIABILITY', parentId: null },
    { code: '2-1', name: 'Liabilitas Lancar', type: 'LIABILITY', category: 'CURRENT_LIABILITY', parentId: null },
    { code: '2-1100', name: 'Utang Usaha', type: 'LIABILITY', category: 'CURRENT_LIABILITY', parentId: null },
    { code: '2-1200', name: 'PPN Keluaran', type: 'LIABILITY', category: 'CURRENT_LIABILITY', parentId: null },
    { code: '2-1300', name: 'Utang PPh 23', type: 'LIABILITY', category: 'CURRENT_LIABILITY', parentId: null },
    { code: '2-1400', name: 'Utang PPh 21', type: 'LIABILITY', category: 'CURRENT_LIABILITY', parentId: null },
    { code: '2-1500', name: 'Uang Muka Penjualan', type: 'LIABILITY', category: 'CURRENT_LIABILITY', parentId: null },
    { code: '2-1600', name: 'Utang Bank Jangka Pendek', type: 'LIABILITY', category: 'CURRENT_LIABILITY', parentId: null },

    { code: '2-2', name: 'Liabilitas Jangka Panjang', type: 'LIABILITY', category: 'LONG_TERM_LIABILITY', parentId: null },
    { code: '2-2100', name: 'Utang Bank Jangka Panjang', type: 'LIABILITY', category: 'LONG_TERM_LIABILITY', parentId: null },

    // EKUITAS (3)
    { code: '3', name: 'EKUITAS', type: 'EQUITY', category: 'CAPITAL', parentId: null },
    { code: '3-1000', name: 'Modal Pemilik', type: 'EQUITY', category: 'CAPITAL', parentId: null },
    { code: '3-2000', name: 'Laba Ditahan', type: 'EQUITY', category: 'RETAINED_EARNINGS', parentId: null },
    { code: '3-3000', name: 'Laba Tahun Berjalan', type: 'EQUITY', category: 'RETAINED_EARNINGS', parentId: null },

    // PENDAPATAN (4)
    { code: '4', name: 'PENDAPATAN', type: 'REVENUE', category: 'SALES_REVENUE', parentId: null },
    { code: '4-1000', name: 'Penjualan', type: 'REVENUE', category: 'SALES_REVENUE', parentId: null },
    { code: '4-1100', name: 'Retur Penjualan', type: 'REVENUE', category: 'SALES_REVENUE', parentId: null },
    { code: '4-1200', name: 'Potongan Penjualan', type: 'REVENUE', category: 'SALES_REVENUE', parentId: null },
    { code: '4-2000', name: 'Pendapatan Lain-lain', type: 'REVENUE', category: 'OTHER_REVENUE', parentId: null },

    // HPP (5)
    { code: '5', name: 'HARGA POKOK PENJUALAN', type: 'COGS', category: 'COST_OF_SALES', parentId: null },
    { code: '5-1000', name: 'HPP - Pembelian', type: 'COGS', category: 'COST_OF_SALES', parentId: null },
    { code: '5-1100', name: 'Retur Pembelian', type: 'COGS', category: 'COST_OF_SALES', parentId: null },
    { code: '5-1200', name: 'Potongan Pembelian', type: 'COGS', category: 'COST_OF_SALES', parentId: null },

    // BIAYA (6)
    { code: '6', name: 'BIAYA', type: 'EXPENSE', category: 'OPERATING_EXPENSE', parentId: null },
    { code: '6-1000', name: 'Biaya Gaji', type: 'EXPENSE', category: 'OPERATING_EXPENSE', parentId: null },
    { code: '6-1100', name: 'Biaya Listrik', type: 'EXPENSE', category: 'OPERATING_EXPENSE', parentId: null },
    { code: '6-1200', name: 'Biaya Air', type: 'EXPENSE', category: 'OPERATING_EXPENSE', parentId: null },
    { code: '6-1300', name: 'Biaya Telepon & Internet', type: 'EXPENSE', category: 'OPERATING_EXPENSE', parentId: null },
    { code: '6-1400', name: 'Biaya Sewa', type: 'EXPENSE', category: 'OPERATING_EXPENSE', parentId: null },
    { code: '6-1500', name: 'Biaya Perlengkapan Kantor', type: 'EXPENSE', category: 'OPERATING_EXPENSE', parentId: null },
    { code: '6-1600', name: 'Biaya Transportasi', type: 'EXPENSE', category: 'OPERATING_EXPENSE', parentId: null },
    { code: '6-2000', name: 'Biaya Pemasaran', type: 'EXPENSE', category: 'OPERATING_EXPENSE', parentId: null },
    { code: '6-3000', name: 'Biaya Penyusutan', type: 'EXPENSE', category: 'OPERATING_EXPENSE', parentId: null },
    { code: '6-4000', name: 'Biaya Administrasi Bank', type: 'EXPENSE', category: 'OPERATING_EXPENSE', parentId: null },
    { code: '6-5000', name: 'Biaya Lain-lain', type: 'EXPENSE', category: 'OTHER_EXPENSE', parentId: null },
  ];

  for (const account of accounts) {
    await prisma.chartOfAccount.upsert({
      where: { 
        companyId_code: { 
          companyId: company.id, 
          code: account.code 
        } 
      },
      update: {},
      create: {
        companyId: company.id,
        code: account.code,
        name: account.name,
        accountType: account.type,
        category: account.category,
        isSystem: true, // Mark as system account
        balance: '0',
      },
    });
  }
  console.log(`✅ Created ${accounts.length} Chart of Accounts`);

  // 4. Create Tax Rates
  console.log('💰 Creating tax rates...');
  
  // Get PPN accounts
  const ppnInputAccount = await prisma.chartOfAccount.findFirst({
    where: { companyId: company.id, code: '1-1500' },
  });
  const ppnOutputAccount = await prisma.chartOfAccount.findFirst({
    where: { companyId: company.id, code: '2-1200' },
  });
  const pph23Account = await prisma.chartOfAccount.findFirst({
    where: { companyId: company.id, code: '2-1300' },
  });
  const pph21Account = await prisma.chartOfAccount.findFirst({
    where: { companyId: company.id, code: '2-1400' },
  });

  if (ppnOutputAccount) {
    await prisma.taxRate.upsert({
      where: { id: 'ppn-11-output' },
      update: {},
      create: {
        id: 'ppn-11-output',
        companyId: company.id,
        name: 'PPN 11%',
        taxType: 'PPN',
        rate: '11',
        accountId: ppnOutputAccount.id,
      },
    });
    console.log('✅ Tax Rate: PPN 11% (Output)');
  }

  if (ppnInputAccount) {
    await prisma.taxRate.upsert({
      where: { id: 'ppn-11-input' },
      update: {},
      create: {
        id: 'ppn-11-input',
        companyId: company.id,
        name: 'PPN 11% (Masukan)',
        taxType: 'PPN',
        rate: '11',
        accountId: ppnInputAccount.id,
      },
    });
    console.log('✅ Tax Rate: PPN 11% (Input)');
  }

  if (pph23Account) {
    await prisma.taxRate.upsert({
      where: { id: 'pph-23' },
      update: {},
      create: {
        id: 'pph-23',
        companyId: company.id,
        name: 'PPh 23 (2%)',
        taxType: 'PPH_23',
        rate: '2',
        accountId: pph23Account.id,
      },
    });
    console.log('✅ Tax Rate: PPh 23 (2%)');
  }

  if (pph21Account) {
    await prisma.taxRate.upsert({
      where: { id: 'pph-21' },
      update: {},
      create: {
        id: 'pph-21',
        companyId: company.id,
        name: 'PPh 21',
        taxType: 'PPH_21',
        rate: '5',
        accountId: pph21Account.id,
      },
    });
    console.log('✅ Tax Rate: PPh 21 (5%)');
  }

  // 5. Create sample bank account
  console.log('🏦 Creating bank account...');
  const bankAccount = await prisma.chartOfAccount.findFirst({
    where: { companyId: company.id, code: '1-1200' },
  });

  if (bankAccount) {
    await prisma.bankAccount.upsert({
      where: { id: 'default-bank' },
      update: {},
      create: {
        id: 'default-bank',
        companyId: company.id,
        name: 'BCA - Rekening Utama',
        accountType: 'BANK',
        bankName: 'Bank Central Asia',
        accountNumber: '1234567890',
        accountHolder: 'PT. Contoh Perusahaan',
        accountId: bankAccount.id,
        balance: '0',
        isDefault: true,
      },
    });
    console.log('✅ Bank Account: BCA - Rekening Utama');
  }

  // 6. Create accounting period
  console.log('📅 Creating accounting period...');
  const currentDate = new Date();
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  await prisma.accountingPeriod.upsert({
    where: {
      companyId_year_month: {
        companyId: company.id,
        year: currentDate.getFullYear(),
        month: currentDate.getMonth() + 1,
      },
    },
    update: {},
    create: {
      companyId: company.id,
      year: currentDate.getFullYear(),
      month: currentDate.getMonth() + 1,
      startDate: startOfMonth,
      endDate: endOfMonth,
      status: 'OPEN',
    },
  });
  console.log(`✅ Accounting Period: ${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`);

  console.log('');
  console.log('✨ Seed completed successfully!');
  console.log('');
  console.log('📝 Login credentials:');
  console.log('   Email: admin@contoh.com');
  console.log('   Password: admin123');
  console.log('');
  console.log('🎯 Next steps:');
  console.log('   1. Open Prisma Studio: pnpm db:studio');
  console.log('   2. Visit: http://localhost:3000');
  console.log('   3. Start creating transactions!');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

