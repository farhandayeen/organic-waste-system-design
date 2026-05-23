# Super Admin Panel & Organization Management - Phase 6

## Overview
Phase 6 implements the Super Admin Panel for managing multiple BUMDES organizations, admin user accounts, and global system settings. This enables multi-tenancy and centralized control.

## Features Implemented

### 1. Organization Management API
**Endpoint**: `GET/POST/PATCH /api/super-admin/organizations`

**Features**:
- List all organizations
- Create new BUMDES organization
- Update organization details
- Store contact information
- Track organization status (active/inactive)

**Organization Fields**:
- `id` - Unique identifier
- `name` - Organization name (unique)
- `address` - Physical address
- `contactPerson` - Primary contact name
- `email` - Organization email
- `phone` - Organization phone
- `bankAccount` - For reward payments
- `status` - active/inactive
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

**Request Example**:
```json
{
  "name": "BUMDES Tebet Jaya",
  "address": "Jl. Merdeka No. 123, Jakarta",
  "contactPerson": "Ibu Siti",
  "email": "bumdes@tebet.id",
  "phone": "02112345678",
  "bankAccount": "1234567890",
  "status": "active"
}
```

**API Responses**:
- `GET /api/super-admin/organizations` - Returns array of all organizations
- `POST /api/super-admin/organizations` - Creates new organization, returns created org with ID
- `PATCH /api/super-admin/organizations/:id` - Updates organization, returns updated org

### 2. Admin User Management API
**Endpoint**: `GET/POST /api/super-admin/admins`

**Features**:
- List all admin users
- Create new admin account for BUMDES
- Auto-generate temporary password
- Set initial 2FA requirement
- Force password change on first login
- Audit all admin creations

**Request Example**:
```json
{
  "email": "admin@bumdes-tebet.id",
  "fullName": "Ahmad Wijaya",
  "phone": "081234567890"
}
```

**Response**:
```json
{
  "success": true,
  "admin": {
    "id": "uuid",
    "email": "admin@bumdes-tebet.id",
    "role": "admin_bumdes"
  },
  "tempPassword": "Ab3dEf9kL2mN",
  "message": "Admin created. Share temporary password securely."
}
```

**Admin User Fields**:
- `id` - UUID
- `email` - Unique email
- `role` - "admin_bumdes"
- `status` - active/suspended
- `requirePasswordChange` - Force change on login
- `createdAt` - Timestamp
- `lastLogin` - Last login timestamp

### 3. Global System Settings API
**Endpoint**: `GET/PATCH /api/super-admin/settings`

**Features**:
- Get all global settings
- Update system-wide configuration
- Version history support
- Affects all organizations

**Configurable Settings**:
- `pointsPerKg` - Default points per kg (default: 10)
- `exchangeRate` - Points to Rupiah conversion (e.g., 100 poin = Rp 50k)
- `minimumClaimAmount` - Minimum poin to claim (default: 500)
- `maxDepositPerSubmission` - Max kg per deposit (default: 100)
- `sessionTimeout` - Session duration in minutes (default: 30)
- `passwordMinLength` - Min password length (default: 12)
- `require2FA` - Force 2FA for admins (default: true)
- `systemAnnouncement` - Banner text for all users

**Request Example**:
```json
{
  "pointsPerKg": 12,
  "exchangeRate": 60,
  "minimumClaimAmount": 500,
  "sessionTimeout": 45
}
```

**Response**:
```json
{
  "success": true,
  "settings": {
    "pointsPerKg": 12,
    "exchangeRate": 60,
    "minimumClaimAmount": 500,
    "sessionTimeout": 45
  }
}
```

### 4. Super Admin Dashboard
**Component**: `components/super-admin/dashboard.tsx`
**Page**: `/app/super-admin/dashboard`

**Dashboard Features**:
- Stats cards showing:
  - Total organizations
  - Total admin users
  - Total members (all orgs)
  - Total deposits (all orgs)
- Tabbed interface for:
  - Organizations management
  - Admin user management
  - Global settings
  - Audit logs

**Dashboard Tabs**:
1. **Organizations** - View/create/manage BUMDES orgs
2. **Admin Users** - View/create admin accounts
3. **Global Settings** - Configure system-wide settings
4. **Audit Logs** - View all system actions

## Database Schema Updates

### Organizations Table
```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  address TEXT,
  contactPerson VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  bankAccount VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active',
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

### Admin Users Relation
- Admin users have `role = 'admin_bumdes'`
- Can be assigned to multiple organizations (many-to-many via org_admins junction table - future)
- Each admin manages one or more BUMDES

## Security Features

### Access Control
- Only `super_admin` role can access these endpoints
- Session verification required
- IP address logging

### Audit Trail
- Every organization creation/update logged
- Every admin creation logged
- Every settings change logged
- Logs include: user ID, action, timestamp, IP, changes JSON

### Password Security
- Admin temporary passwords: 12-char UUID
- Enforced on first login
- Password change required
- Hashed with bcryptjs (12 rounds)

### 2FA Enforcement
- Can be configured globally via settings
- Future: 2FA setup required for admins on first login

## API Endpoints Summary

```
GET  /api/super-admin/organizations
POST /api/super-admin/organizations
PATCH /api/super-admin/organizations/:id

GET  /api/super-admin/admins
POST /api/super-admin/admins

GET  /api/super-admin/settings
PATCH /api/super-admin/settings
```

## Error Handling

Common errors:
- 401: Unauthorized (not super_admin)
- 400: Invalid input (missing fields, invalid format)
- 400: Duplicate name (organization)
- 400: Duplicate email (user)
- 404: Resource not found
- 500: Server error

## Workflow Examples

### Creating a New BUMDES Organization
1. Super Admin goes to /app/super-admin/dashboard
2. Clicks "Create Organization"
3. Fills in organization details
4. System creates organization record
5. Audit log records the action

### Creating a New Admin User
1. Super Admin clicks "Create Admin"
2. Enters admin email and name
3. System generates temporary password
4. Admin receives temp password via secure channel
5. Admin logs in and sets new password
6. Action logged in audit trail

### Updating Global Settings
1. Super Admin goes to Settings tab
2. Updates pointsPerKg, exchange rate, etc
3. Clicks "Save Settings"
4. Changes applied system-wide
5. All organizations affected
6. Action logged with previous/new values

## Future Enhancements (Phase 7)

- Bulk operations (activate/deactivate members across orgs)
- Data integrity checks and cleanup
- Performance analytics
- Email notifications
- 2FA mandatory setup
- Rate limiting enforcement
- Admin activity monitoring
- Export audit logs

## Testing Endpoints

### Create Organization
```bash
curl -X POST http://localhost:3000/api/super-admin/organizations \
  -H "Content-Type: application/json" \
  -d '{
    "name": "BUMDES Test",
    "address": "Test Address",
    "contactPerson": "John Doe",
    "email": "test@bumdes.id"
  }'
```

### Create Admin
```bash
curl -X POST http://localhost:3000/api/super-admin/admins \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.id",
    "fullName": "Admin Test"
  }'
```

### Update Settings
```bash
curl -X PATCH http://localhost:3000/api/super-admin/settings \
  -H "Content-Type: application/json" \
  -d '{
    "pointsPerKg": 15,
    "exchangeRate": 70
  }'
```

## Notes

- All timestamps use ISO 8601 format
- All IDs are UUIDs
- Passwords are hashed server-side only
- Temporary passwords should be shared securely (not via email)
- Settings changes take effect immediately
- Rate limiting will be enforced in Phase 7
