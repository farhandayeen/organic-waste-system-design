import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth/config';
import { getMemberRewardClaims, createRewardClaim, getMemberStats } from '../queries';
import { rewardClaimSchema } from '@/lib/validations';
import { createAuditLog } from '@/lib/audit';
import { db } from '@/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'member') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const member = await db.member.findFirst({
      where: { userId: session.user.id },
    });

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    const [claims, stats] = await Promise.all([
      getMemberRewardClaims(member.id),
      getMemberStats(member.id),
    ]);

    return NextResponse.json({
      claims,
      stats,
    });
  } catch (error: any) {
    console.error('Get rewards error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'member') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = rewardClaimSchema.parse(body);

    const member = await db.member.findFirst({
      where: { userId: session.user.id },
    });

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Get system settings for exchange rate
    const settings = await db.systemSettings.findUnique({
      where: { bumdesId: member.bumdesId },
    });

    const exchangeRate = settings?.rewardExchangeRate || 100;

    const claim = await createRewardClaim({
      memberId: member.id,
      bumdesId: member.bumdesId,
      pointsClaimed: validated.pointsClaimed,
      exchangeRate: Number(exchangeRate),
      bankAccountNumber: validated.bankAccountNumber,
      bankAccountName: validated.bankAccountName,
      bankName: validated.bankName,
    });

    await createAuditLog({
      action: 'REWARD_CLAIM_CREATED',
      entityType: 'reward_claim',
      entityId: claim.id,
      newValues: validated,
      status: 'success',
    });

    return NextResponse.json(
      { success: true, claim },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create reward claim error:', error);
    let message = error.message;
    let status = 400;

    if (error.name === 'ZodError') {
      message = error.errors[0].message;
    }

    return NextResponse.json({ error: message }, { status });
  }
}
