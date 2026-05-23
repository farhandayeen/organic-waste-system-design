import { auth } from '@/auth/config';
import { db } from '@/db';
import { createAuditLog } from '@/lib/audit';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orgs = await db.organization.findMany({
      include: {
        systemSettings: true,
        _count: {
          select: { members: true, users: true },
        },
      },
    });

    return NextResponse.json({ organizations: orgs });
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
    const { name, code, address, contactEmail, contactPhone } = body;

    const org = await db.organization.create({
      data: {
        name,
        code,
        address: address || '',
        email: contactEmail || '',
        phone: contactPhone || '',
        isActive: true,
      },
    });

    // Create default system settings
    await db.systemSettings.create({
      data: {
        bumdesId: org.id,
        depositPointRate: 10,
        rewardExchangeRate: 100,
      },
    });

    await createAuditLog({
      action: 'ORGANIZATION_CREATED',
      entityType: 'organization',
      entityId: org.id,
      newValues: { name, code },
      status: 'success',
    });

    return NextResponse.json({ success: true, organization: org }, { status: 201 });
  } catch (error: any) {
    console.error('Create organization error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create organization' },
      { status: 400 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, name, code, address, contactEmail, contactPhone, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 });
    }

    const org = await db.organization.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(code !== undefined && { code }),
        ...(address !== undefined && { address }),
        ...(contactEmail !== undefined && { email: contactEmail }),
        ...(contactPhone !== undefined && { phone: contactPhone }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    await createAuditLog({
      action: 'ORGANIZATION_UPDATED',
      entityType: 'organization',
      entityId: org.id,
      newValues: { name, code, address, contactEmail, contactPhone, isActive },
      status: 'success',
    });

    return NextResponse.json({ success: true, organization: org });
  } catch (error: any) {
    console.error('Update organization error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update organization' },
      { status: 400 }
    );
  }
}
