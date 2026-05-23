'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

type Claim = {
  id: string;
  pointsClaimed: string;
  amountInRupiah: string;
  status: string;
  requestedAt: string;
};

export function MemberRewardsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [stats, setStats] = useState<{ totalPoints: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    pointsClaimed: '',
    bankAccountNumber: '',
    bankAccountName: '',
    bankName: '',
  });

  const load = () => {
    fetch('/api/member/rewards')
      .then((r) => r.json())
      .then((d) => {
        setClaims(d.claims || []);
        setStats(d.stats);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/member/rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pointsClaimed: parseFloat(form.pointsClaimed),
          bankAccountNumber: form.bankAccountNumber,
          bankAccountName: form.bankAccountName,
          bankName: form.bankName,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal');
      setForm({ pointsClaimed: '', bankAccountNumber: '', bankAccountName: '', bankName: '' });
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setSubmitting(false);
    }
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
      <h1 className="text-2xl font-bold">Tukar Poin</h1>
      <p className="text-muted-foreground">
        Saldo: <strong>{stats?.totalPoints?.toLocaleString() ?? 0}</strong> poin
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Ajukan Pencairan</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4 max-w-md">
            <div>
              <Label>Jumlah Poin</Label>
              <Input
                type="number"
                min="1"
                required
                value={form.pointsClaimed}
                onChange={(e) => setForm({ ...form, pointsClaimed: e.target.value })}
              />
            </div>
            <div>
              <Label>No. Rekening</Label>
              <Input
                required
                value={form.bankAccountNumber}
                onChange={(e) => setForm({ ...form, bankAccountNumber: e.target.value })}
              />
            </div>
            <div>
              <Label>Nama Rekening</Label>
              <Input
                required
                value={form.bankAccountName}
                onChange={(e) => setForm({ ...form, bankAccountName: e.target.value })}
              />
            </div>
            <div>
              <Label>Bank</Label>
              <Input
                required
                value={form.bankName}
                onChange={(e) => setForm({ ...form, bankName: e.target.value })}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Mengirim...' : 'Ajukan'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Klaim</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {claims.map((c) => (
            <div key={c.id} className="border border-border rounded-lg p-3 text-sm">
              {Number(c.pointsClaimed).toLocaleString()} poin → Rp{' '}
              {Number(c.amountInRupiah).toLocaleString('id-ID')} ({c.status})
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
