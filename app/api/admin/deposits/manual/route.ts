import { auth } from '@/auth/config';
import { db } from '@/db';
import { createWasteDeposit, verifyDeposit } from '@/app/api/member/queries';
import { wasteDepositCreateSchema } from '@/lib/validations';
import { createAuditLog } from '@/lib/audit';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/admin/deposits/manual
 * Admin manually input waste deposit for a member
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin_bumdes') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validatedData = wasteDepositCreateSchema.parse(body);

    // Verify member exists and is active
    const member = await db.member.findUnique({
      where: { id: validatedData.memberId },
    });

    if (
      !member ||
      member.status !== 'active' ||
      member.bumdesId !== session.user.bumdesId
    ) {
      return NextResponse.json(
        { error: 'Member not found or inactive' },
        { status: 400 }
      );
    }

    // Create deposit
    const deposit = await createWasteDeposit({
      memberId: validatedData.memberId,
      bumdesId: member.bumdesId,
      depositDate: new Date(validatedData.depositDate),
      weightKg: validatedData.weightKg,
      categoryId: validatedData.categoryId,
      photoUrl: validatedData.photoUrl,
      notes: validatedData.notes,
      pointsPerKg: body.pointsPerKg || 10,
      inputMethod: 'admin_manual',
      inputBy: session.user.id,
    });

    // Verify it immediately (admin input)
    await verifyDeposit(
      deposit.id,
      session.user.id as string,
      'verified'
    );

    await createAuditLog({
      action: 'MANUAL_DEPOSIT_CREATED',
      entityType: 'waste_deposit',
      entityId: deposit.id,
      newValues: validatedData,
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      deposit,
    });
  } catch (error: any) {
    console.error('Manual deposit error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create deposit' },
      { status: 400 }
    );
  }
}
