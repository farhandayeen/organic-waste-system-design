import { auth } from '@/auth/config';
import { db } from '@/db';
import { createAuditLog } from '@/lib/audit';
import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin_bumdes') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { memberId, amount, reason } = body;

    if (!memberId || amount === undefined || amount === null) {
      return NextResponse.json(
        { error: 'memberId and amount are required' },
        { status: 400 }
      );
    }

    const member = await db.member.findFirst({
      where: {
        id: memberId,
        bumdesId: session.user.bumdesId as string,
      },
    });

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    const transaction = await db.pointsTransaction.create({
      data: {
        memberId,
        bumdesId: (session.user.bumdesId as string),
        type: 'adjustment',
        amount: new Prisma.Decimal(amount),
        description: reason || 'Points adjustment by admin',
        createdBy: session.user.id as string,
      },
    });

    // Update member total points
    await db.member.update({
      where: { id: memberId },
      data: {
        totalPoints: { increment: new Prisma.Decimal(amount) },
      },
    });

    await createAuditLog({
      action: 'POINTS_ADJUSTED',
      entityType: 'points_transaction',
      entityId: transaction.id,
      newValues: { amount, reason },
      status: 'success',
    });

    return NextResponse.json({ success: true, transaction });
  } catch (error: any) {
    console.error('Points adjustment error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to adjust points' },
      { status: 400 }
    );
  }
}
