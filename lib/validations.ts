import { z } from 'zod';

// Auth Schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  twoFactorCode: z.string().optional(),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letters')
    .regex(/[a-z]/, 'Password must contain lowercase letters')
    .regex(/[0-9]/, 'Password must contain numbers')
    .regex(/[!@#$%^&*]/, 'Password must contain special characters'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().optional(),
  phone: z.string().regex(/^(\+62|0)[0-9]{9,12}$/, 'Invalid Indonesian phone number'),
  bumdesId: z.string().uuid('Invalid organization'),
  alamat: z.string().min(5, 'Address is required'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letters')
    .regex(/[a-z]/, 'Password must contain lowercase letters')
    .regex(/[0-9]/, 'Password must contain numbers')
    .regex(/[!@#$%^&*]/, 'Password must contain special characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Member Schemas
export const memberCreateSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(100),
  lastName: z.string().optional().default(''),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^(\+62|0)[0-9]{9,12}$/, 'Invalid Indonesian phone number'),
  alamat: z.string().min(5, 'Address is required'),
  kelurahan: z.string().optional().default(''),
  rt: z.string().optional().default(''),
  rw: z.string().optional().default(''),
});

export const memberUpdateSchema = memberCreateSchema.partial();

export const memberBulkImportSchema = z.array(
  z.object({
    firstName: z.string(),
    lastName: z.string().optional(),
    email: z.string().email(),
    phone: z.string(),
    alamat: z.string(),
    kelurahan: z.string().optional(),
    rt: z.string().optional(),
    rw: z.string().optional(),
  })
);

// Waste Deposit Schemas
export const wasteDepositCreateSchema = z.object({
  memberId: z.string().uuid('Invalid member ID'),
  depositDate: z.coerce.date(),
  weightKg: z.coerce.number().positive('Weight must be greater than 0').max(100, 'Weight cannot exceed 100kg'),
  categoryId: z.string().uuid('Invalid category ID').optional(),
  photoUrl: z.string().optional(),
  notes: z.string().optional().default(''),
});

export const memberWasteDepositCreateSchema = wasteDepositCreateSchema.omit({
  memberId: true,
});

export const wasteDepositManualInputSchema = z.object({
  memberId: z.string().uuid('Invalid member ID'),
  depositDate: z.coerce.date(),
  weightKg: z.coerce.number().positive('Weight must be greater than 0').max(100, 'Weight cannot exceed 100kg'),
  categoryId: z.string().uuid('Invalid category ID').optional(),
  notes: z.string().optional().default(''),
});

export const wasteDepositBulkImportSchema = z.array(
  z.object({
    memberEmail: z.string().email().or(z.string().uuid()),
    depositDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
    weightKg: z.coerce.number().positive(),
    category: z.string().optional(),
    notes: z.string().optional(),
  })
);

// Points Adjustment Schemas
export const pointsAdjustmentSchema = z.object({
  memberId: z.string().uuid('Invalid member ID'),
  type: z.enum(['add_bonus', 'deduct_penalty', 'correction', 'refund'], {
    errorMap: () => ({ message: 'Invalid adjustment type' }),
  }),
  amount: z.coerce.number().positive('Amount must be greater than 0').max(100000, 'Amount too large'),
  reason: z.string().min(5, 'Reason must be at least 5 characters'),
  effectiveDate: z.coerce.date().optional(),
});

export const pointsAdjustmentBulkSchema = z.array(
  z.object({
    memberEmail: z.string().email().or(z.string().uuid()),
    type: z.enum(['add_bonus', 'deduct_penalty', 'correction', 'refund']),
    amount: z.coerce.number().positive(),
    reason: z.string(),
  })
);

// Reward Claim Schemas
export const rewardClaimSchema = z.object({
  pointsClaimed: z.coerce.number().positive('Points must be greater than 0'),
  bankAccountNumber: z.string().min(8, 'Bank account number is required'),
  bankAccountName: z.string().min(2, 'Bank account name is required'),
  bankName: z.string().min(2, 'Bank name is required'),
});

export const rewardClaimApprovalSchema = z.object({
  status: z.enum(['approved', 'rejected'], {
    errorMap: () => ({ message: 'Invalid status' }),
  }),
  approvalNotes: z.string().optional(),
  rejectionReason: z.string().optional(),
});

// Admin Schemas
export const adminCreateSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  bumdesId: z.string().uuid('Invalid BUMDES ID'),
  roleLevel: z.enum(['full_access', 'limited', 'viewer'], {
    errorMap: () => ({ message: 'Invalid role level' }),
  }),
  forcePasswordChange: z.boolean().optional().default(true),
});

// Organization Schemas
export const organizationCreateSchema = z.object({
  name: z.string().min(3, 'Organization name must be at least 3 characters').max(255),
  address: z.string().optional(),
  kelurahan: z.string().optional(),
  contactPerson: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  bankAccountName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankName: z.string().optional(),
});

export const organizationUpdateSchema = organizationCreateSchema.partial();

// System Settings Schemas
export const systemSettingsSchema = z.object({
  pointsPerKg: z.coerce.number().positive('Points per kg must be positive'),
  exchangeRate: z.coerce.number().positive('Exchange rate must be positive'),
  minimumClaimAmount: z.coerce.number().positive('Minimum claim must be positive'),
  maxDepositPerSubmission: z.coerce.number().positive(),
  sessionTimeoutMinutes: z.coerce.number().positive(),
  passwordMinLength: z.coerce.number().min(8).max(64),
  passwordRequireUppercase: z.boolean().optional(),
  passwordRequireLowercase: z.boolean().optional(),
  passwordRequireNumbers: z.boolean().optional(),
  passwordRequireSpecialChars: z.boolean().optional(),
  systemAnnouncement: z.string().optional(),
});

// Type exports for frontend use
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type MemberCreate = z.infer<typeof memberCreateSchema>;
export type WasteDepositCreate = z.infer<typeof wasteDepositCreateSchema>;
export type PointsAdjustment = z.infer<typeof pointsAdjustmentSchema>;
export type RewardClaim = z.infer<typeof rewardClaimSchema>;
export type AdminCreate = z.infer<typeof adminCreateSchema>;
export type OrganizationCreate = z.infer<typeof organizationCreateSchema>;
export type SystemSettings = z.infer<typeof systemSettingsSchema>;
