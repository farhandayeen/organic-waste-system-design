# Phase 7: Security Hardening & Rate Limiting

## Overview
Phase 7 implements critical security features including rate limiting, enhanced logging, and audit trail management to protect the system from abuse and ensure compliance.

## Features Implemented

### 1. Login Rate Limiting
**File**: `lib/rate-limit.ts`
**Function**: `checkLoginRateLimit(email, ipAddress)`

**Configuration**:
- Max attempts: 5 failed attempts
- Time window: 15 minutes
- Tracks per email + IP combination

**Features**:
- Blocks login after 5 failed attempts
- 15-minute lockout period
- Returns remaining attempts to user
- IP-based tracking to prevent distributed attacks

**Implementation**:
```typescript
const { allowed, attemptsRemaining, resetTime } = 
  await checkLoginRateLimit(email, ipAddress);

if (!allowed) {
  return NextResponse.json(
    { error: `Too many attempts. Try again at ${resetTime}` },
    { status: 429 }
  );
}
```

### 2. Login Attempt Tracking
**Table**: `login_attempts` (already in schema)
**Fields**:
- email - User email
- ipAddress - Source IP address
- success - true/false
- reason - Why it was recorded
- timestamp - When attempt occurred

**Queries**:
```typescript
// Record failed attempt
await recordLoginAttempt(email, ipAddress, false, 'invalid_credentials');

// Record successful attempt
await recordLoginAttempt(email, ipAddress, true, 'successful_login');

// Clear old attempts (run daily)
await clearOldLoginAttempts();
```

### 3. Audit Logging Infrastructure
**File**: `lib/audit.ts`
**Main Function**: `createAuditLog()`

**Logged Actions**:
- LOGIN_SUCCESS / LOGIN_FAILED / LOGIN_BLOCKED
- MEMBER_CREATED / MEMBER_UPDATED / MEMBER_DELETED
- DEPOSIT_SUBMITTED / DEPOSIT_VERIFIED / DEPOSIT_REJECTED
- POINTS_ADJUSTED / REWARD_CLAIMED / REWARD_APPROVED
- ADMIN_CREATED / ADMIN_SUSPENDED
- SETTINGS_CHANGED / ORG_CREATED / ORG_UPDATED

**Audit Log Structure**:
```json
{
  "userId": "uuid",
  "action": "LOGIN_SUCCESS",
  "resourceType": "user",
  "resourceId": "user-id",
  "changes": {
    "field": "oldValue → newValue"
  },
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "timestamp": "2026-05-23T10:30:00Z"
}
```

### 4. Enhanced Audit Trail
**Fields Captured**:
- User ID (who did it)
- Action (what was done)
- Resource Type & ID (what was affected)
- Changes JSON (before/after values)
- IP Address (from where)
- User Agent (from what client)
- Timestamp (when)

**Sample Queries**:
```typescript
// Find all actions by admin
SELECT * FROM audit_logs 
WHERE userId = 'admin-id' 
ORDER BY timestamp DESC;

// Find all changes to member points
SELECT * FROM audit_logs 
WHERE action = 'POINTS_ADJUSTED' 
  AND resourceId = 'member-id' 
ORDER BY timestamp DESC;

// Detect suspicious activity (multiple failed logins)
SELECT email, COUNT(*) as attempts 
FROM login_attempts 
WHERE success = false 
  AND timestamp > NOW() - INTERVAL '1 hour'
GROUP BY email 
HAVING COUNT(*) > 5;
```

### 5. Security Headers
**Next Headers to Add** (Phase 8):
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security: max-age=31536000
- Content-Security-Policy: Configured per page

### 6. Password Security Enhancement
**Already Implemented**:
- Minimum 12 characters
- Uppercase, lowercase, numbers, special chars required
- Bcryptjs hashing (12 rounds)
- Password history tracking (5 previous passwords)

**Scheduled Actions** (Phase 8):
- Password change every 90 days
- Session termination on password change
- Force change on account creation
- Account lockout after 5 wrong attempts

### 7. Session Security
**Configuration**:
- JWT tokens with 30-minute expiration
- HTTP-only cookies (when enabled)
- CSRF token validation (NextAuth built-in)
- Session invalidation on logout

**Session Tokens Include**:
- User ID
- Email
- Role
- Organization ID
- Issued timestamp
- Expiration time

### 8. API Rate Limiting (Infrastructure)
**Configuration**:
```typescript
// General API
- 100 requests per minute per IP
- 10 requests per second per user

// Admin API
- 1000 requests per minute per IP
- 100 requests per second per admin

// Bulk Import
- 1 upload per minute per admin
- Max 10,000 rows per import
```

**Implementation** (Phase 8):
- Express rate limiter middleware
- Redis-based for distributed systems
- Database fallback for single server

### 9. Threat Detection
**Monitored Patterns**:
- 5+ failed logins in 15 minutes → Account lockout
- 10+ API errors in 1 minute → Rate limit increase
- Unusual deposit amounts → Manual review flag
- Multiple IP logins within 1 minute → Session warning
- Unusual report generation → Access review

### 10. Data Protection
**Already Implemented**:
- AES-256 encryption for sensitive fields
- SQL injection prevention (Drizzle ORM)
- XSS prevention (React content escaping)
- CSRF tokens (NextAuth)

**Encryption Fields**:
- phone_number
- bank_account_number
- id_document_number
- sensitive_notes

## API Endpoints Using Rate Limiting

### Login Endpoint
```typescript
POST /api/auth/[...nextauth]/callback/credentials
- Check login rate limit
- Record attempt (success/failure)
- Return 429 if exceeded
- Include reset time in response
```

### Protected Admin Endpoints
```typescript
POST /api/admin/deposits/manual
POST /api/admin/members/bulk-import
POST /api/admin/points/adjustment
- Check rate limits
- Return 429 if exceeded
- Log all access attempts
```

## Database Queries for Security

### Check Account Lockout Status
```sql
SELECT email, COUNT(*) as failed_attempts, 
       MAX(timestamp) as last_attempt
FROM login_attempts
WHERE success = false 
  AND timestamp > NOW() - INTERVAL '15 minutes'
GROUP BY email
HAVING COUNT(*) >= 5;
```

### Audit Trail for Compliance
```sql
SELECT 
  al.userId,
  al.action,
  al.resourceType,
  al.changes,
  al.ipAddress,
  al.timestamp
FROM audit_logs al
WHERE al.timestamp > NOW() - INTERVAL '30 days'
ORDER BY al.timestamp DESC;
```

### Security Events Summary
```sql
SELECT 
  EXTRACT(HOUR FROM timestamp) as hour,
  COUNT(*) as total_events,
  COUNT(CASE WHEN action LIKE 'LOGIN%' THEN 1 END) as login_events,
  COUNT(CASE WHEN action LIKE 'FAILED' THEN 1 END) as failed_events
FROM audit_logs
WHERE timestamp > NOW() - INTERVAL '7 days'
GROUP BY EXTRACT(HOUR FROM timestamp)
ORDER BY hour DESC;
```

## Security Best Practices

### Implemented
✅ Rate limiting on login (5 attempts/15 min)
✅ Login attempt tracking
✅ Comprehensive audit logging
✅ Password policy enforcement
✅ Session expiration (30 min)
✅ Password hashing (bcryptjs 12 rounds)
✅ Encryption for sensitive fields
✅ CSRF protection

### Recommended for Production
⏳ Enable 2FA for all admin accounts
⏳ Set up email alerts for suspicious activity
⏳ Regular database backups (daily)
⏳ Log rotation and archival
⏳ Security header middleware
⏳ WAF (Web Application Firewall)
⏳ DDoS protection
⏳ Regular security audits

## Monitoring & Alerting

### Key Metrics to Monitor
1. Failed login attempts per hour
2. API errors per minute
3. Bulk import job failures
4. Unusual deposit amounts
5. Admin action patterns
6. Session timeout events

### Alert Thresholds
- 10+ failed logins in 1 hour → Alert admin
- 100+ API errors in 1 minute → Scale response
- 1000+ bulk import failures → Manual review
- IP address from unusual location → Verify user
- After-hours admin activity → Check legitimacy

## Configuration for Production

### Environment Variables
```env
# Rate limiting
LOGIN_MAX_ATTEMPTS=5
LOGIN_WINDOW_MINUTES=15
API_RATE_LIMIT=100
ADMIN_RATE_LIMIT=1000

# Session
SESSION_TIMEOUT_MINUTES=30
SESSION_ABSOLUTE_TIMEOUT_HOURS=8

# Security
FORCE_PASSWORD_CHANGE_DAYS=90
PASSWORD_HISTORY_LIMIT=5
MIN_PASSWORD_LENGTH=12
REQUIRE_UPPERCASE=true
REQUIRE_NUMBERS=true
REQUIRE_SPECIAL_CHARS=true
REQUIRE_2FA_ADMIN=true
```

## Maintenance Tasks

### Daily
- Review failed login attempts
- Check for unusual patterns
- Verify backup completion

### Weekly
- Audit log review
- Security incident analysis
- Performance metrics analysis

### Monthly
- Full security audit
- Penetration testing
- Access review
- Policy compliance check

## Testing Security

### Manual Testing
```bash
# Test rate limiting
for i in {1..10}; do 
  curl -X POST /api/auth/callback/credentials \
    -d "email=test@test.com&password=wrong"
done
# Should get 429 after 5 attempts

# Check audit logs
SELECT COUNT(*) FROM audit_logs WHERE timestamp > NOW() - INTERVAL '1 hour';

# Check login attempts
SELECT * FROM login_attempts WHERE success = false LIMIT 10;
```

### Automated Testing (Phase 8)
- Load testing with concurrent requests
- Rate limit validation tests
- Audit log completeness tests
- Encryption/decryption tests

## Compliance & Regulations

### Indonesian Data Protection
- GDPR-like principles for data handling
- Data retention policies (audit logs 1 year)
- User data deletion requests
- Transparent privacy policy

### Financial Transaction Security
- PCI DSS compliance for payment data
- Secure transmission (HTTPS/TLS)
- Encryption at rest
- Regular security audits

## Next Steps (Phase 8)

1. Implement 2FA TOTP setup & verification
2. Add email notifications
3. Set up automated log rotation
4. Configure security headers middleware
5. Implement automated backups
6. Add performance monitoring
7. Deploy to production environment
8. Set up monitoring and alerting

## Documentation References

- Rate limiting: `lib/rate-limit.ts`
- Audit logging: `lib/audit.ts`
- Login attempts: `db/schema.ts` (login_attempts table)
- Security utilities: `lib/security.ts`
- Validation: `lib/validations.ts`
