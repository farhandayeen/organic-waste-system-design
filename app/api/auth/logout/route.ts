import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth/config';
import { createAuditLog } from '@/lib/audit';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (session?.user?.id) {
      await createAuditLog({
        action: 'LOGOUT',
        entityType: 'user',
        entityId: session.user.id,
        status: 'success',
      });
    }

    const signOutUrl = new URL('/api/auth/signout', request.url);
    signOutUrl.searchParams.set('callbackUrl', '/login');

    return NextResponse.json({ url: signOutUrl.toString() }, { status: 200 });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
