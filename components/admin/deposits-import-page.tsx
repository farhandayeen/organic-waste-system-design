'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CSVImportUploader } from './csv-import-uploader';

export function DepositsImportPage() {
  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center gap-4">
        <Link href="/app/admin/deposits">
          <Button variant="outline" size="sm">← Kembali</Button>
        </Link>
        <h1 className="text-2xl font-bold">Import Setor CSV</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Format CSV</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Header: memberId, weight, category, depositDate
            <br />
            Contoh baris: uuid-member, 5.5, uuid-kategori, 2026-05-23
          </p>
          <CSVImportUploader
            uploadUrl="/api/admin/deposits/bulk-import"
            onSuccess={() => {}}
          />
        </CardContent>
      </Card>
    </div>
  );
}
