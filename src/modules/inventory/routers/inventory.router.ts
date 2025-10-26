import { router, protectedProcedure } from '@/lib/trpc/trpc';
import { stockMovementService } from '../services/stockMovement.service';
import { stockValuationService } from '../services/stockValuation.service';
import {
  createStockAdjustmentSchema,
  createStockTransferSchema,
  getStockCardSchema,
  stockValuationSchema,
  getStockMovementsSchema,
} from '../types';
import { z } from 'zod';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Inventory tRPC Router
 */
export const inventoryRouter = router({
  /**
   * Create stock adjustment
   */
  createAdjustment: protectedProcedure
    .input(createStockAdjustmentSchema)
    .mutation(async ({ ctx, input }) => {
      const companyId = 'default-company-id'; // TODO: Get from session
      const userId = 'temp-user-id'; // TODO: Get from session

      return await stockMovementService.createAdjustment(companyId, input, userId);
    }),

  /**
   * List stock adjustments
   */
  listAdjustments: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const companyId = 'default-company-id'; // TODO: Get from session

      const where: any = {
        companyId,
        movementType: 'ADJUSTMENT',
      };

      if (input.search) {
        where.OR = [
          { adjustmentNo: { contains: input.search, mode: 'insensitive' } },
          { reason: { contains: input.search, mode: 'insensitive' } },
          { product: { name: { contains: input.search, mode: 'insensitive' } } },
        ];
      }

      const [adjustments, total] = await Promise.all([
        ctx.prisma.stockMovement.findMany({
          where,
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                unit: true,
              },
            },
          },
          orderBy: {
            date: 'desc',
          },
          skip: (input.page - 1) * input.limit,
          take: input.limit,
        }),
        ctx.prisma.stockMovement.count({ where }),
      ]);

      // Calculate quantity before for each adjustment
      const adjustmentsWithQuantityBefore = await Promise.all(
        adjustments.map(async (adjustment: any) => {
          // Get all movements for this product before this adjustment date
          const previousMovements = await ctx.prisma.stockMovement.findMany({
            where: {
              companyId,
              productId: adjustment.productId,
              warehouseId: adjustment.warehouseId,
              date: {
                lt: adjustment.date,
              },
            },
            orderBy: {
              date: 'asc',
            },
          });

          // Calculate running balance
          const quantityBefore = previousMovements.reduce((sum: number, movement: any) => {
            return sum + Number(movement.quantity.toString());
          }, 0);

          return {
            ...adjustment,
            quantityBefore,
            quantityAfter: quantityBefore + Number(adjustment.quantity.toString()),
          };
        })
      );

      return {
        data: adjustmentsWithQuantityBefore,
        pagination: {
          page: input.page,
          limit: input.limit,
          total,
          pages: Math.ceil(total / input.limit),
        },
      };
    }),

  /**
   * Get adjustment by ID
   */
  getAdjustmentById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const companyId = 'default-company-id'; // TODO: Get from session

      const adjustment = await ctx.prisma.stockMovement.findFirst({
        where: {
          id: input.id,
          companyId,
          movementType: 'ADJUSTMENT',
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              unit: true,
            },
          },
        },
      });

      if (!adjustment) {
        throw new Error('Adjustment not found');
      }

      // Calculate quantity before for this adjustment
      const previousMovements = await ctx.prisma.stockMovement.findMany({
        where: {
          companyId,
          productId: adjustment.productId,
          warehouseId: adjustment.warehouseId,
          date: {
            lt: adjustment.date,
          },
        },
        orderBy: {
          date: 'asc',
        },
      });

      // Calculate running balance
      const quantityBefore = previousMovements.reduce((sum: number, movement: any) => {
        return sum + Number(movement.quantity.toString());
      }, 0);

      return {
        ...adjustment,
        quantityBefore,
        quantityAfter: quantityBefore + Number(adjustment.quantity.toString()),
      };
    }),

  /**
   * Update adjustment
   */
  updateAdjustment: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        date: z.coerce.date(),
        referenceNo: z.string(),
        productId: z.string(),
        quantity: z.number(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const companyId = 'default-company-id'; // TODO: Get from session
      const userId = 'temp-user-id'; // TODO: Get from session

      // Check if adjustment exists
      const existingAdjustment = await ctx.prisma.stockMovement.findFirst({
        where: {
          id: input.id,
          companyId,
          movementType: 'ADJUSTMENT',
        },
      });

      if (!existingAdjustment) {
        throw new Error('Adjustment not found');
      }

      // Update the adjustment
      const updatedAdjustment = await ctx.prisma.stockMovement.update({
        where: { id: input.id },
        data: {
          date: input.date,
          referenceNo: input.referenceNo,
          productId: input.productId,
          quantity: new Decimal(input.quantity),
          notes: input.notes,
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              unit: true,
            },
          },
        },
      });

      return updatedAdjustment;
    }),

  /**
   * Create stock transfer
   */
  createTransfer: protectedProcedure
    .input(createStockTransferSchema)
    .mutation(async ({ ctx, input }) => {
      const companyId = 'default-company-id'; // TODO: Get from session
      const userId = 'temp-user-id'; // TODO: Get from session

      return await stockMovementService.createTransfer(companyId, input, userId);
    }),

  /**
   * Get stock card (movement history)
   */
  getStockCard: protectedProcedure
    .input(getStockCardSchema)
    .query(async ({ ctx, input }) => {
      const companyId = 'default-company-id'; // TODO: Get from session

      return await stockMovementService.getStockCard(companyId, input);
    }),

  /**
   * Get stock movements list
   */
  getMovements: protectedProcedure
    .input(getStockMovementsSchema)
    .query(async ({ ctx, input }) => {
      const companyId = 'default-company-id'; // TODO: Get from session

      const where: any = {
        companyId,
      };

      if (input.productId) {
        where.productId = input.productId;
      }

      if (input.warehouseId) {
        where.warehouseId = input.warehouseId;
      }

      if (input.movementType) {
        where.movementType = input.movementType;
      }

      if (input.startDate || input.endDate) {
        where.date = {};
        if (input.startDate) {
          where.date.gte = input.startDate;
        }
        if (input.endDate) {
          where.date.lte = input.endDate;
        }
      }

      const [movements, total] = await Promise.all([
        ctx.prisma.stockMovement.findMany({
          where,
          include: {
            product: {
              select: {
                sku: true,
                name: true,
                unit: true,
              },
            },
          },
          orderBy: {
            date: 'desc',
          },
          skip: (input.page - 1) * input.limit,
          take: input.limit,
        }),
        ctx.prisma.stockMovement.count({ where }),
      ]);

      return {
        data: movements,
        pagination: {
          page: input.page,
          limit: input.limit,
          total,
          pages: Math.ceil(total / input.limit),
        },
      };
    }),

  /**
   * Get stock valuation report
   */
  getValuation: protectedProcedure
    .input(stockValuationSchema)
    .query(async ({ ctx, input }) => {
      const companyId = 'default-company-id'; // TODO: Get from session

      return await stockValuationService.getStockValuation(companyId, input);
    }),

  /**
   * Get low stock products
   */
  getLowStock: protectedProcedure
    .query(async ({ ctx }) => {
      const companyId = 'default-company-id'; // TODO: Get from session

      return await stockValuationService.getLowStockProducts(companyId);
    }),

  /**
   * Get inventory turnover
   */
  getTurnover: protectedProcedure
    .input(
      z.object({
        startDate: z.coerce.date(),
        endDate: z.coerce.date(),
      })
    )
    .query(async ({ ctx, input }) => {
      const companyId = 'default-company-id'; // TODO: Get from session

      return await stockValuationService.getInventoryTurnover(
        companyId,
        input.startDate,
        input.endDate
      );
    }),
});

