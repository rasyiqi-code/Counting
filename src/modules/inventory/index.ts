/**
 * Inventory Module - Public API
 * 
 * This module handles:
 * - Stock Movements (IN, OUT, ADJUSTMENT, TRANSFER)
 * - Stock Valuation (FIFO, Average)
 * - Stock Card (movement history)
 * - Low Stock Alerts
 * - Inventory Turnover
 */

export { inventoryRouter } from './routers/inventory.router';
export { stockMovementService } from './services/stockMovement.service';
export { stockValuationService } from './services/stockValuation.service';

export type {
  CreateStockAdjustmentInput,
  CreateStockTransferInput,
  GetStockCardInput,
  StockValuationInput,
  StockMovementDetail,
} from './types';

