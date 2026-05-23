import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth/config';
import { db } from '@/db';
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin_bumdes' || !session.user.bumdesId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;

    const deposits = await db.wasteDeposit.findMany({
      where: {
        bumdesId: session.user.bumdesId,
        ...(status ? { status } : {}),
      },
      orderBy: { depositDate: 'desc' },
      take: 100,
      include: {
        member: { select: { id: true, fullName: true, memberNumber: true } },
      },
    });

    return NextResponse.json({ deposits });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch deposits';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
