# Quick Start Guide

## 🚀 5 Menit Setup

### 1. Install Dependencies
```bash
cd counting-app
pnpm install
```

### 2. Create `.env` File
```bash
# Di terminal (atau buat manual):
echo DATABASE_URL="postgresql://user:pass@host/db" > .env
echo NEXTAUTH_URL="http://localhost:3000" >> .env
echo NEXTAUTH_SECRET="your-secret" >> .env
```

### 3. Setup Database
```bash
pnpm db:push    # Push schema ke database
pnpm db:seed    # Populate default data
```

### 4. Run Server
```bash
pnpm dev
```

Buka **http://localhost:3000**

---

## ✅ Default Data Tersedia

Setelah seed:
- ✅ Company: PT. Contoh Perusahaan
- ✅ Admin: admin@contoh.com / admin123
- ✅ 50 Chart of Accounts
- ✅ Tax Rates (PPN 11%, PPh)
- ✅ Bank Account (BCA)
- ✅ Current Period (OPEN)

---

## 🎯 Test Basic Flow

### 1. Create Customer
```typescript
const customer = await trpc.masterData.contact.create.mutateAsync({
  type: 'CUSTOMER',
  name: 'PT. Customer Test',
  creditLimit: 50000000,
  paymentTerms: 30,
});
```

### 2. Create Product
```typescript
const product = await trpc.masterData.product.create.mutateAsync({
  type: 'GOODS',
  sku: 'PRD-001',
  name: 'Test Product',
  salePrice: 1000000,
  purchasePrice: 800000,
  trackInventory: true,
});
```

### 3. Create Sales Invoice
```typescript
const invoice = await trpc.sales.invoice.create.mutateAsync({
  contactId: customer.id,
  date: new Date(),
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  items: [
    { productId: product.id, quantity: 10, unitPrice: 1000000 }
  ]
});
```

### 4. Generate Journal (Auto-Post)
```typescript
await trpc.sales.invoice.generateJournal.mutateAsync({
  invoiceId: invoice.id
});
// Creates balanced journal & posts automatically
```

### 5. Check Trial Balance
```typescript
const tb = await trpc.journal.getTrialBalance.useQuery({
  startDate: new Date('2025-01-01'),
  endDate: new Date('2025-12-31')
});

console.log('Balanced?', tb.isBalanced); // Should be true
```

---

## 📖 Dokumentasi Lengkap

- **`README.md`** - Overview sistem
- **`SETUP.md`** - Detailed setup guide
- **`IMPLEMENTATION_COMPLETE.md`** - Complete features & examples
- **`API_REFERENCE.md`** - API documentation
- **`PROGRESS.md`** - Development progress

---

## 🆘 Troubleshooting

### Prisma Error
```bash
pnpm db:generate
```

### TypeScript Error
```bash
pnpm build
```

### Reset Database
```bash
pnpm db:push --force-reset
pnpm db:seed
```

---

**Sistem ready dalam 5 menit!** 🎉

