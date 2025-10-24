# API Reference - Sistem Akuntansi Double Entry

Complete tRPC API documentation untuk semua 10 modules.

---

## 🔐 Authentication

**Status:** Temporary - All procedures accessible without auth
**TODO:** Implement NextAuth v5 for production

Current temporary values:
- `companyId`: `'default-company-id'`
- `userId`: `'temp-user-id'`

---

## 📚 Module APIs

### **1. General Ledger** (`journal.*`)

#### `journal.create`
Create double entry journal (wajib balanced).

**Input:**
```typescript
{
  date: Date,
  description: string,
  referenceNo?: string,
  entries: [
    {
      accountId: string,
      debit: number,
      credit: number,
      description?: string,
      departmentId?: string
    }
  ]
}
```

**Validation:** Total debit HARUS = total credit

**Output:** Journal object dengan status DRAFT

---

#### `journal.post`
Post journal (finalize) dan update account balances.

**Input:** `{ journalId: string }`

**Effect:**
- Journal status → POSTED
- Account balances updated
- Cannot be edited

---

#### `journal.reverse`
Create reversing entry.

**Input:**
```typescript
{
  journalId: string,
  date: Date,
  description?: string
}
```

**Effect:** Creates new journal dengan debit/credit dibalik

---

#### `journal.getTrialBalance`
Get trial balance report.

**Input:**
```typescript
{
  startDate?: Date,
  endDate?: Date
}
```

**Output:**
```typescript
{
  accounts: [
    {
      accountCode: string,
      accountName: string,
      debit: Decimal,
      credit: Decimal
    }
  ],
  totalDebit: Decimal,
  totalCredit: Decimal,
  isBalanced: boolean
}
```

---

#### `journal.getLedger`
Get account ledger (movement history).

**Input:**
```typescript
{
  accountId: string,
  startDate?: Date,
  endDate?: Date
}
```

**Output:**
```typescript
{
  account: Account,
  entries: [
    {
      date: Date,
      journalNo: string,
      description: string,
      debit: Decimal,
      credit: Decimal,
      balance: Decimal // running balance
    }
  ],
  openingBalance: Decimal,
  closingBalance: Decimal
}
```

---

### **2. Master Data - COA** (`masterData.coa.*`)

#### `masterData.coa.create`
```typescript
{
  code: string, // e.g., "1-1100"
  name: string,
  accountType: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'COGS' | 'EXPENSE',
  category: string,
  parentId?: string
}
```

#### `masterData.coa.getTree`
Get hierarchical tree structure.

**Input:** `{ showInactive: boolean }`

**Output:** Array of AccountNode dengan children

#### `masterData.coa.search`
Quick search untuk dropdowns.

**Input:** `{ query: string }`

---

### **3. Master Data - Contact** (`masterData.contact.*`)

#### `masterData.contact.create`
```typescript
{
  type: 'CUSTOMER' | 'VENDOR' | 'EMPLOYEE',
  name: string,
  email?: string,
  phone?: string,
  address?: string,
  city?: string,
  npwp?: string,
  creditLimit?: number, // for customers
  paymentTerms?: number, // days
  bankAccountName?: string, // for vendors
  bankAccountNumber?: string,
  bankName?: string
}
```

**Auto-generates:**
- Customer: `CUS-0001`
- Vendor: `VEN-0001`
- Employee: `EMP-0001`

#### `masterData.contact.getCustomerARaging`
Get AR Aging untuk customer.

**Output:**
```typescript
{
  current: number,
  days1_30: number,
  days31_60: number,
  days61_90: number,
  over90: number,
  total: number
}
```

---

### **4. Sales** (`sales.*`)

#### `sales.invoice.create`
Create sales invoice.

**Input:**
```typescript
{
  contactId: string,
  date: Date,
  dueDate: Date,
  items: [
    {
      productId: string,
      quantity: number,
      unitPrice: number,
      taxRateId?: string,
      discountPercent?: number
    }
  ]
}
```

**Auto-calculates:**
- Subtotal per item
- Tax amount (PPN 11%)
- Discount
- Grand total

**Auto-generates:** Invoice number `INV-YYYYMMDD-XXXX`

---

#### `sales.invoice.generateJournal`
Generate journal dari invoice.

**Auto-creates journal:**
```
Dr. Piutang Usaha     (total)
Cr. Penjualan                   (subtotal - discount)
Cr. PPN Keluaran               (tax amount)
```

**Effect:**
- Invoice status → SENT
- Journal auto-posted
- Account balances updated

---

#### `sales.payment.receive`
Receive payment dari customer.

**Input:**
```typescript
{
  contactId: string,
  bankAccountId: string,
  date: Date,
  amount: number,
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'CHECK' | ...,
  allocations: [
    { invoiceId: string, amount: number }
  ]
}
```

**Auto-creates journal:**
```
Dr. Kas/Bank         (amount)
Cr. Piutang Usaha              (amount)
```

**Effect:**
- Invoice `paidAmount` updated
- Invoice status updated (PARTIAL_PAID → PAID)
- Journal auto-posted

---

#### `sales.reports.arAging`
AR Aging report.

**Output:**
```typescript
{
  summary: {
    current: number,
    days1_30: number,
    days31_60: number,
    days61_90: number,
    over90: number,
    total: number
  },
  invoices: [...]
}
```

---

### **5. Purchases** (`purchases.*`)

Sama seperti Sales tapi untuk Accounts Payable:

- `purchases.bill.create` → Auto-number: `BILL-YYYYMMDD-XXXX`
- `purchases.bill.generateJournal` → Dr. HPP, Dr. PPN Masukan, Cr. Utang Usaha
- `purchases.payment.make` → Dr. Utang Usaha, Cr. Kas/Bank
- `purchases.reports.apAging` → AP Aging

---

### **6. Inventory** (`inventory.*`)

#### `inventory.createAdjustment`
Stock adjustment (increase/decrease).

**Input:**
```typescript
{
  productId: string,
  warehouseId?: string,
  quantity: number, // positive = increase, negative = decrease
  reason: string,
  notes?: string
}
```

**Auto-creates journal** (jika decrease):
```
Dr. Biaya Kerusakan Stok
Cr. Persediaan
```

---

#### `inventory.getStockCard`
Get stock movement history.

**Output:**
```typescript
{
  product: Product,
  movements: [
    {
      date: Date,
      movementType: string,
      quantity: Decimal,
      unitCost: Decimal,
      balance: Decimal // running balance
    }
  ],
  currentStock: Decimal,
  currentValue: Decimal,
  averageCost: Decimal
}
```

---

#### `inventory.getValuation`
Stock valuation report.

**Output:**
```typescript
{
  items: [
    {
      productSku: string,
      productName: string,
      quantity: Decimal,
      averageCost: Decimal,
      totalValue: Decimal,
      stockMethod: 'FIFO' | 'AVERAGE'
    }
  ],
  totalValue: Decimal
}
```

---

### **7. Reports** (`reports.*`)

#### `reports.financial.incomeStatement`
Laporan Laba Rugi.

**Input:**
```typescript
{
  startDate: Date,
  endDate: Date,
  compareWithPrevious?: boolean
}
```

**Output:**
```typescript
{
  revenue: [...],
  totalRevenue: Decimal,
  cogs: [...],
  totalCOGS: Decimal,
  grossProfit: Decimal,
  grossProfitMargin: number,
  expenses: [...],
  totalExpenses: Decimal,
  netIncome: Decimal,
  netProfitMargin: number
}
```

---

#### `reports.financial.balanceSheet`
Neraca.

**Output:**
```typescript
{
  assets: {
    current: [...],
    fixed: [...],
    total: Decimal
  },
  liabilities: {
    current: [...],
    longTerm: [...],
    total: Decimal
  },
  equity: {
    lines: [...],
    total: Decimal
  },
  totalLiabilitiesAndEquity: Decimal
}
```

---

#### `reports.financial.cashFlow`
Laporan Arus Kas (Indirect Method).

**Output:**
```typescript
{
  operating: { lines: [...], total: Decimal },
  investing: { lines: [...], total: Decimal },
  financing: { lines: [...], total: Decimal },
  netCashFlow: Decimal,
  beginningCash: Decimal,
  endingCash: Decimal
}
```

---

#### `reports.tax.ppn`
Laporan PPN.

**Output:**
```typescript
{
  ppnInput: { entries: [...], total: Decimal },
  ppnOutput: { entries: [...], total: Decimal },
  netPPN: Decimal,
  status: 'KURANG_BAYAR' | 'LEBIH_BAYAR' | 'NIHIL'
}
```

---

### **8. Cash & Bank** (`cashBank.*`)

#### `cashBank.recordIncome`
Record non-sales income.

**Input:**
```typescript
{
  bankAccountId: string,
  date: Date,
  amount: number,
  incomeAccountId: string,
  description: string
}
```

**Auto-journal:** Dr. Bank, Cr. Pendapatan Lain

---

#### `cashBank.recordExpense`
Record non-purchase expense.

**Auto-journal:** Dr. Biaya, Cr. Bank

---

#### `cashBank.recordTransfer`
Bank-to-bank transfer.

**Auto-journal:** Dr. Bank B, Cr. Bank A

---

### **9. Fixed Assets** (`fixedAssets.*`)

#### `fixedAssets.create`
Register fixed asset.

**Auto-generates:** Asset number `FA-YYYY-XXXX`

---

#### `fixedAssets.calculateDepreciation`
Calculate monthly depreciation.

**Input:**
```typescript
{
  assetId: string,
  period: Date // month/year
}
```

**Methods:**
- Straight Line: `(Purchase - Residual) / Useful Life`
- Declining Balance: `Book Value × (200% / Useful Life)`

**Auto-journal:**
```
Dr. Biaya Penyusutan
Cr. Akumulasi Penyusutan
```

---

#### `fixedAssets.dispose`
Dispose asset (sell or discard).

**Auto-calculates:** Gain or Loss

**Auto-journal:**
```
Dr. Kas (if sold)
Dr. Akumulasi Penyusutan
Cr. Aset
Dr/Cr. Laba/Rugi Pelepasan
```

---

### **10. Period** (`period.*`)

#### `period.closeMonth`
Close monthly period.

**Validation:**
- No DRAFT journals in period
- All transactions posted

**Effect:** Period status → CLOSED

---

#### `period.closeYear`
Year-end closing.

**Auto-creates closing journal:**
- Zero out all Revenue accounts → Cr. Retained Earnings
- Zero out all COGS accounts → Dr. Retained Earnings
- Zero out all Expense accounts → Dr. Retained Earnings

**Effect:**
- All periods in year → LOCKED
- Net income transferred to Retained Earnings

---

### **11. Settings** (`settings.*`)

#### `settings.company.get`
Get company information.

#### `settings.company.update`
Update company info.

#### `settings.audit.getLogs`
Get audit trail dengan filter.

---

## 🎯 **Common Patterns**

### **List Pattern**
All list procedures support:
```typescript
{
  page: number,
  limit: number,
  search?: string,
  startDate?: Date,
  endDate?: Date
}
```

Returns:
```typescript
{
  data: [...],
  pagination: {
    page: number,
    limit: number,
    total: number,
    pages: number
  }
}
```

### **CRUD Pattern**
All CRUD modules have:
- `create`
- `update`
- `delete` (soft delete)
- `getById`
- `list`
- `search`

### **Auto-Journal Pattern**
Modules yang auto-generate journal:
1. Create transaction (status: DRAFT)
2. Call `generateJournal()` → Creates & posts journal
3. Transaction status updated
4. Account balances updated

---

## 📊 **Usage Examples**

See `IMPLEMENTATION_COMPLETE.md` for complete workflow examples.

---

**Total Procedures:** 60+
**All Type-Safe:** Via tRPC
**Auto-Completion:** Yes (TypeScript)

