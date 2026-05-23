import { db } from '@/db';
import { Prisma } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth/config';

export interface AuditLogInput {
  action: string;
  entityType: string;
  entityId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  status?: 'success' | 'failure' | 'warning';
  errorMessage?: string;
}

/**
 * Log audit trail
 */
export async function createAuditLog(input: AuditLogInput) {
  try {
    const session = await getServerSession(authOptions);

    await db.auditLog.create({
      data: {
        userId: session?.user?.id ? (session.user.id as string) : undefined,
        bumdesId: session?.user?.bumdesId ? (session.user.bumdesId as string) : undefined,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        oldValues: input.oldValues as Prisma.InputJsonValue | undefined,
        newValues: input.newValues as Prisma.InputJsonValue | undefined,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        status: input.status || 'success',
        errorMessage: input.errorMessage,
      },
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
}

/**
 * Get audit logs with filters
 */
export async function getAuditLogs(filters?: {
  userId?: string;
  action?: string;
  entityType?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  const limit = filters?.limit || 100;
  const offset = filters?.offset || 0;

  const where: Prisma.AuditLogWhereInput = {};

  if (filters?.userId) {
    where.userId = filters.userId;
  }

  if (filters?.action) {
    where.action = filters.action;
  }

  if (filters?.entityType) {
    where.entityType = filters.entityType;
  }

  if (filters?.startDate || filters?.endDate) {
    where.createdAt = {
      ...(filters.startDate ? { gte: filters.startDate } : {}),
      ...(filters.endDate ? { lte: filters.endDate } : {}),
    };
  }

  return db.auditLog.findMany({
    where,
    take: limit,
    skip: offset,
    orderBy: { createdAt: 'asc' },
  });
}

/**
 * Get changes summary (before/after diff)
 */
export function getChangesSummary(oldValues?: Record<string, any>, newValues?: Record<string, any>): string {
  if (!oldValues || !newValues) return '';

  const changes = [];
  const allKeys = new Set([...Object.keys(oldValues), ...Object.keys(newValues)]);

  for (const key of allKeys) {
    if (oldValues[key] !== newValues[key]) {
      changes.push(`${key}: ${oldValues[key]} → ${newValues[key]}`);
    }
  }

  return changes.join('; ');
}

/**
 * Format audit log for display
 */
export function formatAuditLog(log: any): string {
  const timestamp = new Date(log.createdAt).toLocaleString();
  const user = log.userId ? `User: ${log.userId}` : 'System';
  const changes = getChangesSummary(log.oldValues, log.newValues);

  return `[${timestamp}] ${user} - ${log.action} on ${log.entityType} (${log.entityId}) - ${changes || 'No changes'}`;
}

/**
 * Check if user can access resource (RBAC)
 */
export async function canUserAccess(userId: string, action: string, resource: string): Promise<boolean> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) return false;

  const userRole = session.user.role as string;

  const rolePermissions: Record<string, Record<string, string[]>> = {
    member: {
      deposits: ['view_own', 'create'],
      rewards: ['view_own', 'claim'],
      profile: ['view_own', 'update_own'],
    },
    admin_bumdes: {
      deposits: ['view_all', 'verify', 'create_manual', 'bulk_import'],
      rewards: ['view_all', 'approve', 'reject'],
      members: ['view_all', 'create', 'bulk_import', 'suspend'],
      reports: ['view', 'export'],
      settings: ['view', 'update'],
    },
    super_admin: {
      '*': ['*'],
    },
  };

  const permissions = rolePermissions[userRole]?.[resource] || [];
  return permissions.includes(action) || permissions.includes('*');
}

/**
 * Get user context from session
 */
export async function getUserContext() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  return {
    userId: session.user.id as string,
    email: session.user.email as string,
    role: session.user.role as string,
    bumdesId: session.user.bumdesId as string | undefined,
  };
}
