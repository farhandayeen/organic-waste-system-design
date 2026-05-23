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
    const { fullName, phone, address } = body;

    if (!session.user.bumdesId) {
      return NextResponse.json({ error: 'Organization not assigned' }, { status: 400 });
    }

    const member = await db.member.create({
      data: {
        bumdesId: session.user.bumdesId,
        fullName,
        phone: phone || undefined,
        address: address || '',
        status: 'active',
        totalPoints: new Prisma.Decimal(0),
        totalDeposits: new Prisma.Decimal(0),
        totalWithdrawals: new Prisma.Decimal(0),
        memberNumber: `MBR-${Date.now()}`,
      },
    });

    await createAuditLog({
      action: 'MEMBER_CREATED_MANUAL',
      entityType: 'member',
      entityId: member.id,
      newValues: { fullName, phone, address },
      status: 'success',
    });

    return NextResponse.json({ success: true, member });
  } catch (error: any) {
    console.error('Create member error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create member' },
      { status: 400 }
    );
  }
}
