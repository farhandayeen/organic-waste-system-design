# DEPLOYMENT & GETTING STARTED GUIDE

## Quick Start (5 minutes)

### 1. Environment Setup
```bash
# Clone/download project
cd /vercel/share/v0-project

# Install dependencies
pnpm install

# Create .env.local file
cp .env.local.example .env.local
# Edit .env.local with your database URL
```

### 2. Database Setup
```bash
# Create PostgreSQL database
createdb organic_waste_system

# Run migrations
pnpm drizzle-kit push:pg

# Verify connection
pnpm drizzle-kit studio
```

### 3. Start Development Server
```bash
# Run dev server
pnpm dev

# Access at http://localhost:3000
```

### 4. Test the System
```bash
# 1. Go to http://localhost:3000
# 2. Click "Register" or "Daftar"
# 3. Create member account
# 4. Login and access member dashboard
# 5. For admin access: Use super admin to create admin account first
```

---

## System Roles & Access

### Member Account
- **Email**: member@example.com
- **Password**: SecurePass123!
- **Access**: http://localhost:3000/app/member/dashboard
- **Features**: Submit deposits, claim rewards, view dashboard

### Admin Account
- **Creation**: Via Super Admin panel
- **Access**: http://localhost:3000/app/admin/dashboard
- **Features**: Verify deposits, create members, import CSVs, view reports

### Super Admin Account
- **Email**: superadmin@example.com
- **Password**: AdminSecure123!
- **Access**: http://localhost:3000/app/super-admin/dashboard
- **Features**: Manage orgs, create admins, global settings

---

## Key Features Overview

### For Members
1. **Submit Waste Deposit**
   - Enter weight (kg)
   - Select category
   - Get instant point calculation
   - Points credited to account

2. **View Dashboard**
   - Total points accumulated
   - Deposit history
   - Pending reward claims
   - Points breakdown

3. **Claim Rewards**
   - Request point withdrawal
   - Enter amount (must meet minimum)
   - Admin approval process
   - Payment confirmation

### For Admins
1. **Verify Deposits**
   - Review pending deposits
   - Approve/reject with notes
   - Update deposit information
   - Auto-calculate points

2. **Manage Members**
   - View all members
   - Edit member details
   - Create new members
   - Bulk import members

3. **Import Data**
   - Bulk upload deposits (CSV)
   - Bulk upload members (CSV)
   - Adjust points in bulk
   - Download templates

4. **View Reports**
   - Deposit statistics
   - Member statistics
   - Reward claims
   - Financial summary

### For Super Admins
1. **Organizations**
   - Create BUMDES organizations
   - Manage organization details
   - Activate/deactivate orgs

2. **Admin Users**
   - Create admin accounts
   - Manage admin permissions
   - Reset admin passwords

3. **System Settings**
   - Configure pointsPerKg
   - Set exchange rate
   - Set minimum claim amount
   - Adjust timeouts

4. **Audit Logs**
   - View all system actions
   - Track changes
   - Monitor security events

---

## File Organization

### Key Files to Review

**Database & ORM**
- `/db/schema.ts` - 14 tables with all relationships
- `/db/index.ts` - Database client setup
- `drizzle.config.ts` - ORM configuration

**Authentication**
- `/auth/config.ts` - NextAuth configuration
- `/auth/queries.ts` - Auth database queries
- `/middleware.ts` - Route protection

**Utilities**
- `/lib/security.ts` - Password hashing, encryption
- `/lib/validations.ts` - Zod schemas for all inputs
- `/lib/audit.ts` - Audit logging
- `/lib/csv-parser.ts` - CSV import handling

**API Endpoints**
- `/app/api/auth/*` - Login, register, logout
- `/app/api/member/*` - Member operations
- `/app/api/admin/*` - Admin operations
- `/app/api/super-admin/*` - Super admin operations

**Pages & Components**
- `/app/page.tsx` - Landing page
- `/app/login/page.tsx` - Login page
- `/app/register/page.tsx` - Register page
- `/app/app/*/` - Protected pages by role
- `/components/` - Reusable React components

---

## Common Tasks

### Create a New Member
```bash
# Option 1: Self-registration
POST /api/auth/register
{
  "email": "new@member.com",
  "name": "New Member",
  "password": "SecurePass123!"
}

# Option 2: Admin creates manually
POST /api/admin/members/manual
{
  "name": "New Member",
  "email": "new@member.com",
  "phone": "081234567890",
  "address": "Jl. Merdeka No. 123"
}
```

### Submit Waste Deposit
```bash
# Member submits deposit
POST /api/member/deposits
{
  "weight": 5.5,
  "category": "leaves",
  "notes": "Dried singkong leaves"
}

# Admin verifies
PATCH /api/admin/deposits/:id/verify
{
  "status": "approved"
}
```

### Import Members from CSV
```bash
# 1. Prepare CSV file (template available via API)
# 2. Upload file
POST /api/admin/members/bulk-import
FormData: file = members.csv

# 3. Review validation report
# 4. Confirm import
# 5. Members created with temp passwords
```

### Claim Reward
```bash
# Member requests reward
POST /api/member/rewards
{
  "pointsRequested": 500,
  "bankAccount": "1234567890",
  "notes": "Request withdrawal"
}

# Admin approves
PATCH /api/admin/rewards/:id/approve
{
  "status": "approved"
}
```

---

## Testing the API

### Test Member Registration
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "name": "Test User",
    "password": "TestPass123!"
  }'
```

### Test Admin Deposit Verification
```bash
# First, login as admin to get session token
curl -X POST http://localhost:3000/api/auth/[...nextauth]/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "AdminSecure123!"
  }'

# Then verify deposit
curl -X PATCH http://localhost:3000/api/admin/deposits/DEPOSIT_ID/verify \
  -H "Content-Type: application/json" \
  -d '{"status": "approved"}'
```

### Test Bulk Import
```bash
curl -X POST http://localhost:3000/api/admin/members/bulk-import \
  -F "file=@members.csv"
```

---

## Database Maintenance

### Backup Database
```bash
pg_dump organic_waste_system > backup_$(date +%Y%m%d).sql
```

### Restore Database
```bash
psql organic_waste_system < backup_20260523.sql
```

### View Audit Logs
```bash
pnpm drizzle-kit studio
# Navigate to audit_logs table
```

### Check User Sessions
```bash
SELECT * FROM sessions WHERE "userId" = 'USER_ID';
```

---

## Troubleshooting

### "Database connection failed"
- Verify DATABASE_URL in .env.local
- Check PostgreSQL is running
- Confirm database exists

### "Unauthorized" error (401/403)
- Check session/JWT token validity
- Verify user role has permission
- Clear browser cookies and re-login

### CSV Import fails
- Verify CSV format matches template
- Check file encoding (UTF-8)
- Review error report for specific row issues
- Ensure all required columns present

### Points not calculated
- Verify pointsPerKg setting in system_settings
- Check member account status is 'active'
- Review points_transactions table for audit trail

---

## Performance Tips

### Database Optimization
- Indexes created on: email, phone, memberId
- Use pagination for large result sets
- Connection pooling enabled via Drizzle

### Code Optimization
- Component code-splitting (Next.js automatic)
- CSS optimization (Tailwind purge enabled)
- Image optimization (Next.js Image component)

### Monitoring
- Enable database query logs
- Monitor API response times
- Track failed login attempts
- Review audit logs regularly

---

## Security Best Practices

### Always
- Keep dependencies updated: `pnpm update`
- Review audit logs regularly
- Use strong admin passwords
- Enable 2FA when available
- Backup database regularly

### Never
- Share super admin credentials
- Expose DATABASE_URL in code
- Send passwords in plain text
- Disable input validation
- Skip audit logging

---

## Production Deployment

### Pre-Deployment
1. Run all tests: `pnpm test` (when available)
2. Security audit: Check dependencies for vulnerabilities
3. Performance test: Load testing with sample data
4. Backup production database

### Deployment
1. Set production environment variables
2. Run database migrations
3. Build: `pnpm build`
4. Deploy to hosting (Vercel recommended)
5. Verify all endpoints working
6. Monitor error logs

### Post-Deployment
1. Test critical workflows
2. Monitor performance metrics
3. Set up automated backups
4. Configure SSL/TLS
5. Set up email notifications

---

## Scaling Considerations

### Database
- Connection pooling limits
- Query optimization for large datasets
- Archive old audit logs

### Application
- Implement caching layer
- Load balancing for multiple instances
- CDN for static assets

### Infrastructure
- Vertical scaling (bigger server)
- Horizontal scaling (multiple servers)
- Database replication

---

## Documentation Files

| File | Purpose |
|------|---------|
| ARCHITECTURE.md | Complete system architecture |
| PROJECT_SUMMARY.md | Project overview |
| IMPLEMENTATION_DOCS.md | Phase 1-2 details |
| MEMBER_PORTAL_DOCS.md | Phase 3 details |
| ADMIN_DASHBOARD_DOCS.md | Phase 4 details |
| BULK_IMPORT_DOCS.md | Phase 5 details |
| SUPER_ADMIN_DOCS.md | Phase 6 details |
| This file | Getting started guide |

---

## Next Steps

1. **Setup Database** - Configure PostgreSQL and run migrations
2. **Create First Admin** - Use super admin to create organization + admin
3. **Test Workflows** - Submit deposits, verify, claim rewards
4. **Configure Settings** - Adjust pointsPerKg, exchange rates
5. **Monitor Logs** - Check audit logs for all activities
6. **Prepare Phase 7** - Plan rate limiting & 2FA implementation

---

## Support

For detailed feature documentation:
- Member features → See MEMBER_PORTAL_DOCS.md
- Admin features → See ADMIN_DASHBOARD_DOCS.md  
- Bulk operations → See BULK_IMPORT_DOCS.md
- System admin → See SUPER_ADMIN_DOCS.md
- Architecture → See ARCHITECTURE.md

---

**Status**: 45% Complete (6/8 phases)
**Next Phase**: Phase 7 - Rate Limiting & Security Hardening
**Estimated Completion**: 2-3 weeks from this baseline
