import { router, protectedProcedure } from '@/lib/trpc/trpc';
import { productService } from '../services/product.service';
import {
  createProductSchema,
  updateProductSchema,
  getProductsSchema,
  deleteProductSchema,
  getProductSchema,
} from '../types';
import { z } from 'zod';

/**
 * Product tRPC Router
 */
export const productRouter = router({
  /**
   * Create product
   */
  create: protectedProcedure
    .input(createProductSchema)
    .mutation(async ({ ctx, input }) => {
      const companyId = 'default-company-id'; // TODO: Get from session

      return await productService.createProduct(companyId, input);
    }),

  /**
   * Update product
   */
  update: protectedProcedure
    .input(updateProductSchema)
    .mutation(async ({ ctx, input }) => {
      const companyId = 'default-company-id'; // TODO: Get from session

      return await productService.updateProduct(companyId, input);
    }),

  /**
   * Delete product
   */
  delete: protectedProcedure
    .input(deleteProductSchema)
    .mutation(async ({ ctx, input }) => {
      const companyId = 'default-company-id'; // TODO: Get from session

      return await productService.deleteProduct(companyId, input.id);
    }),

  /**
   * Get product by ID
   */
  getById: protectedProcedure
    .input(getProductSchema)
    .query(async ({ ctx, input }) => {
      const companyId = 'default-company-id'; // TODO: Get from session

      return await productService.getProductById(companyId, input.id);
    }),

  /**
   * Get products list
   */
  list: protectedProcedure
    .input(getProductsSchema)
    .query(async ({ ctx, input }) => {
      const companyId = 'default-company-id'; // TODO: Get from session

      return await productService.getProducts(companyId, input);
    }),

  /**
   * Search products
   */
  search: protectedProcedure
    .input(
      z.object({
        query: z.string(),
        type: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const companyId = 'default-company-id'; // TODO: Get from session

      return await productService.searchProducts(companyId, input.query, input.type);
    }),

  /**
   * Get product stock
   */
  getStock: protectedProcedure
    .input(
      z.object({
        productId: z.string().uuid(),
        warehouseId: z.string().default('default'),
      })
    )
    .query(async ({ ctx, input }) => {
      const companyId = 'default-company-id'; // TODO: Get from session

      return await productService.getProductStock(
        companyId,
        input.productId,
        input.warehouseId
      );
    }),
});

