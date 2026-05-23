'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Category = { id: string; name: string };

export function MemberDepositNewPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    depositDate: new Date().toISOString().split('T')[0],
    weightKg: '',
    categoryId: '',
    notes: '',
  });

  useEffect(() => {
    fetch('/api/member/deposits')
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/member/deposits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          depositDate: form.depositDate,
          weightKg: parseFloat(form.weightKg),
          categoryId: form.categoryId || undefined,
          notes: form.notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal');
      router.push('/app/member/deposits');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg">
      <Link href="/app/member/deposits">
        <Button variant="outline" size="sm">← Kembali</Button>
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Setor Sampah Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
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
                max="100"
                required
                value={form.weightKg}
                onChange={(e) => setForm({ ...form, weightKg: e.target.value })}
              />
            </div>
            {categories.length > 0 && (
              <div>
                <Label>Kategori</Label>
                <select
                  className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                >
                  <option value="">Pilih kategori</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <Label>Catatan</Label>
              <Input
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Mengirim...' : 'Kirim Setor'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
