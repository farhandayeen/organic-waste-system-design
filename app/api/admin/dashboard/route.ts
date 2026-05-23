import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth/config';
import { getAdminDashboardStats } from '../queries';

/**
 * GET /api/admin/dashboard - Get admin dashboard stats
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'admin_bumdes') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session.user.bumdesId) {
      return NextResponse.json({ error: 'BUMDES not found' }, { status: 404 });
    }

    const stats = await getAdminDashboardStats(session.user.bumdesId);

    return NextResponse.json({ stats }, { status: 200 });
  } catch (error: any) {
    console.error('Get dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
