import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth/config';
import { db } from '@/db';
import { verifyDeposit } from '@/app/api/member/queries';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin_bumdes' || !session.user.bumdesId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const status = body.status as 'verified' | 'rejected';

    if (!['verified', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const deposit = await db.wasteDeposit.findFirst({
      where: { id, bumdesId: session.user.bumdesId },
    });

    if (!deposit) {
      return NextResponse.json({ error: 'Deposit not found' }, { status: 404 });
    }

    const updated = await verifyDeposit(
      id,
      session.user.id,
      status,
      body.rejectionReason
    );

    return NextResponse.json({ success: true, deposit: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update deposit';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
