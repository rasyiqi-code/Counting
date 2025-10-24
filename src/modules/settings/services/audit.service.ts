import { prisma } from '@/shared/database/prisma';
import { GetAuditLogsInput } from '../types';

/**
 * Audit Service
 * 
 * Mengelola audit trail
 */
export class AuditService {
  /**
   * Log activity
   */
  async logActivity(
    userId: string,
    action: string,
    entityType: string,
    entityId: string,
    changes?: any,
    ipAddress?: string,
    userAgent?: string
  ) {
    const auditLog = await prisma.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        changes,
        ipAddress,
        userAgent,
      },
    });

    return auditLog;
  }

  /**
   * Get audit logs
   */
  async getAuditLogs(input: GetAuditLogsInput) {
    const { page = 1, limit = 50, ...filters } = input;

    const where: any = {};

    if (filters.entityType) {
      where.entityType = filters.entityType;
    }

    if (filters.entityId) {
      where.entityId = filters.entityId;
    }

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.action) {
      where.action = filters.action;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.createdAt.lte = new Date(filters.endDate);
      }
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}

export const auditService = new AuditService();

