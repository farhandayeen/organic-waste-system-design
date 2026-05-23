import { NextResponse } from 'next/server';
import { auth } from '@/auth/config';
import { getBUMDESMembers } from '../queries';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin_bumdes' || !session.user.bumdesId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const members = await getBUMDESMembers(session.user.bumdesId, { limit: 200 });

    return NextResponse.json({ members });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch members';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
