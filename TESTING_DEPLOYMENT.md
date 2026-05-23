# Phase 8: Testing & Deployment Guide

## Overview
Phase 8 completes the project with comprehensive testing strategies and production deployment procedures. The system is production-ready pending environment configuration and final verification.

## Testing Strategy

### 1. Unit Testing (Jest)

**Database Utilities**
```typescript
// tests/lib/security.test.ts
import { hashPassword, verifyPassword, encryptData, decryptData } from '@/lib/security';

describe('Security Utils', () => {
  it('should hash password correctly', async () => {
    const password = 'SecurePass123!';
    const hash = await hashPassword(password);
    expect(hash).not.toBe(password);
    expect(hash.length).toBeGreaterThan(20);
  });

  it('should verify correct password', async () => {
    const password = 'SecurePass123!';
    const hash = await hashPassword(password);
    const match = await verifyPassword(password, hash);
    expect(match).toBe(true);
  });

  it('should encrypt and decrypt data', () => {
    const data = '0812345678';
    const encrypted = encryptData(data);
    const decrypted = decryptData(encrypted);
    expect(decrypted).toBe(data);
  });
});
```

**Validation Schemas**
```typescript
// tests/lib/validations.test.ts
import { wasteDepositSchema, memberCreateSchema } from '@/lib/validations';

describe('Validation Schemas', () => {
  it('should validate waste deposit', () => {
    const data = {
      memberId: 'MEM-001',
      weight: 5.5,
      category: 'leaves',
      submittedAt: '2026-05-23',
      notes: 'Test deposit',
    };
    expect(() => wasteDepositSchema.parse(data)).not.toThrow();
  });

  it('should reject invalid weight', () => {
    const data = {
      memberId: 'MEM-001',
      weight: -5,
      category: 'leaves',
      submittedAt: '2026-05-23',
    };
    expect(() => wasteDepositSchema.parse(data)).toThrow();
  });
});
```

### 2. Integration Testing

**API Endpoints**
```typescript
// tests/api/auth.integration.test.ts
import { POST as registerHandler } from '@/app/api/auth/register/route';

describe('Auth APIs', () => {
  it('should register new user', async () => {
    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'newuser@test.com',
        name: 'New User',
        password: 'SecurePass123!',
      }),
    });

    const response = await registerHandler(request);
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.user.email).toBe('newuser@test.com');
  });

  it('should prevent duplicate registration', async () => {
    // Register first time
    const request1 = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'duplicate@test.com',
        name: 'User',
        password: 'SecurePass123!',
      }),
    });
    await registerHandler(request1);

    // Try registering same email
    const request2 = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'duplicate@test.com',
        name: 'User',
        password: 'SecurePass123!',
      }),
    });
    const response = await registerHandler(request2);
    expect(response.status).toBe(400);
  });
});
```

### 3. End-to-End Testing (Playwright)

**Member Workflow**
```typescript
// tests/e2e/member-workflow.spec.ts
import { test, expect } from '@playwright/test';

test('Member can submit deposit and claim reward', async ({ page }) => {
  // Login
  await page.goto('http://localhost:3000/login');
  await page.fill('input[name="email"]', 'member@test.com');
  await page.fill('input[name="password"]', 'SecurePass123!');
  await page.click('button[type="submit"]');

  // Wait for dashboard
  await page.waitForURL('**/app/member/dashboard');
  await expect(page).toHaveTitle(/Dashboard/);

  // Submit deposit
  await page.click('text=Setor Sampah');
  await page.fill('input[name="weight"]', '5.5');
  await page.selectOption('select[name="category"]', 'leaves');
  await page.click('button:has-text("Submit")');

  // Verify deposit created
  await page.waitForSelector('text=5.5 kg');
  await expect(page).toHaveURL('**/deposits');

  // Claim reward
  await page.click('text=Rewards');
  await page.click('text=Claim Reward');
  await page.fill('input[name="amount"]', '100');
  await page.click('button:has-text("Request")');

  // Verify claim created
  await expect(page).toHaveURL('**/rewards');
});
```

**Admin Verification Workflow**
```typescript
// tests/e2e/admin-verification.spec.ts
test('Admin can verify deposits', async ({ page }) => {
  // Admin login
  await page.goto('http://localhost:3000/login');
  await page.fill('input[name="email"]', 'admin@test.com');
  await page.fill('input[name="password"]', 'AdminSecure123!');
  await page.click('button[type="submit"]');

  // Navigate to deposits
  await page.waitForURL('**/app/admin/dashboard');
  await page.click('text=Deposits');

  // Verify deposit
  await page.click('button:has-text("Verify")');
  await page.selectOption('select[name="status"]', 'approved');
  await page.click('button:has-text("Save")');

  // Verify success
  await expect(page).toHaveURL('**/admin/deposits');
});
```

### 4. Load Testing

**Using Artillery**
```yaml
# tests/load/config.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
    - duration: 120
      arrivalRate: 20
    - duration: 60
      arrivalRate: 10

scenarios:
  - name: 'Member Dashboard'
    flow:
      - get:
          url: '/app/member/dashboard'
      - think: 5
      - get:
          url: '/api/member/deposits'
      - think: 3
      - post:
          url: '/api/member/deposits'
          json: {weight: 5, category: 'leaves'}
```

### 5. Security Testing

**OWASP Top 10 Checks**
```typescript
// tests/security/owasp.test.ts
describe('OWASP Top 10 Security', () => {
  // A1: Injection
  it('should prevent SQL injection', async () => {
    const payload = "'; DROP TABLE users; --";
    const response = await fetch('/api/member/deposits', {
      method: 'POST',
      body: JSON.stringify({ memberId: payload }),
    });
    expect(response.status).toBe(400); // Validation fails
  });

  // A2: Authentication
  it('should require authentication', async () => {
    const response = await fetch('/api/admin/dashboard', {
      headers: { 'Cookie': '' },
    });
    expect(response.status).toBe(401);
  });

  // A3: XSS
  it('should prevent XSS attacks', async () => {
    const xssPayload = '<script>alert("XSS")</script>';
    const response = await fetch('/api/member/deposits', {
      method: 'POST',
      body: JSON.stringify({ notes: xssPayload }),
    });
    // Content should be escaped
    expect(response.body).not.toContain('<script>');
  });

  // A5: CSRF
  it('should have CSRF token', async () => {
    const response = await fetch('/app/member/dashboard');
    const html = await response.text();
    expect(html).toContain('csrf');
  });
});
```

## Deployment Procedures

### Pre-Deployment Checklist

- [ ] All tests passing (unit, integration, E2E)
- [ ] Code review completed
- [ ] Security audit passed
- [ ] Performance benchmarks met
- [ ] Database migrations tested
- [ ] Environment variables configured
- [ ] SSL certificate prepared
- [ ] Backup strategy verified
- [ ] Monitoring configured
- [ ] Runbook prepared

### Production Environment Setup

**Step 1: Database**
```bash
# Create production database
createdb -h prod-db-host waste_system_prod

# Run migrations
DATABAS_URL=postgresql://prod_user:pass@prod-host/waste_system_prod \
pnpm drizzle-kit push:pg --prod

# Verify schema
psql -h prod-db-host -U prod_user -d waste_system_prod -c '\dt'
```

**Step 2: Application**
```bash
# Build
pnpm build

# Test build
pnpm start

# Deploy to Vercel
vercel deploy --prod

# Or deploy to Docker
docker build -t waste-system:1.0.0 .
docker push your-registry/waste-system:1.0.0
```

**Step 3: Configuration**
```env
# Production environment variables
DATABASE_URL=postgresql://prod_user:password@prod-host:5432/waste_db_prod
NEXTAUTH_SECRET=your-very-secure-random-secret-here
NEXTAUTH_URL=https://waste-system.yourdomain.com
NODE_ENV=production
LOG_LEVEL=info
```

**Step 4: DNS & SSL**
```bash
# Point domain to application
# Configure Vercel/Load Balancer DNS

# SSL certificate (Let's Encrypt via Vercel)
# Automatic renewal enabled
```

**Step 5: Monitoring**
```bash
# Application monitoring (Sentry/New Relic)
SENTRY_DSN=https://your-sentry-dsn

# Database monitoring (pgAdmin/Datadog)
# Logging (CloudWatch/ELK Stack)
# Performance monitoring (New Relic APM)
```

### Deployment on Vercel (Recommended)

```bash
# 1. Connect GitHub repository
vercel link --repo github.com/user/waste-system

# 2. Add environment variables
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL

# 3. Deploy preview
git push origin feature-branch
# Vercel auto-deploys preview

# 4. Deploy production
git push origin main
# Vercel auto-deploys to production

# 5. Monitor deployment
vercel logs
```

### Deployment on Docker

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

COPY . .

RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
```

```bash
# Build and push
docker build -t waste-system:1.0.0 .
docker push registry.example.com/waste-system:1.0.0

# Deploy on Kubernetes
kubectl apply -f k8s-deployment.yaml
```

### Post-Deployment Verification

```bash
# Health check
curl https://waste-system.yourdomain.com/

# API test
curl -X POST https://waste-system.yourdomain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!"}'

# Database connectivity
# Login and verify member/admin/super-admin dashboards

# Audit logs
# Verify logging is working
```

## Performance Optimization

### Database
- Create indexes on frequently queried fields
- Analyze query execution plans
- Enable query caching

### Application
- Enable caching headers
- Minify JavaScript/CSS
- Optimize images
- Use CDN for static assets

### Monitoring
```typescript
// Add performance monitoring
import { performance } from 'perf_hooks';

const start = performance.now();
// ... operation
const duration = performance.now() - start;
console.log(`Operation took ${duration}ms`);
```

## Scaling Strategy

### Horizontal Scaling
- Multiple application instances
- Load balancer (ALB/NLB)
- Session sharing (Redis)
- Database read replicas

### Vertical Scaling
- Larger server instance
- Increased memory/CPU
- Better database machine

## Backup & Recovery

### Automated Backups
```bash
# Daily backups
0 2 * * * pg_dump waste_system_prod | gzip > backup_$(date +\%Y\%m\%d).sql.gz

# Weekly full backup to S3
0 3 * * 0 aws s3 cp backup_$(date +\%Y\%m\%d).sql.gz s3://backups/
```

### Recovery Procedure
```bash
# 1. Stop application
systemctl stop waste-system

# 2. Restore database
gunzip < backup_20260523.sql.gz | psql waste_system_prod

# 3. Verify data
psql -c 'SELECT COUNT(*) FROM members;'

# 4. Restart application
systemctl start waste-system

# 5. Verify functionality
curl https://waste-system.yourdomain.com/
```

## Monitoring & Alerts

### Key Metrics
- Request response time
- Error rates
- Database query duration
- Failed login attempts
- API rate limit hits
- Disk usage
- Memory usage
- CPU usage

### Alert Thresholds
- Response time > 2 seconds
- Error rate > 1%
- Database query > 5 seconds
- Failed logins > 10/hour
- Disk usage > 85%
- Memory usage > 80%

### Monitoring Tools
- Application: Vercel Analytics / Sentry
- Database: pgAdmin / AWS RDS Monitoring
- Logs: CloudWatch / ELK Stack
- Uptime: StatusPage.io / UptimeRobot

## Rollback Procedure

```bash
# If deployment fails
vercel rollback

# Or deploy previous version
git revert HEAD
git push origin main

# Verify rollback
curl https://waste-system.yourdomain.com/
```

## Documentation

- **DEPLOYMENT.md** - This file
- **RUNBOOK.md** - Operations procedures
- **TROUBLESHOOTING.md** - Common issues
- **API.md** - API documentation
- **SECURITY.md** - Security procedures

## Support & Escalation

**Level 1 Issues**
- Check logs: `vercel logs --tail`
- Restart service: `vercel redeploy`
- Check status: Service dashboard

**Level 2 Issues**
- Database issues: DBA team
- Performance: DevOps team
- Security: Security team

**Level 3 Issues**
- Major outage: Incident commander
- Data loss: CEO notification
- Security breach: CTO + Legal

## Sign-Off Checklist

- [ ] All tests passing
- [ ] Security audit completed
- [ ] Performance meets SLAs
- [ ] Monitoring configured
- [ ] Backup tested
- [ ] Team trained
- [ ] Documentation complete
- [ ] Deployment approved
- [ ] Go-live scheduled

---

**Deployment Date**: [To be scheduled]
**Deployment Team**: [To be assigned]
**Emergency Contact**: [To be provided]
**Status Page**: [To be created]
