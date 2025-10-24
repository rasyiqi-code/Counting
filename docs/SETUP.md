# Setup Guide - Sistem Akuntansi Double Entry

## Progress Implementasi

### ✅ Yang Sudah Selesai

#### 1. **Infrastruktur Dasar**
- ✅ Next.js 16 setup dengan TypeScript
- ✅ tRPC Infrastructure (context, root router, client, provider, API route)
- ✅ Prisma Schema lengkap (40+ models untuk semua modul)
- ✅ Shared Layer (database, types, utils, constants, validators)
- ✅ Package dependencies lengkap

#### 2. **Module General Ledger** (CORE MODULE - Selesai 100%)
- ✅ Domain Entity (`JournalEntity`) dengan validasi double entry
- ✅ Double Entry Service (create, post, reverse, void journal)
- ✅ Ledger Service (get ledger, trial balance, account balance)
- ✅ tRPC Router dengan 7 procedures
- ✅ Types & Validation Schemas
- **Status**: Module ini siap digunakan dan tested

#### 3. **Module Master Data** (Selesai 75%)
**COA (Chart of Accounts)** - 100%
- ✅ COA Service (CRUD, tree view, search, opening balance)
- ✅ tRPC Router untuk COA
- ✅ Types & Validation Schemas

**Contact (Customers, Vendors, Employees)** - 100%
- ✅ Contact Service (CRUD, code generation, AR/AP aging)
- ✅ tRPC Router untuk Contact
- ✅ Types & Validation Schemas
- ✅ Auto-generate contact code (CUS-0001, VEN-0001, EMP-0001)

**Product (Goods & Services)** - 100%
- ✅ Product Service (CRUD, stock tracking, search)
- ✅ tRPC Router untuk Product
- ✅ Types & Validation Schemas
- ✅ Support untuk FIFO/Average stock method
- ✅ Integration dengan account & tax

**Remaining:**
- ⏳ Bank Account sub-module
- ⏳ Tax Rate sub-module

#### 4. **UI & Layout**
- ✅ Root Layout dengan tRPC Provider
- ✅ Homepage dengan health check dan status modul
- ✅ TailwindCSS 4 configured

### ⏳ Yang Masih Perlu Dikerjakan

#### Module Master Data (Remaining)
- [ ] Bank Account - Services & Router
- [ ] Tax Rate - Services & Router

#### Module Sales
- [ ] Sales Invoice Service dengan auto-generate journal
- [ ] Payment Receipt Service
- [ ] Sales Return Service
- [ ] tRPC Router
- [ ] Types & Schemas

#### Module Purchases
- [ ] Purchase Invoice Service dengan auto-generate journal
- [ ] Make Payment Service
- [ ] Purchase Return Service
- [ ] tRPC Router
- [ ] Types & Schemas

#### Module Cash & Bank
- [ ] Other Income/Expense Service
- [ ] Bank Transfer Service
- [ ] Bank Reconciliation Service
- [ ] tRPC Router

#### Module Fixed Assets
- [ ] Asset Registration Service
- [ ] Depreciation Calculation Service (Straight Line, Declining Balance)
- [ ] Asset Disposal Service
- [ ] tRPC Router

#### Module Inventory
- [ ] Stock Movement Service
- [ ] Stock Valuation Service (FIFO, Average)
- [ ] Stock Adjustment Service
- [ ] tRPC Router

#### Module Period
- [ ] Period Closing Service
- [ ] Adjusting Entries Service
- [ ] Reversing Entries Service
- [ ] tRPC Router

#### Module Reports
- [ ] Income Statement Service
- [ ] Balance Sheet Service
- [ ] Cash Flow Service
- [ ] Tax Reports Service
- [ ] tRPC Router

#### Module Settings
- [ ] Company Settings Service
- [ ] User Management Service
- [ ] Audit Trail Service
- [ ] tRPC Router

#### Module Auth
- [ ] NextAuth v5 Setup
- [ ] Login/Logout
- [ ] RBAC (Role-Based Access Control)
- [ ] Permission Middleware

#### Frontend Pages
- [ ] Dashboard dengan KPI & Charts
- [ ] Master Data Pages (COA, Contact, Product, Bank, Tax)
- [ ] Sales Pages (Invoice, Payment, Return)
- [ ] Purchases Pages (Bill, Payment, Return)
- [ ] Cash & Bank Pages
- [ ] Fixed Assets Pages
- [ ] Inventory Pages
- [ ] General Ledger Pages (Journal Entry, Ledger, Trial Balance)
- [ ] Reports Pages (Financial, Tax, Analysis)
- [ ] Settings Pages

#### UI Components Library
- [ ] Shared Form Components (AccountSelect, ContactSelect, ProductSelect)
- [ ] Data Table Component
- [ ] Journal Entry Form Component
- [ ] Tax Calculator Component
- [ ] Date Range Picker
- [ ] Charts Components

## Langkah Setup

### 1. Install Dependencies

```bash
cd counting-app
pnpm install
```

### 2. Setup Database

1. Buat database PostgreSQL di [Neon](https://neon.tech/)
2. Copy connection string
3. Buat file `.env` di root folder `counting-app`:

```env
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-secret-here"
NODE_ENV="development"
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 3. Push Database Schema

```bash
pnpm db:push
```

Ini akan:
- Generate Prisma Client
- Push schema ke database
- Create semua 40+ tables

### 4. (Optional) Seed Database

Buat file `prisma/seed.ts` untuk seed initial data:
- Default COA (Chart of Accounts Indonesia)
- Default Tax Rates (PPN 11%, PPh, dll)
- Sample company
- Admin user

### 5. Run Development Server

```bash
pnpm dev
```

Buka http://localhost:3000

## Struktur Project

```
counting-app/
├── prisma/
│   └── schema.prisma          # Complete database schema (40+ models)
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── api/trpc/[trpc]/   # tRPC API endpoint
│   │   ├── layout.tsx         # Root layout with providers
│   │   ├── page.tsx           # Homepage
│   │   └── providers.tsx      # tRPC Provider
│   ├── lib/
│   │   └── trpc/              # tRPC configuration
│   │       ├── context.ts     # tRPC context (prisma, session)
│   │       ├── trpc.ts        # tRPC instance & procedures
│   │       ├── root.ts        # Root router (merge all modules)
│   │       ├── client.ts      # tRPC React client
│   │       └── server.ts      # tRPC server client
│   ├── shared/                # Shared resources
│   │   ├── database/          # Prisma client
│   │   ├── types/             # Global types & enums
│   │   ├── utils/             # Utilities (currency, date, validators, cn)
│   │   └── constants/         # Constants (permissions, tax rates, etc)
│   └── modules/               # Business modules (Modular Monolith)
│       ├── general-ledger/    # ✅ COMPLETED
│       │   ├── domain/        # Domain entities
│       │   ├── services/      # Business logic
│       │   ├── routers/       # tRPC routers
│       │   ├── types/         # Module types
│       │   └── index.ts       # Public API
│       └── master-data/       # ⏳ Partial (COA done)
│           ├── coa/           # ✅ Chart of Accounts
│           └── index.ts       # Module router
└── package.json
```

## Cara Menggunakan Module yang Sudah Ada

### General Ledger - Create Journal

```typescript
// Di client component
'use client';
import { trpc } from '@/lib/trpc/client';

function CreateJournalForm() {
  const createJournal = trpc.journal.create.useMutation();

  const handleSubmit = async () => {
    await createJournal.mutateAsync({
      date: new Date(),
      description: 'Initial Capital',
      entries: [
        {
          accountId: 'cash-account-id',
          debit: 10000000,
          credit: 0,
          description: 'Cash deposit',
        },
        {
          accountId: 'capital-account-id',
          debit: 0,
          credit: 10000000,
          description: 'Owner capital',
        },
      ],
    });
  };

  return (
    <button onClick={handleSubmit}>
      Create Journal
    </button>
  );
}
```

### General Ledger - Get Trial Balance

```typescript
const trialBalance = trpc.journal.getTrialBalance.useQuery({
  startDate: new Date('2025-01-01'),
  endDate: new Date('2025-01-31'),
});

if (trialBalance.data) {
  console.log('Total Debit:', trialBalance.data.totalDebit);
  console.log('Total Credit:', trialBalance.data.totalCredit);
  console.log('Is Balanced:', trialBalance.data.isBalanced);
  console.log('Accounts:', trialBalance.data.accounts);
}
```

### Master Data - COA

```typescript
// Get COA tree
const coaTree = trpc.masterData.coa.getTree.useQuery({
  showInactive: false,
});

// Create new account
const createAccount = trpc.masterData.coa.create.useMutation();
await createAccount.mutateAsync({
  code: '1-1100',
  name: 'Kas',
  accountType: 'ASSET',
  category: 'CURRENT_ASSET',
});

// Search accounts
const accounts = trpc.masterData.coa.search.useQuery({
  query: 'kas',
});
```

## Next Steps

1. **Jalankan `pnpm install`** untuk install dependencies
2. **Setup database** dan run `pnpm db:push`
3. **Test API** dengan mengakses http://localhost:3000/api/trpc/health.check
4. **Lanjutkan implementasi modul** yang belum selesai sesuai priority:
   - Sales & Purchases (penting untuk bisnis)
   - Inventory (jika ada barang dagangan)
   - Reports (untuk laporan keuangan)
   - Auth & RBAC (untuk keamanan)

## Tips Development

1. **Modular Monolith Pattern**: Setiap module independen dengan struktur yang sama
2. **Double Entry Validation**: Semua transaksi wajib melalui `doubleEntryService`
3. **Type Safety**: Gunakan Zod schemas untuk validasi input
4. **tRPC Benefits**: Type-safe API calls tanpa perlu manual type definitions

## Troubleshooting

### Prisma Error: "Can't reach database"
- Check DATABASE_URL di `.env`
- Pastikan database sudah dibuat di Neon
- Test koneksi: `pnpm db:push`

### tRPC Error: "Procedure not found"
- Pastikan module router sudah di-import di `root.ts`
- Check namespace: `trpc.moduleName.procedureName`

### Build Error: "Module not found"
- Run `pnpm install` lagi
- Check import paths menggunakan `@/` alias

## License

MIT

