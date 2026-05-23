import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth/config';
import { db } from '@/db';
import { memberUpdateSchema } from '@/lib/validations';
import { createAuditLog } from '@/lib/audit';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'member') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const member = await db.member.findFirst({
      where: { userId: session.user.id },
      include: { user: true, organization: true },
    });

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json({ member });
  } catch (error: any) {
    console.error('Get profile error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'member') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = memberUpdateSchema.parse(body);

    const member = await db.member.findFirst({
      where: { userId: session.user.id },
    });

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Prepare update data (only allow certain fields)
    const updateData: any = {};
    if (validated.firstName || validated.lastName) {
      updateData.fullName = `${validated.firstName || member.fullName.split(' ')[0]} ${validated.lastName || ''}`.trim();
    }
    if (validated.phone) updateData.phone = validated.phone;
    if (validated.alamat) updateData.address = validated.alamat;

    const updated = await db.member.update({
      where: { id: member.id },
      data: updateData,
      include: { user: true, organization: true },
    });

    await createAuditLog({
      action: 'PROFILE_UPDATED',
      entityType: 'member',
      entityId: member.id,
      oldValues: { fullName: member.fullName, phone: member.phone, address: member.address },
      newValues: updateData,
      status: 'success',
    });

    return NextResponse.json({ success: true, member: updated });
  } catch (error: any) {
    console.error('Update profile error:', error);
    let message = error.message;
    let status = 400;

    if (error.name === 'ZodError') {
      message = error.errors[0].message;
    }

    return NextResponse.json({ error: message }, { status });
  }
}
