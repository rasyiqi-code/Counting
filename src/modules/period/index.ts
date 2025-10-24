/**
 * Period Module - Public API
 * 
 * This module handles:
 * - Monthly Period Closing
 * - Year-End Closing (zero out revenue/expense, transfer to retained earnings)
 * - Period Reopening
 */

export { periodRouter } from './routers/period.router';
export { periodClosingService } from './services/periodClosing.service';

export type {
  ClosePeriodInput,
  CloseYearInput,
  ReopenPeriodInput,
} from './types';

