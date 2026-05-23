import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth/config';
import { getBUMDESRewardClaims, approveRewardClaim, rejectRewardClaim } from '../queries';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin_bumdes' || !session.user.bumdesId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const claims = await getBUMDESRewardClaims(session.user.bumdesId);

    return NextResponse.json({ claims });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch claims';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin_bumdes') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { claimId, action, rejectionReason, approvalNotes } = body;

    if (action === 'approve') {
      const claim = await approveRewardClaim(claimId, session.user.id, approvalNotes);
      return NextResponse.json({ success: true, claim });
    }

    if (action === 'reject') {
      const claim = await rejectRewardClaim(claimId, rejectionReason || 'Ditolak admin');
      return NextResponse.json({ success: true, claim });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update claim';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
