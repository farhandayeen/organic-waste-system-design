'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CSVImportUploader } from './csv-import-uploader';

export function MembersImportPage() {
  return (
    <div className="space-y-6 max-w-xl">
      <Link href="/app/admin/members">
        <Button variant="outline" size="sm">← Kembali</Button>
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Import Member CSV</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Format: fullName, phone, address (tanpa header wajib — baris pertama di-skip jika header)
          </p>
          <CSVImportUploader uploadUrl="/api/admin/members/bulk-import" />
        </CardContent>
      </Card>
    </div>
  );
}
