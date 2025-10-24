import { router, protectedProcedure, adminProcedure } from '@/lib/trpc/trpc';
import { companyService } from '../services/company.service';
import { auditService } from '../services/audit.service';
import { updateCompanySchema, getAuditLogsSchema } from '../types';
import { z } from 'zod';

/**
 * Settings tRPC Router
 */
export const settingsRouter = router({
  /**
   * COMPANY PROCEDURES
   */
  company: router({
    /**
     * Get company info
     */
    get: protectedProcedure.query(async ({ ctx }) => {
      const companyId = 'default-company-id'; // TODO: Get from session

      return await companyService.getCompany(companyId);
    }),

    /**
     * Update company info
     */
    update: adminProcedure
      .input(updateCompanySchema)
      .mutation(async ({ ctx, input }) => {
        const companyId = 'default-company-id'; // TODO: Get from session

        return await companyService.updateCompany(companyId, input);
      }),
  }),

  /**
   * AUDIT TRAIL PROCEDURES
   */
  audit: router({
    /**
     * Get audit logs
     */
    getLogs: adminProcedure
      .input(getAuditLogsSchema)
      .query(async ({ ctx, input }) => {
        return await auditService.getAuditLogs(input);
      }),
  }),

  /**
   * USER MANAGEMENT PROCEDURES
   */
  listUsers: protectedProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(20),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const companyId = 'default-company-id'; // TODO: Get from session
      const skip = (input.page - 1) * input.limit;

      const where: any = {
        companyId,
      };

      if (input.search) {
        where.OR = [
          { name: { contains: input.search, mode: 'insensitive' } },
          { email: { contains: input.search, mode: 'insensitive' } },
        ];
      }

      const [users, total] = await Promise.all([
        ctx.prisma.user.findMany({
          where,
          skip,
          take: input.limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
          },
        }),
        ctx.prisma.user.count({ where }),
      ]);

      return {
        data: users,
        pagination: {
          page: input.page,
          limit: input.limit,
          total,
          totalPages: Math.ceil(total / input.limit),
        },
      };
    }),

  createUser: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(6),
        role: z.enum(['USER', 'ADMIN', 'SUPER_ADMIN']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const companyId = 'default-company-id'; // TODO: Get from session
      const userId = 'temp-user-id'; // TODO: Get from session

      // Check if user already exists
      const existingUser = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      });

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash(input.password, 10);

      // Create user
      const user = await ctx.prisma.user.create({
        data: {
          name: input.name,
          email: input.email,
          password: hashedPassword,
          role: input.role,
          companyId,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      });

      return user;
    }),

  /**
   * COMPANY PROCEDURES (Direct access)
   */
  getCompany: protectedProcedure.query(async ({ ctx }) => {
    const companyId = 'default-company-id'; // TODO: Get from session

    return await companyService.getCompany(companyId);
  }),

  updateCompany: adminProcedure
    .input(updateCompanySchema)
    .mutation(async ({ ctx, input }) => {
      const companyId = 'default-company-id'; // TODO: Get from session

      return await companyService.updateCompany(companyId, input);
    }),

  /**
   * AUDIT TRAIL PROCEDURES (Direct access)
   */
  getAuditTrail: adminProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(20),
        search: z.string().optional(),
        action: z.string().optional().nullable(),
      })
    )
    .query(async ({ ctx, input }) => {
      const companyId = 'default-company-id'; // TODO: Get from session
      const skip = (input.page - 1) * input.limit;

      const where: any = {
        user: {
          companyId,
        },
      };

      if (input.search) {
        where.OR = [
          { user: { name: { contains: input.search, mode: 'insensitive' } } },
          { entityType: { contains: input.search, mode: 'insensitive' } },
          { entityId: { contains: input.search, mode: 'insensitive' } },
        ];
      }

      if (input.action) {
        where.action = input.action;
      }

      const [logs, total] = await Promise.all([
        ctx.prisma.auditLog.findMany({
          where,
          skip,
          take: input.limit,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        }),
        ctx.prisma.auditLog.count({ where }),
      ]);

      return {
        data: logs,
        pagination: {
          page: input.page,
          limit: input.limit,
          total,
          totalPages: Math.ceil(total / input.limit),
        },
      };
    }),

  exportAuditTrail: adminProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const companyId = 'default-company-id'; // TODO: Get from session

      const logs = await ctx.prisma.auditLog.findMany({
        where: {
          user: {
            companyId,
          },
          createdAt: {
            gte: input.startDate,
            lte: input.endDate,
          },
        },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      });

      // In a real implementation, you would generate and return a file
      // For now, just return the data
      return {
        data: logs,
        filename: `audit-trail-${input.startDate.toISOString().split('T')[0]}-to-${input.endDate.toISOString().split('T')[0]}.csv`,
      };
    }),
});

