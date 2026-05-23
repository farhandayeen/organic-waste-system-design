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

    const settings = await db.systemSettings.findMany();
    return NextResponse.json({ settings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { bumdesId, depositPointRate, rewardExchangeRate, ...settings } = body;

    const oldSettings = await db.systemSettings.findUnique({
      where: { bumdesId },
    });

    const updated = await db.systemSettings.update({
      where: { bumdesId },
      data: {
        depositPointRate: depositPointRate ? Number(depositPointRate) : undefined,
        rewardExchangeRate: rewardExchangeRate ? Number(rewardExchangeRate) : undefined,
        settings: settings && Object.keys(settings).length > 0 ? settings : undefined,
      },
    });

    await createAuditLog({
      action: 'SYSTEM_SETTINGS_UPDATED',
      entityType: 'system_settings',
      entityId: bumdesId,
      oldValues: oldSettings as any,
      newValues: updated as any,
      status: 'success',
    });

    return NextResponse.json({ success: true, settings: updated });
  } catch (error: any) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update settings' },
      { status: 400 }
    );
  }
}
