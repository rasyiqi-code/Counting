import { router, publicProcedure } from './trpc';
import { journalRouter } from '@/modules/general-ledger';
import { masterDataRouter } from '@/modules/master-data';
import { salesRouter } from '@/modules/sales';
import { purchasesRouter } from '@/modules/purchases';
import { inventoryRouter } from '@/modules/inventory';
import { reportsRouter } from '@/modules/reports';
import { cashBankRouter } from '@/modules/cash-bank';
import { fixedAssetsRouter } from '@/modules/fixed-assets';
import { periodRouter } from '@/modules/period';
import { settingsRouter } from '@/modules/settings';

/**
 * Root tRPC Router
 * 
 * Ini adalah pusat dari semua routers. Setiap module akan meng-export router-nya
 * dan di-merge di sini.
 * 
 * Pattern:
 * - Module routers akan di-import dan di-merge di sini
 * - Client akan memanggil procedures dengan format: trpc.moduleName.procedureName.useQuery()
 */

// TODO: Import remaining module routers
// import { cashBankRouter } from '@/modules/cash-bank';
// import { fixedAssetsRouter } from '@/modules/fixed-assets';
// import { inventoryRouter } from '@/modules/inventory';
// import { periodRouter } from '@/modules/period';
// import { reportsRouter } from '@/modules/reports';
// import { settingsRouter } from '@/modules/settings';
// import { authRouter } from '@/modules/auth';

export const appRouter = router({
  // Health check
  health: router({
    check: publicProcedure.query(() => {
      return { status: 'ok', timestamp: new Date().toISOString() };
    }),
  }),
  
  // Module routers
  journal: journalRouter,
  masterData: masterDataRouter,
  sales: salesRouter,
  purchases: purchasesRouter,
  inventory: inventoryRouter,
  reports: reportsRouter,
  cashBank: cashBankRouter,
  fixedAssets: fixedAssetsRouter,
  period: periodRouter,
  settings: settingsRouter,
  
  // TODO: Optional modules
  // auth: authRouter, // Will be added when NextAuth is implemented
});

export type AppRouter = typeof appRouter;

