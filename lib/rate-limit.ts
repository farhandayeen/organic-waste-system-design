import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxAttempts: number; // Max attempts per window
  skipSuccessfulRequests?: boolean;
}

const LOGIN_CONFIG: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxAttempts: 5,
  skipSuccessfulRequests: true,
};

const API_CONFIG: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxAttempts: 100,
};

const ADMIN_API_CONFIG: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxAttempts: 1000,
};

/**
 * Check if IP/email combination has exceeded rate limit
 */
export async function checkLoginRateLimit(
  email: string,
  ipAddress: string
): Promise<{ allowed: boolean; attemptsRemaining: number; resetTime: Date }> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - LOGIN_CONFIG.windowMs);

  const attempts = await db.loginAttempt.findMany({
    where: {
      email,
      ipAddress,
      success: false,
      timestamp: {
        gt: windowStart,
      },
    },
    orderBy: {
      timestamp: 'asc',
    },
  });

  const attemptsCount = attempts.length;
  const allowed = attemptsCount < LOGIN_CONFIG.maxAttempts;
  const attemptsRemaining = Math.max(0, LOGIN_CONFIG.maxAttempts - attemptsCount);

  let resetTime = new Date(now.getTime() + LOGIN_CONFIG.windowMs);
  if (attempts.length > 0) {
    resetTime = new Date(attempts[0].timestamp.getTime() + LOGIN_CONFIG.windowMs);
  }

  return { allowed, attemptsRemaining, resetTime };
}

/**
 * Record login attempt
 */
export async function recordLoginAttempt(
  email: string,
  ipAddress: string,
  success: boolean,
  reason?: string
): Promise<void> {
  await db.loginAttempt.create({
    data: {
      email,
      ipAddress,
      success,
      reason: reason || (success ? 'successful_login' : 'invalid_credentials'),
      timestamp: new Date(),
    },
  });
}

/**
 * Clear old login attempts (run periodically)
 */
export async function clearOldLoginAttempts(): Promise<number> {
  const windowStart = new Date(Date.now() - LOGIN_CONFIG.windowMs * 2);

  const deleted = await db.loginAttempt.deleteMany({
    where: {
      timestamp: {
        lt: windowStart,
      },
    },
  });

  return deleted.count;
}

/**
 * API Rate Limiter
 */
export function createApiRateLimiter(config: RateLimitConfig) {
  return async (ipAddress: string): Promise<boolean> => {
    return true;
  };
}
