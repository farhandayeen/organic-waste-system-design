import { db } from '@/db';
import { Prisma } from '@prisma/client';

const toDecimal = (value: number | string) => new Prisma.Decimal(value);

/**
 * Get all deposits pending verification
 */
export async function getPendingDeposits(bumdesId: string) {
  return db.wasteDeposit.findMany({
    where: {
      bumdesId,
      status: 'pending',
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get all members for a BUMDES
 */
export async function getBUMDESMembers(
  bumdesId: string,
  options?: {
    limit?: number;
    offset?: number;
    status?: string;
  }
) {
  return db.member.findMany({
    where: {
      bumdesId,
      ...(options?.status ? { status: options.status } : {}),
    },
    orderBy: { joiningDate: 'desc' },
    take: options?.limit || 50,
    skip: options?.offset || 0,
  });
}

/**
 * Get all reward claims for BUMDES
 */
export async function getBUMDESRewardClaims(bumdesId: string) {
  return db.rewardClaim.findMany({
    where: { bumdesId },
    orderBy: { requestedAt: 'desc' },
  });
}

/**
 * Get admin dashboard stats
 */
export async function getAdminDashboardStats(bumdesId: string) {
  const [depositsCount, totalWeight, activeMembers, pendingCount, pendingClaims, totalPoints] = await Promise.all([
    db.wasteDeposit.count({ where: { bumdesId } }),
    db.wasteDeposit.aggregate({
      where: { bumdesId, status: 'verified' },
      _sum: { weightKg: true },
    }),
    db.member.count({ where: { bumdesId, status: 'active' } }),
    db.wasteDeposit.count({ where: { bumdesId, status: 'pending' } }),
    db.rewardClaim.count({ where: { bumdesId, status: 'pending' } }),
    db.member.aggregate({
      where: { bumdesId },
      _sum: { totalPoints: true },
    }),
  ]);

  return {
    totalDeposits: depositsCount,
    totalWeight: Number(totalWeight._sum.weightKg || 0),
    activeMembers,
    pendingDeposits: pendingCount,
    pendingClaims,
    totalPointsCirculation: Number(totalPoints._sum.totalPoints || 0),
  };
}

/**
 * Verify multiple deposits
 */
export async function verifyMultipleDeposits(
  depositIds: string[],
  adminId: string,
  status: 'verified' | 'rejected',
  rejectionReason?: string
) {
  const results = await db.$transaction(async (tx) => {
    const processed = [] as Array<unknown>;

    for (const depositId of depositIds) {
      const deposit = await tx.wasteDeposit.findUnique({
        where: { id: depositId },
      });

      if (!deposit || deposit.status !== 'pending') continue;

      const updated = await tx.wasteDeposit.update({
        where: { id: depositId },
        data: {
          status,
          verifiedBy: adminId,
          verifiedAt: new Date(),
          rejectionReason: status === 'rejected' ? rejectionReason : null,
        },
      });

      if (status === 'verified') {
        await tx.pointsTransaction.create({
          data: {
            memberId: deposit.memberId,
            bumdesId: deposit.bumdesId,
            type: 'deposit',
            amount: deposit.pointsAwarded,
            description: `Setor sampah ${deposit.weightKg} kg`,
            referenceId: depositId,
            referenceType: 'deposit',
            createdBy: adminId,
          },
        });

        await tx.member.update({
          where: { id: deposit.memberId },
          data: {
            totalPoints: { increment: deposit.pointsAwarded },
            totalDeposits: { increment: deposit.weightKg },
            lastDepositDate: deposit.depositDate,
          },
        });
      }

      processed.push(updated);
    }

    return processed;
  });

  return results;
}

/**
 * Get member detail by ID
 */
export async function getMemberDetailById(memberId: string) {
  const memberResult = await db.member.findUnique({
    where: { id: memberId },
    include: {
      user: true,
      deposits: {
        orderBy: { depositDate: 'desc' },
      },
    },
  });

  if (!memberResult) return null;

  return {
    ...memberResult,
    user: memberResult.user,
    deposits: memberResult.deposits,
  };
}

/**
 * Approve reward claim
 */
export async function approveRewardClaim(
  claimId: string,
  adminId: string,
  approvalNotes?: string
) {
  const claim = await db.rewardClaim.findUnique({
    where: { id: claimId },
  });

  if (!claim) throw new Error('Claim not found');

  return db.rewardClaim.update({
    where: { id: claimId },
    data: {
      status: 'approved',
      approvedBy: adminId,
      approvedAt: new Date(),
      approvalNotes,
    },
  });
}

/**
 * Reject reward claim
 */
export async function rejectRewardClaim(
  claimId: string,
  rejectionReason: string
) {
  return db.rewardClaim.update({
    where: { id: claimId },
    data: {
      status: 'rejected',
      rejectionReason,
    },
  });
}

/**
 * Mark claim as paid
 */
export async function markClaimAsPaid(claimId: string, paymentProof?: string) {
  const result = await db.$transaction(async (tx) => {
    const claim = await tx.rewardClaim.findUnique({
      where: { id: claimId },
    });

    if (!claim) throw new Error('Claim not found');

    const updated = await tx.rewardClaim.update({
      where: { id: claimId },
      data: {
        status: 'paid',
        paidAt: new Date(),
        paymentProof,
      },
    });

    await tx.member.update({
      where: { id: claim.memberId },
      data: {
        totalWithdrawals: { increment: claim.amountInRupiah },
      },
    });

    return updated;
  });

  return result;
}
