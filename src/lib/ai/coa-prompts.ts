import { z } from 'zod';

/**
 * AI Prompts khusus untuk Chart of Accounts (COA) Module
 */

// Schema untuk AI account suggestion
export const accountSuggestionSchema = z.object({
  code: z.string().describe('Account code dalam format 1-1-1 (3 digit)'),
  name: z.string().describe('Nama akun yang sesuai standar Indonesia'),
  accountType: z.enum(['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE', 'COGS']).describe('Tipe akun sesuai PSAK'),
  category: z.string().describe('Kategori akun (contoh: Aset Lancar, Aset Tetap, dll)'),
  parentCode: z.string().optional().describe('Kode akun parent yang sesuai'),
  description: z.string().describe('Deskripsi akun untuk keperluan audit'),
  isActive: z.boolean().describe('Status akun (aktif/tidak aktif)'),
});

// Schema untuk compliance validation
export const complianceValidationSchema = z.object({
  isValid: z.boolean().describe('Apakah struktur akun sudah sesuai standar'),
  issues: z.array(z.string()).describe('Daftar masalah yang ditemukan'),
  recommendations: z.array(z.string()).describe('Rekomendasi perbaikan'),
  complianceScore: z.number().min(0).max(100).describe('Skor compliance 0-100'),
});

// Schema untuk account search
export const accountSearchSchema = z.object({
  accounts: z.array(z.object({
    code: z.string(),
    name: z.string(),
    accountType: z.string(),
    relevanceScore: z.number().min(0).max(1),
    reason: z.string().describe('Alasan mengapa akun ini relevan'),
  })),
  totalFound: z.number(),
  searchStrategy: z.string().describe('Strategi pencarian yang digunakan'),
});

/**
 * AI Prompts untuk COA
 */
export const coaPrompts = {
  /**
   * Suggest account details berdasarkan description
   */
  suggestAccount: (description: string, businessType?: string) => 
    `Sebagai ahli akuntansi Indonesia, berikan saran untuk membuat akun baru berdasarkan deskripsi: "${description}"${businessType ? ` untuk bisnis ${businessType}` : ''}.

    Pertimbangkan:
    1. Standar PSAK (Pernyataan Standar Akuntansi Keuangan) Indonesia
    2. Struktur Chart of Accounts yang umum digunakan di Indonesia
    3. Kode akun dalam format 1-1-1 (3 digit)
    4. Klasifikasi akun yang tepat (Aset, Kewajiban, Ekuitas, Pendapatan, Beban)
    5. Parent account yang sesuai dalam hierarki

    Berikan saran yang praktis dan sesuai dengan praktik akuntansi Indonesia.`,

  /**
   * Validate account structure compliance
   */
  validateCompliance: (accountStructure: any) =>
    `Sebagai auditor akuntansi, validasi struktur Chart of Accounts berikut sesuai standar PSAK Indonesia:

    ${JSON.stringify(accountStructure, null, 2)}

    Periksa:
    1. Klasifikasi akun sesuai PSAK
    2. Hierarki akun yang logis
    3. Kode akun yang konsisten
    4. Nama akun yang sesuai standar
    5. Struktur yang memudahkan pelaporan keuangan

    Berikan skor compliance dan rekomendasi perbaikan.`,

  /**
   * Natural language search untuk accounts
   */
  searchAccounts: (query: string, existingAccounts: any[]) =>
    `Cari akun yang relevan dengan query: "${query}"

    Dari daftar akun yang ada:
    ${JSON.stringify(existingAccounts.slice(0, 10), null, 2)}

    Gunakan strategi pencarian:
    1. Exact match pada nama akun
    2. Partial match pada nama akun
    3. Match berdasarkan tipe akun
    4. Match berdasarkan kategori
    5. Semantic search untuk konsep terkait

    Berikan hasil yang relevan dengan skor relevansi.`,

  /**
   * Suggest account code berdasarkan business context
   */
  suggestAccountCode: (accountName: string, accountType: string, parentCode?: string) =>
    `Berikan saran kode akun untuk:
    - Nama: "${accountName}"
    - Tipe: "${accountType}"
    ${parentCode ? `- Parent: "${parentCode}"` : ''}

    Format kode: 1-1-1 (3 digit)
    Pastikan kode unik dan mengikuti hierarki yang logis.`,

  /**
   * Analyze account structure untuk insights
   */
  analyzeAccountStructure: (accounts: any[]) =>
    `Analisis struktur Chart of Accounts berikut:

    ${JSON.stringify(accounts, null, 2)}

    Berikan insights:
    1. Kekuatan struktur akun
    2. Area yang perlu diperbaiki
    3. Rekomendasi untuk optimasi
    4. Best practices yang bisa diterapkan
    5. Compliance dengan standar Indonesia`,

  /**
   * Generate account description
   */
  generateAccountDescription: (accountName: string, accountType: string) =>
    `Buat deskripsi akun yang profesional untuk:
    - Nama: "${accountName}"
    - Tipe: "${accountType}"

    Deskripsi harus:
    1. Jelas dan mudah dipahami
    2. Sesuai dengan standar akuntansi
    3. Membantu dalam audit dan pelaporan
    4. Menggunakan bahasa Indonesia yang formal`,

  /**
   * Suggest parent account
   */
  suggestParentAccount: (accountName: string, accountType: string) =>
    `Saran akun parent yang sesuai untuk:
    - Nama: "${accountName}"
    - Tipe: "${accountType}"

    Pertimbangkan hierarki yang logis dan sesuai dengan praktik akuntansi Indonesia.`,
};

/**
 * System prompts untuk COA
 */
export const coaSystemPrompts = {
  expert: `Anda adalah ahli akuntansi Indonesia dengan pengalaman 15+ tahun. Anda menguasai:
  - PSAK (Pernyataan Standar Akuntansi Keuangan)
  - Standar Chart of Accounts Indonesia
  - Best practices akuntansi perusahaan
  - Compliance dan audit requirements
  - Struktur laporan keuangan Indonesia`,

  assistant: `Anda adalah asisten akuntansi yang membantu dalam:
  - Membuat Chart of Accounts yang sesuai standar
  - Validasi compliance dengan PSAK
  - Pencarian akun yang efisien
  - Analisis struktur akun
  - Rekomendasi perbaikan akun`,

  validator: `Anda adalah auditor internal yang memvalidasi:
  - Struktur Chart of Accounts
  - Compliance dengan standar Indonesia
  - Konsistensi kode akun
  - Hierarki akun yang logis
  - Best practices akuntansi`,
};

// Export coaPrompts with system prompts
export const coaPromptsWithSystem = {
  ...coaPrompts,
  coaSystemPrompts,
};
