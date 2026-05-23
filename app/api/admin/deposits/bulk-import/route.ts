import { auth } from '@/auth/config';
import { db } from '@/db';
import { createWasteDeposit, verifyDeposit } from '@/app/api/member/queries';
import { createAuditLog } from '@/lib/audit';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin_bumdes') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'File required' }, { status: 400 });
    }

    if (!session.user.bumdesId) {
      return NextResponse.json({ error: 'Organization not assigned' }, { status: 400 });
    }

    const bumdesId = session.user.bumdesId;

    const csv = await file.text();
    const lines = csv.split('\n').slice(1); // Skip header
    let success = 0;
    let failed = 0;

    for (const line of lines) {
      if (!line.trim()) continue;

      try {
        const [memberId, weight, category, depositDate] = line.split(',').map(s => s.trim());
        const member = await db.member.findUnique({
          where: { id: memberId },
        });

        if (!member || member.status !== 'active' || member.bumdesId !== bumdesId) {
          failed++;
          continue;
        }

        const deposit = await createWasteDeposit({
          memberId,
          bumdesId: member.bumdesId,
          depositDate: new Date(depositDate),
          weightKg: parseFloat(weight),
          categoryId: category,
          pointsPerKg: 10,
          inputMethod: 'admin_import',
          inputBy: session.user.id,
        });

        await verifyDeposit(deposit.id, session.user.id as string, 'verified');
        success++;
      } catch (error) {
        console.error('Error processing row:', error);
        failed++;
      }
    }

    await createAuditLog({
      action: 'BULK_IMPORT_COMPLETED',
      entityType: 'waste_deposits',
      newValues: { success, failed, total: success + failed },
      status: 'success',
    });

    return NextResponse.json({ success, failed, total: success + failed });
  } catch (error: any) {
    console.error('Bulk import error:', error);
    return NextResponse.json(
      { error: error.message || 'Bulk import failed' },
      { status: 400 }
    );
  }
}
