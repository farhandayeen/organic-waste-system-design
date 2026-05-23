'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type MemberOption = { id: string; fullName: string; memberNumber: string | null };

export function ManualDepositPage() {
  const router = useRouter();
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    memberId: '',
    depositDate: new Date().toISOString().split('T')[0],
    weightKg: '',
    notes: '',
  });

  useEffect(() => {
    fetch('/api/admin/members')
      .then((r) => r.json())
      .then((d) => setMembers(d.members || []));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/deposits/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: form.memberId,
          depositDate: form.depositDate,
          weightKg: parseFloat(form.weightKg),
          notes: form.notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan');
      router.push('/app/admin/deposits');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg">
      <div className="flex items-center gap-4">
        <Link href="/app/admin/deposits">
          <Button variant="outline" size="sm">← Kembali</Button>
        </Link>
        <h1 className="text-2xl font-bold">Input Manual Setor</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Setor</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label>Member</Label>
              <select
                required
                className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                value={form.memberId}
                onChange={(e) => setForm({ ...form, memberId: e.target.value })}
              >
                <option value="">Pilih member</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fullName} {m.memberNumber ? `(${m.memberNumber})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Tanggal</Label>
              <Input
                type="date"
                required
                value={form.depositDate}
                onChange={(e) => setForm({ ...form, depositDate: e.target.value })}
              />
            </div>
            <div>
              <Label>Berat (kg)</Label>
              <Input
                type="number"
                step="0.1"
                min="0.1"
                required
                value={form.weightKg}
                onChange={(e) => setForm({ ...form, weightKg: e.target.value })}
              />
            </div>
            <div>
              <Label>Catatan</Label>
              <Input
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan & Verifikasi'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
