import { auth } from '@/auth/config';
import { db } from '@/db';
import { createUser } from '@/auth/queries';
import { createAuditLog } from '@/lib/audit';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admins = await db.user.findMany({
      where: {
        role: { in: ['admin_bumdes', 'super_admin'] },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ admins });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { email, firstName, lastName, password, role, bumdesId } = body;

    const user = await createUser({
      email,
      firstName,
      lastName,
      password,
      role,
      bumdesId,
    });

    await createAuditLog({
      action: 'ADMIN_CREATED',
      entityType: 'user',
      entityId: user.id,
      newValues: { email, firstName, role },
      status: 'success',
    });

    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (error: any) {
    console.error('Create admin error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create admin' },
      { status: 400 }
    );
  }
}
