'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AdminReportsPage() {
  const [stats, setStats] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then((r) => r.json())
      .then((d) => setStats(d.stats));
  }, []);

  if (!stats) return <p className="text-muted-foreground">Memuat laporan...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Laporan</h1>
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Setor</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Total setor: {stats.totalDeposits}</p>
            <p>Total berat terverifikasi: {stats.totalWeight} kg</p>
            <p>Menunggu verifikasi: {stats.pendingDeposits}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Poin & Reward</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Poin beredar: {stats.totalPointsCirculation?.toLocaleString()}</p>
            <p>Klaim pending: {stats.pendingClaims}</p>
            <p>Member aktif: {stats.activeMembers}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
