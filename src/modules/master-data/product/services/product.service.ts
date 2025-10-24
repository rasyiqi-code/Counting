import { prisma } from '@/shared/database/prisma';
import { CreateProductInput, UpdateProductInput, GetProductsInput } from '../types';
import { Decimal } from 'decimal.js';

/**
 * Product Service
 * Mengelola Products & Services
 */
export class ProductService {
  /**
   * Create new product
   */
  async createProduct(companyId: string, input: CreateProductInput) {
    // Check if SKU already exists
    const existing = await prisma.product.findFirst({
      where: {
        companyId,
        sku: input.sku,
      },
    });

    if (existing) {
      throw new Error(`Product with SKU ${input.sku} already exists`);
    }

    // Validate accounts if provided
    if (input.incomeAccountId) {
      await this.validateAccount(companyId, input.incomeAccountId);
    }
    if (input.expenseAccountId) {
      await this.validateAccount(companyId, input.expenseAccountId);
    }
    if (input.assetAccountId) {
      await this.validateAccount(companyId, input.assetAccountId);
    }

    const product = await prisma.product.create({
      data: {
        companyId,
        ...input,
        salePrice: new Decimal(input.salePrice).toString(),
        purchasePrice: new Decimal(input.purchasePrice).toString(),
        minStock: input.minStock ? new Decimal(input.minStock).toString() : undefined,
        maxStock: input.maxStock ? new Decimal(input.maxStock).toString() : undefined,
      },
      include: {
        incomeAccount: {
          select: {
            code: true,
            name: true,
          },
        },
        expenseAccount: {
          select: {
            code: true,
            name: true,
          },
        },
        assetAccount: {
          select: {
            code: true,
            name: true,
          },
        },
        taxRate: {
          select: {
            name: true,
            rate: true,
          },
        },
      },
    });

    return product;
  }

  /**
   * Update product
   */
  async updateProduct(companyId: string, input: UpdateProductInput) {
    const { id, ...data } = input;

    // Check if product exists
    const product = await prisma.product.findFirst({
      where: {
        id,
        companyId,
      },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // Check SKU uniqueness if updating SKU
    if (data.sku && data.sku !== product.sku) {
      const existing = await prisma.product.findFirst({
        where: {
          companyId,
          sku: data.sku,
          id: { not: id },
        },
      });

      if (existing) {
        throw new Error(`Product with SKU ${data.sku} already exists`);
      }
    }

    // Prepare update data
    const updateData: any = { ...data };
    
    if (data.salePrice !== undefined) {
      updateData.salePrice = new Decimal(data.salePrice).toString();
    }
    if (data.purchasePrice !== undefined) {
      updateData.purchasePrice = new Decimal(data.purchasePrice).toString();
    }
    if (data.minStock !== undefined) {
      updateData.minStock = new Decimal(data.minStock).toString();
    }
    if (data.maxStock !== undefined) {
      updateData.maxStock = new Decimal(data.maxStock).toString();
    }

    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        incomeAccount: {
          select: {
            code: true,
            name: true,
          },
        },
        expenseAccount: {
          select: {
            code: true,
            name: true,
          },
        },
        assetAccount: {
          select: {
            code: true,
            name: true,
          },
        },
        taxRate: {
          select: {
            name: true,
            rate: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Delete product (soft delete)
   */
  async deleteProduct(companyId: string, productId: string) {
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        companyId,
      },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // Check if product has transactions
    const hasInvoiceItems = await prisma.invoiceItem.findFirst({
      where: {
        productId,
      },
      take: 1,
    });

    if (hasInvoiceItems) {
      throw new Error('Cannot delete product with existing transactions');
    }

    // Soft delete
    await prisma.product.update({
      where: { id: productId },
      data: { isActive: false },
    });

    return { success: true };
  }

  /**
   * Get product by ID
   */
  async getProductById(companyId: string, productId: string) {
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        companyId,
      },
      include: {
        incomeAccount: {
          select: {
            code: true,
            name: true,
          },
        },
        expenseAccount: {
          select: {
            code: true,
            name: true,
          },
        },
        assetAccount: {
          select: {
            code: true,
            name: true,
          },
        },
        taxRate: {
          select: {
            name: true,
            rate: true,
          },
        },
        inventoryItems: {
          select: {
            warehouseId: true,
            quantity: true,
            averageCost: true,
          },
        },
      },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    return product;
  }

  /**
   * Get products with pagination and filters
   */
  async getProducts(companyId: string, input: GetProductsInput) {
    const { type, category, search, page = 1, limit = 20 } = input;

    const where: any = {
      companyId,
      isActive: true,
    };

    if (type) {
      where.type = type;
    }

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { sku: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          incomeAccount: {
            select: {
              code: true,
              name: true,
            },
          },
          taxRate: {
            select: {
              name: true,
              rate: true,
            },
          },
        },
        orderBy: {
          sku: 'asc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Search products (for dropdowns)
   */
  async searchProducts(companyId: string, query: string, type?: string) {
    const where: any = {
      companyId,
      isActive: true,
      OR: [
        { sku: { contains: query, mode: 'insensitive' } },
        { name: { contains: query, mode: 'insensitive' } },
      ],
    };

    if (type) {
      where.type = type;
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: {
        name: 'asc',
      },
      take: 20,
    });

    return products;
  }

  /**
   * Get product stock
   */
  async getProductStock(companyId: string, productId: string, warehouseId: string = 'default') {
    const stock = await prisma.inventoryItem.findFirst({
      where: {
        companyId,
        productId,
        warehouseId,
      },
    });

    return stock || { quantity: 0, value: 0, averageCost: 0 };
  }

  /**
   * Validate account exists
   */
  private async validateAccount(companyId: string, accountId: string) {
    const account = await prisma.chartOfAccount.findFirst({
      where: {
        id: accountId,
        companyId,
        isActive: true,
      },
    });

    if (!account) {
      throw new Error('Account not found');
    }

    return account;
  }
}

export const productService = new ProductService();

