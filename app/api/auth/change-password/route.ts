import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth/config';
import { changePasswordSchema } from '@/lib/validations';
import { findUserById, verifyPassword, updateUserPassword } from '@/auth/queries';
import { createAuditLog } from '@/lib/audit';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate input
    const validated = changePasswordSchema.parse(body);

    // Get user
    const user = await findUserById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify current password
    const isValidPassword = await verifyPassword(validated.currentPassword, user.passwordHash);
    if (!isValidPassword) {
      await createAuditLog({
        action: 'PASSWORD_CHANGE_FAILED',
        entityType: 'user',
        entityId: user.id,
        status: 'failure',
        errorMessage: 'Invalid current password',
      });
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Update password
    await updateUserPassword(user.id, validated.newPassword);

    await createAuditLog({
      action: 'PASSWORD_CHANGED',
      entityType: 'user',
      entityId: user.id,
      status: 'success',
    });

    return NextResponse.json(
      { message: 'Password changed successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Change password error:', error);

    let message = 'Change password failed';
    let status = 500;

    if (error.name === 'ZodError') {
      message = error.errors[0].message;
      status = 400;
    }

    return NextResponse.json({ error: message }, { status });
  }
}
