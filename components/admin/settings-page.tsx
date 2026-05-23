'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AdminSettingsPage() {
  const [stats, setStats] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then((r) => r.json())
      .then((d) => setStats(d.stats));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Pengaturan</h1>
      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Organisasi</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>Member aktif: {stats?.activeMembers ?? '-'}</p>
          <p>Rate poin default: 10 poin/kg (atur di database system_settings)</p>
          <p className="text-muted-foreground">
            Untuk mengubah rate poin per organisasi, hubungi super admin atau gunakan Prisma Studio.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
