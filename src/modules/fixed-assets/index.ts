/**
 * Fixed Assets Module - Public API
 * 
 * This module handles:
 * - Fixed Asset Registration
 * - Depreciation Calculation (Straight Line, Declining Balance)
 * - Asset Disposal with Gain/Loss
 */

export { fixedAssetsRouter } from './routers/fixedAssets.router';
export { fixedAssetService } from './services/fixedAsset.service';

export type {
  CreateFixedAssetInput,
  UpdateFixedAssetInput,
  CalculateDepreciationInput,
  DisposalAssetInput,
} from './types';

