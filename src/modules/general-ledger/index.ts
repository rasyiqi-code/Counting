/**
 * General Ledger Module - Public API
 * 
 * This module is the core of the double entry accounting system.
 * All transactions must generate journals through this module.
 */

export { journalRouter } from './routers/journal.router';
export { doubleEntryService } from './services/doubleEntry.service';
export { ledgerService } from './services/ledger.service';
export { JournalEntity } from './domain/journal.entity';

export type {
  CreateJournalInput,
  PostJournalInput,
  ReverseJournalInput,
  GetLedgerInput,
  GetTrialBalanceInput,
  JournalEntryDTO,
  LedgerEntry,
  TrialBalanceSummary,
} from './types';

