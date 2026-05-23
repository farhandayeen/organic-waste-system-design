'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type MemberOption = { id: string; fullName: string };

export function PointsAdjustmentPage() {
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({ memberId: '', amount: '', reason: '' });

  useEffect(() => {
    fetch('/api/admin/members')
      .then((r) => r.json())
      .then((d) => setMembers(d.members || []));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch('/api/admin/points/adjustment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: form.memberId,
          amount: parseFloat(form.amount),
          reason: form.reason,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal');
      setMessage('Poin berhasil disesuaikan');
      setForm({ memberId: '', amount: '', reason: '' });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg">
      <Link href="/app/admin/dashboard">
        <Button variant="outline" size="sm">← Dashboard</Button>
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Adjustment Poin</CardTitle>
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
                    {m.fullName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Jumlah (+/-)</Label>
              <Input
                type="number"
                required
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="100 atau -50"
              />
            </div>
            <div>
              <Label>Alasan</Label>
              <Input
                required
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
              />
            </div>
            {message && <p className="text-sm text-primary">{message}</p>}
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              Simpan
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
