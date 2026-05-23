'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

type Deposit = {
  id: string;
  depositDate: string;
  weightKg: string;
  pointsAwarded: string;
  status: string;
  member?: { fullName: string; memberNumber: string | null };
};

export function DepositsListPage({ statusFilter }: { statusFilter?: string }) {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const q = statusFilter ? `?status=${statusFilter}` : '';
      const res = await fetch(`/api/admin/deposits${q}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memuat data');
      setDeposits(data.deposits);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  const verify = async (id: string, status: 'verified' | 'rejected') => {
    const res = await fetch(`/api/admin/deposits/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || 'Gagal memperbarui');
      return;
    }
    load();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Daftar Setor Sampah</h1>
          <p className="text-muted-foreground text-sm">Verifikasi setor dari member</p>
        </div>
        <div className="flex gap-2">
          <Link href="/app/admin/deposits/manual">
            <Button>Input Manual</Button>
          </Link>
          <Link href="/app/admin/deposits/import">
            <Button variant="secondary">Import CSV</Button>
          </Link>
        </div>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <Card>
        <CardHeader>
          <CardTitle>{deposits.length} setor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {deposits.length === 0 ? (
            <p className="text-muted-foreground text-sm">Belum ada data setor.</p>
          ) : (
            deposits.map((d) => (
              <div
                key={d.id}
                className="flex flex-wrap items-center justify-between gap-3 border border-border rounded-lg p-4"
              >
                <div>
                  <p className="font-medium">{d.member?.fullName || 'Member'}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(d.depositDate).toLocaleDateString('id-ID')} · {Number(d.weightKg)} kg ·{' '}
                    {Number(d.pointsAwarded)} poin
                  </p>
                  <span className="text-xs uppercase font-semibold text-primary">{d.status}</span>
                </div>
                {d.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => verify(d.id, 'verified')}>
                      Verifikasi
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => verify(d.id, 'rejected')}>
                      Tolak
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
