import { db } from '@/db';
import { hashPassword, verifyPassword } from '@/lib/security';

export { verifyPassword };

/**
 * Find user by email
 */
export async function findUserByEmail(email: string) {
  return db.user.findUnique({
    where: { email },
  });
}

/**
 * Find user by ID
 */
export async function findUserById(userId: string) {
  return db.user.findUnique({
    where: { id: userId },
  });
}

/**
 * Create a new user
 */
export async function createUser(input: {
  email: string;
  firstName: string;
  lastName?: string;
  password: string;
  phone?: string;
  role: 'member' | 'admin_bumdes' | 'super_admin';
  bumdesId?: string;
}) {
  const hashedPassword = await hashPassword(input.password);

  return db.user.create({
    data: {
      email: input.email,
      passwordHash: hashedPassword,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      role: input.role,
      bumdesId: input.bumdesId,
    },
  });
}

/**
 * Update user password
 */
export async function updateUserPassword(userId: string, newPassword: string) {
  const hashedPassword = await hashPassword(newPassword);

  return db.user.update({
    where: { id: userId },
    data: {
      passwordHash: hashedPassword,
      lastPasswordChange: new Date(),
      requirePasswordChange: false,
    },
  });
}

/**
 * Verify user credentials
 */
export async function verifyUserCredentials(email: string, password: string) {
  const user = await findUserByEmail(email);

  if (!user) {
    return null;
  }

  const isValidPassword = await verifyPassword(password, user.passwordHash);

  if (!isValidPassword) {
    return null;
  }

  return user;
}

/**
 * Get user with profile information
 */
export async function getUserProfile(userId: string) {
  const user = await findUserById(userId);

  if (!user) {
    return null;
  }

  if (user.role === 'member') {
    const memberProfile = await db.member.findFirst({
      where: { userId },
      include: {
        organization: true,
      },
    });

    return {
      ...user,
      member: memberProfile,
    };
  }

  if (user.bumdesId) {
    const org = await db.organization.findUnique({
      where: { id: user.bumdesId },
    });

    return {
      ...user,
      organization: org,
    };
  }

  return user;
}

/**
 * Update last login timestamp
 */
export async function updateLastLogin(userId: string) {
  await db.user.update({
    where: { id: userId },
    data: {
      lastLogin: new Date(),
    },
  });
}

/**
 * Activate 2FA for user
 */
export async function enable2FA(userId: string, secret: string) {
  await db.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: true,
      twoFactorSecret: secret,
    },
  });
}

/**
 * Disable 2FA for user
 */
export async function disable2FA(userId: string) {
  await db.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: false,
      twoFactorSecret: null,
    },
  });
}

/**
 * Check if user is active
 */
export async function isUserActive(userId: string): Promise<boolean> {
  const user = await findUserById(userId);
  return user?.isActive || false;
}

/**
 * Suspend user account
 */
export async function suspendUser(userId: string, reason?: string) {
  await db.user.update({
    where: { id: userId },
    data: {
      isActive: false,
    },
  });
}

/**
 * Activate user account
 */
export async function activateUser(userId: string) {
  await db.user.update({
    where: { id: userId },
    data: {
      isActive: true,
    },
  });
}
