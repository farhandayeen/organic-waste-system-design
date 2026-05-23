# Bulk Import & Adjustment Features - Phase 5

## Overview
Phase 5 implements comprehensive bulk import capabilities for deposits, members, and points adjustments. All operations include validation, error reporting, and audit logging.

## Features Implemented

### 1. Manual Deposit Input
- **Endpoint**: `POST /api/admin/deposits/manual`
- **Form**: `components/admin/manual-deposit-form.tsx`
- **Features**:
  - Select member from dropdown
  - Enter deposit date
  - Input weight in kg
  - Select category (organic, leaves, fruits, meat)
  - Add notes
  - Auto-calculate points
  - Create audit log
  - Notify member

**Request Example**:
```json
{
  "memberId": "MEM-001",
  "submittedAt": "2026-05-23",
  "weight": 5.5,
  "category": "leaves",
  "notes": "Daun singkong kering",
  "pointsPerKg": 10
}
```

### 2. Bulk Deposit Import (CSV)
- **Endpoint**: `POST /api/admin/deposits/bulk-import`
- **Component**: `components/admin/csv-import-uploader.tsx`
- **CSV Template Columns**:
  - tanggalSetor (YYYY-MM-DD)
  - memberId (string)
  - beratKg (number)
  - kategori (string, optional)
  - catatan (string, optional)

**Validation**:
- Max file size: 50MB
- Max rows: 10,000
- Date format validation
- Member exists check
- Weight > 0 validation
- Duplicate detection

**Process**:
1. Upload CSV file
2. Parse & validate rows
3. Create job record in `bulk_import_jobs`
4. Return validation report with preview
5. Preview shows first 5 valid records
6. Errors listed with row numbers

### 3. Manual Member Creation
- **Endpoint**: `POST /api/admin/members/manual`
- **Features**:
  - Enter full member details
  - Auto-generate temporary password
  - Create user account with role 'member'
  - Create member profile
  - Send welcome email (placeholder)
  - Generate audit log

**Request Example**:
```json
{
  "name": "Budi Santoso",
  "email": "budi@example.com",
  "phone": "081234567890",
  "address": "Jl. Merdeka No. 123",
  "village": "Kelurahan Tebet",
  "rt": "01",
  "rw": "02"
}
```

### 4. Bulk Member Import (CSV)
- **Endpoint**: `POST /api/admin/members/bulk-import`
- **CSV Template Columns**:
  - nama (required, min 3 chars)
  - email (required, valid email)
  - noHP (required, min 10 digits)
  - alamat (required, min 5 chars)
  - kelurahan (optional)
  - rt (optional)
  - rw (optional)

**Process**:
- Validates all rows
- Checks for duplicate emails
- Checks for duplicate phone numbers
- Max 50,000 members per import
- Creates job record
- Returns validation report

### 5. Manual Points Adjustment
- **Endpoint**: `POST /api/admin/points/adjustment`
- **Features**:
  - Select member
  - Enter adjustment amount (can be negative)
  - Select type (bonus, penalty, correction, refund)
  - Provide reason (required for audit)
  - Validate points won't go negative
  - Create audit log

**Request Example**:
```json
{
  "memberId": "MEM-001",
  "adjustment": 50,
  "type": "bonus",
  "reason": "Referral bonus - referred member MEM-002"
}
```

### 6. CSV Templates
Utility functions generate downloadable CSV templates:
- `generateDepositTemplate()` - Deposit import template
- `generateMemberTemplate()` - Member import template
- `generatePointsTemplate()` - Points adjustment template

## Security Features

### Input Validation
- Server-side Zod schema validation
- CSV parsing with encoding detection
- File size and row count limits
- Email uniqueness check
- Phone uniqueness check
- Points non-negative validation

### Audit Trail
- Every operation logged in `audit_logs`
- User ID, timestamp, IP address captured
- Changes JSON stored for review
- Action types: manual_deposit, member_import, points_adjustment

### Access Control
- Role check: only `admin_bumdes` can access
- Session verification via NextAuth
- Unauthorized requests rejected

### Rate Limiting (Schema Ready)
- Manual input: 50 entries/minute
- Bulk import: 1 upload/minute
- CSV row limit: 10,000 per file

## API Endpoints

```
POST /api/admin/deposits/manual
- Create single deposit manually
- Auto-verify and create points

POST /api/admin/deposits/bulk-import
- Validate CSV file
- Return validation report
- Create job record

POST /api/admin/members/manual
- Create single member
- Generate temp password
- Return credentials

POST /api/admin/members/bulk-import
- Validate CSV file
- Return validation report
- Create job record

POST /api/admin/points/adjustment
- Adjust member points
- Validate amount
- Create transaction and log
```

## Database Records Created

### Manual Operations
- `waste_deposits` - New deposit record
- `points_transactions` - Points created
- `users` - New user account (for members)
- `members` - New member profile
- `audit_logs` - Operation log

### Bulk Import Jobs
- `bulk_import_jobs` - Job tracking
- Stores validation report
- Tracks success/failure counts
- Status: 'validation_complete'

## UI Components

### ManualDepositForm
- Form to input single deposit
- Member selection
- Date picker
- Weight input
- Category dropdown
- Notes textarea
- Error display
- Loading state

### CSVImportUploader
- Drag-drop file input
- File validation
- Upload to API
- Validation report display
- Success/failure metrics
- Error listing
- Preview of data

## Next Steps (Phase 6)
- Execution of bulk imports after validation
- Confirmation dialog before processing
- Progress tracking
- Email notifications to members
- Rollback capability

## Error Handling

Common errors and responses:
- 401: Unauthorized (not admin)
- 400: Invalid input (validation failed)
- 400: File too large (>50MB)
- 400: Too many rows (>10,000)
- 400: Invalid email format
- 400: Member not found
- 400: Points would go negative

All errors include descriptive messages for troubleshooting.
