import { router, protectedProcedure } from '@/lib/trpc/trpc';
import { fixedAssetService } from '../services/fixedAsset.service';
import {
  createFixedAssetSchema,
  updateFixedAssetSchema,
  calculateDepreciationSchema,
  disposalAssetSchema,
  getFixedAssetSchema,
  deleteFixedAssetSchema,
} from '../types';
import { z } from 'zod';

/**
 * Fixed Assets tRPC Router
 */
export const fixedAssetsRouter = router({
  /**
   * Create fixed asset
   */
  create: protectedProcedure
    .input(createFixedAssetSchema)
    .mutation(async ({ ctx, input }) => {
      const companyId = 'default-company-id'; // TODO: Get from session

      return await fixedAssetService.createAsset(companyId, input);
    }),

  /**
   * Update fixed asset
   */
  update: protectedProcedure
    .input(updateFixedAssetSchema)
    .mutation(async ({ ctx, input }) => {
      const companyId = 'default-company-id'; // TODO: Get from session

      return await fixedAssetService.updateAsset(companyId, input);
    }),

  /**
   * Delete fixed asset
   */
  delete: protectedProcedure
    .input(deleteFixedAssetSchema)
    .mutation(async ({ ctx, input }) => {
      const companyId = 'default-company-id'; // TODO: Get from session

      return await fixedAssetService.deleteAsset(companyId, input.id);
    }),

  /**
   * Get asset by ID
   */
  getById: protectedProcedure
    .input(getFixedAssetSchema)
    .query(async ({ ctx, input }) => {
      const companyId = 'default-company-id'; // TODO: Get from session

      return await fixedAssetService.getAssetById(companyId, input.id);
    }),

  /**
   * Get assets list
   */
  list: protectedProcedure
    .input(
      z.object({
        category: z.string().optional(),
        status: z.string().optional(),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const companyId = 'default-company-id'; // TODO: Get from session

      const where: any = {
        companyId,
      };

      if (input.category) {
        where.category = input.category;
      }

      if (input.status) {
        where.status = input.status;
      }

      const [assets, total] = await Promise.all([
        ctx.prisma.fixedAsset.findMany({
          where,
          orderBy: {
            assetNo: 'desc',
          },
          skip: (input.page - 1) * input.limit,
          take: input.limit,
        }),
        ctx.prisma.fixedAsset.count({ where }),
      ]);

      return {
        data: assets,
        pagination: {
          page: input.page,
          limit: input.limit,
          total,
          pages: Math.ceil(total / input.limit),
        },
      };
    }),

  /**
   * Calculate monthly depreciation
   */
  calculateDepreciation: protectedProcedure
    .input(calculateDepreciationSchema)
    .mutation(async ({ ctx, input }) => {
      const companyId = 'default-company-id'; // TODO: Get from session
      const userId = 'temp-user-id'; // TODO: Get from session

      return await fixedAssetService.calculateDepreciation(companyId, input, userId);
    }),

  /**
   * Dispose asset
   */
  dispose: protectedProcedure
    .input(disposalAssetSchema)
    .mutation(async ({ ctx, input }) => {
      const companyId = 'default-company-id'; // TODO: Get from session
      const userId = 'temp-user-id'; // TODO: Get from session

      return await fixedAssetService.disposeAsset(companyId, input, userId);
    }),
});

