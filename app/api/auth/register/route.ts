import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/auth/queries';
import { createAuditLog } from '@/lib/audit';
import { registerSchema } from '@/lib/validations';
import { db } from '@/db';
import { Prisma } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = registerSchema.parse(body);

    // Create user
    const user = await createUser({
      email: validated.email,
      firstName: validated.firstName,
      lastName: validated.lastName,
      password: validated.password,
      phone: validated.phone,
      role: 'member',
      bumdesId: validated.bumdesId,
    });

    // Create member profile
    const memberNumber = `MBR-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    await db.member.create({
      data: {
        userId: user.id,
        bumdesId: validated.bumdesId,
        memberNumber,
        fullName: `${user.firstName} ${user.lastName || ''}`,
        phone: user.phone || undefined,
        address: validated.alamat,
        status: 'active',
        totalPoints: new Prisma.Decimal(0),
        totalDeposits: new Prisma.Decimal(0),
        totalWithdrawals: new Prisma.Decimal(0),
      },
    });

    await createAuditLog({
      action: 'MEMBER_REGISTERED',
      entityType: 'user',
      entityId: user.id,
      newValues: {
        email: user.email,
        firstName: user.firstName,
        role: user.role,
      },
      status: 'success',
    });

    return NextResponse.json(
      {
        message: 'Registration successful',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);

    let message = 'Registration failed';
    let status = 500;

    if (error.name === 'ZodError') {
      message = error.errors[0].message;
      status = 400;
    } else if (error.message?.includes('unique')) {
      message = 'Email already registered';
      status = 409;
    }

    await createAuditLog({
      action: 'MEMBER_REGISTRATION_FAILED',
      entityType: 'user',
      status: 'failure',
      errorMessage: error.message,
    });

    return NextResponse.json({ error: message }, { status });
  }
}
