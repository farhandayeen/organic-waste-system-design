import Papa from 'papaparse';
import { z } from 'zod';

/**
 * CSV Parser for deposits
 */
export const depositImportSchema = z.object({
  tanggalSetor: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format. Use YYYY-MM-DD',
  }),
  memberId: z.string().min(1, 'Member ID required'),
  beratKg: z.coerce.number().positive('Weight must be positive'),
  kategori: z.string().optional(),
  catatan: z.string().optional(),
});

/**
 * CSV Parser for members
 */
export const memberImportSchema = z.object({
  nama: z.string().min(1, 'Name required'),
  email: z.string().email('Invalid email'),
  noHP: z.string().min(10, 'Phone number must be at least 10 digits'),
  alamat: z.string().min(5, 'Address required'),
  kelurahan: z.string().optional(),
  rt: z.string().optional(),
  rw: z.string().optional(),
});

/**
 * CSV Parser for points adjustment
 */
export const pointsAdjustmentSchema = z.object({
  memberId: z.string().min(1, 'Member ID required'),
  perubahan: z.coerce.number().int('Points must be integer'),
  alasan: z.string().min(1, 'Reason required'),
});

/**
 * Parse CSV file and validate records
 */
export function parseCSV<T>(
  csvContent: string,
  schema: z.ZodSchema
): {
  valid: (T & { _rowIndex: number })[];
  errors: { rowIndex: number; errors: string[] }[];
} {
  const records = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
  });

  const valid: (T & { _rowIndex: number })[] = [];
  const errors: { rowIndex: number; errors: string[] }[] = [];

  records.data.forEach((record: any, index: number) => {
    const result = schema.safeParse(record);

    if (result.success) {
      valid.push({ ...result.data, _rowIndex: index + 2 } as T & {
        _rowIndex: number;
      });
    } else {
      errors.push({
        rowIndex: index + 2,
        errors: result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
      });
    }
  });

  return { valid, errors };
}

/**
 * Generate CSV template for deposits
 */
export function generateDepositTemplate(): string {
  const headers = ['tanggalSetor', 'memberId', 'beratKg', 'kategori', 'catatan'];
  const sampleRow = [
    '2026-05-23',
    'MEM-001',
    '5.5',
    'Daun-Daun',
    'Daun singkong kering',
  ];

  return Papa.unparse({
    fields: headers,
    data: [sampleRow],
  });
}

/**
 * Generate CSV template for members
 */
export function generateMemberTemplate(): string {
  const headers = ['nama', 'email', 'noHP', 'alamat', 'kelurahan', 'rt', 'rw'];
  const sampleRow = [
    'Budi Santoso',
    'budi@example.com',
    '081234567890',
    'Jl. Merdeka No. 123',
    'Kelurahan Tebet',
    '01',
    '02',
  ];

  return Papa.unparse({
    fields: headers,
    data: [sampleRow],
  });
}

/**
 * Generate CSV template for points adjustment
 */
export function generatePointsTemplate(): string {
  const headers = ['memberId', 'perubahan', 'alasan'];
  const sampleRow = ['MEM-001', '50', 'Bonus referral'];

  return Papa.unparse({
    fields: headers,
    data: [sampleRow],
  });
}

/**
 * Format import results for display
 */
export function formatImportResults(
  valid: number,
  errors: { rowIndex: number; errors: string[] }[]
) {
  return {
    successful: valid,
    failed: errors.length,
    total: valid + errors.length,
    successRate: `${Math.round((valid / (valid + errors.length)) * 100)}%`,
    errors: errors.slice(0, 10), // Show first 10 errors
    hasMore: errors.length > 10,
  };
}
