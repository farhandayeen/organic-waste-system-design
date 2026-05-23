import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth/config';
import {
  getMemberDeposits,
  createWasteDeposit,
  getWasteCategories,
} from '../queries';
import { memberWasteDepositCreateSchema } from '@/lib/validations';
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

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const deposits = await getMemberDeposits(member.id, { limit, offset });

    // Get categories
    const categories = await getWasteCategories(member.bumdesId);

    return NextResponse.json({
      deposits,
      categories,
      count: deposits.length,
    });
  } catch (error: any) {
    console.error('Get deposits error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const validated = memberWasteDepositCreateSchema.parse(body);

    // Get system settings for points calculation
    const settings = await db.systemSettings.findUnique({
      where: { bumdesId: member.bumdesId },
    });

    const pointsPerKg = settings?.depositPointRate || 10;

    const deposit = await createWasteDeposit({
      memberId: member.id,
      bumdesId: member.bumdesId,
      depositDate: new Date(validated.depositDate),
      weightKg: validated.weightKg,
      categoryId: validated.categoryId,
      photoUrl: validated.photoUrl,
      notes: validated.notes,
      pointsPerKg: Number(pointsPerKg),
      inputMethod: 'member',
      inputBy: session.user.id,
    });

    await createAuditLog({
      action: 'DEPOSIT_CREATED',
      entityType: 'waste_deposit',
      entityId: deposit.id,
      newValues: validated,
      status: 'success',
    });

    return NextResponse.json(
      { success: true, deposit },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create deposit error:', error);
    let message = error.message;
    let status = 400;

    if (error.name === 'ZodError') {
      message = error.errors[0].message;
    }

    return NextResponse.json({ error: message }, { status });
  }
}
