import { db } from '@/db';
import { Prisma } from '@prisma/client';

const toDecimal = (value: number | string) => new Prisma.Decimal(value);

/**
 * Create waste deposit
 */
export async function createWasteDeposit(input: {
  memberId: string;
  bumdesId: string;
  depositDate: Date;
  weightKg: number;
  categoryId?: string;
  photoUrl?: string;
  notes?: string;
  pointsPerKg: number;
  inputMethod?: 'member' | 'admin_manual' | 'admin_import';
  inputBy?: string;
}) {
  const pointsAwarded = input.weightKg * input.pointsPerKg;

  return db.wasteDeposit.create({
    data: {
      memberId: input.memberId,
      bumdesId: input.bumdesId,
      depositDate: input.depositDate,
      weightKg: toDecimal(input.weightKg),
      categoryId: input.categoryId,
      photoUrl: input.photoUrl,
      notes: input.notes,
      pointsAwarded: toDecimal(pointsAwarded),
      status: 'pending',
      inputMethod: input.inputMethod || 'member',
      inputBy: input.inputBy,
    },
  });
}

/**
 * Get member deposits
 */
export async function getMemberDeposits(
  memberId: string,
  options?: { limit?: number; offset?: number }
) {
  return db.wasteDeposit.findMany({
    where: { memberId },
    orderBy: { depositDate: 'desc' },
    take: options?.limit || 50,
    skip: options?.offset || 0,
  });
}

/**
 * Get deposit by ID
 */
export async function getDepositById(depositId: string) {
  return db.wasteDeposit.findUnique({
    where: { id: depositId },
  });
}

/**
 * Verify deposit (admin only)
 */
export async function verifyDeposit(
  depositId: string,
  adminId: string,
  status: 'verified' | 'rejected',
  rejectionReason?: string
) {
  return db.$transaction(async (tx) => {
    const deposit = await tx.wasteDeposit.findUnique({
      where: { id: depositId },
    });

    if (!deposit) throw new Error('Deposit not found');
    if (deposit.status !== 'pending') {
      throw new Error('Deposit already processed');
    }

    const updatedDeposit = await tx.wasteDeposit.update({
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

    return updatedDeposit;
  });
}

/**
 * Get member stats
 */
export async function getMemberStats(memberId: string) {
  const member = await db.member.findUnique({
    where: { id: memberId },
  });

  if (!member) return null;

  const [verifiedDeposits, pendingDeposits] = await Promise.all([
    db.wasteDeposit.count({
      where: { memberId, status: 'verified' },
    }),
    db.wasteDeposit.count({
      where: { memberId, status: 'pending' },
    }),
  ]);

  return {
    totalPoints: Number(member.totalPoints),
    totalDeposits: Number(member.totalDeposits),
    totalWithdrawals: Number(member.totalWithdrawals),
    verifiedDeposits,
    pendingDeposits,
    lastDepositDate: member.lastDepositDate,
    membershipDate: member.joiningDate,
  };
}

/**
 * Create reward claim
 */
export async function createRewardClaim(input: {
  memberId: string;
  bumdesId: string;
  pointsClaimed: number;
  exchangeRate: number;
  bankAccountNumber: string;
  bankAccountName: string;
  bankName: string;
}) {
  const amountInRupiah = input.pointsClaimed / input.exchangeRate;

  return db.$transaction(async (tx) => {
    const member = await tx.member.findUnique({
      where: { id: input.memberId },
    });

    if (!member || member.totalPoints.lt(toDecimal(input.pointsClaimed))) {
      throw new Error('Insufficient points');
    }

    const claim = await tx.rewardClaim.create({
      data: {
        memberId: input.memberId,
        bumdesId: input.bumdesId,
        pointsClaimed: toDecimal(input.pointsClaimed),
        amountInRupiah: toDecimal(amountInRupiah),
        exchangeRate: toDecimal(input.exchangeRate),
        bankAccountNumber: input.bankAccountNumber,
        bankAccountName: input.bankAccountName,
        bankName: input.bankName,
        status: 'pending',
      },
    });

    await tx.member.update({
      where: { id: input.memberId },
      data: {
        totalPoints: { decrement: toDecimal(input.pointsClaimed) },
      },
    });

    await tx.pointsTransaction.create({
      data: {
        memberId: input.memberId,
        bumdesId: input.bumdesId,
        type: 'withdrawal',
        amount: toDecimal(-input.pointsClaimed),
        description: 'Reward claim requested',
        referenceId: claim.id,
        referenceType: 'reward_claim',
      },
    });

    return claim;
  });
}

/**
 * Get member reward claims
 */
export async function getMemberRewardClaims(memberId: string) {
  return db.rewardClaim.findMany({
    where: { memberId },
    orderBy: { requestedAt: 'desc' },
  });
}

/**
 * Get waste categories
 */
export async function getWasteCategories(bumdesId: string) {
  return db.wasteCategory.findMany({
    where: {
      bumdesId,
      isActive: true,
    },
  });
}

/**
 * Get member detail with all info
 */
export async function getMemberDetail(memberId: string) {
  const member = await db.member.findUnique({
    where: { id: memberId },
  });

  if (!member) return null;

  const [deposits, claims, stats] = await Promise.all([
    getMemberDeposits(memberId, { limit: 10 }),
    getMemberRewardClaims(memberId),
    getMemberStats(memberId),
  ]);

  return {
    ...member,
    deposits,
    claims,
    stats,
  };
}
