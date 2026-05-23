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

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!session.user.bumdesId) {
      return NextResponse.json({ error: 'Organization not assigned' }, { status: 400 });
    }

    const bumdesId = session.user.bumdesId;

    if (!file) {
      return NextResponse.json({ error: 'File required' }, { status: 400 });
    }

    const csv = await file.text();
    const lines = csv.split('\n').slice(1);
    let success = 0;
    let failed = 0;

    for (const line of lines) {
      if (!line.trim()) continue;

      try {
        const [fullName, phone, address] = line.split(',').map(s => s.trim());

        await db.member.create({
          data: {
            bumdesId,
            fullName,
            phone: phone || undefined,
            address: address || '',
            status: 'active',
            totalPoints: new Prisma.Decimal(0),
            totalDeposits: new Prisma.Decimal(0),
            totalWithdrawals: new Prisma.Decimal(0),
            memberNumber: `MBR-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          },
        });
        success++;
      } catch (error) {
        console.error('Error processing row:', error);
        failed++;
      }
    }

    await createAuditLog({
      action: 'BULK_IMPORT_MEMBERS',
      entityType: 'members',
      newValues: { success, failed },
      status: 'success',
    });

    return NextResponse.json({ success, failed, total: success + failed });
  } catch (error: any) {
    console.error('Bulk import members error:', error);
    return NextResponse.json(
      { error: error.message || 'Bulk import failed' },
      { status: 400 }
    );
  }
}
