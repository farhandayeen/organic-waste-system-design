'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

type Org = {
  id: string;
  name: string;
  code: string | null;
  email: string | null;
  isActive: boolean;
};

export function OrganizationsPage() {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', code: '', contactEmail: '', contactPhone: '' });

  const load = () => {
    fetch('/api/super-admin/organizations')
      .then((r) => r.json())
      .then((d) => setOrgs(d.organizations || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/super-admin/organizations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm({ name: '', code: '', contactEmail: '', contactPhone: '' });
      load();
    } else {
      const d = await res.json();
      alert(d.error || 'Gagal');
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
      <h1 className="text-2xl font-bold">Organisasi BUMDES</h1>

      <Card>
        <CardHeader>
          <CardTitle>Buat Organisasi</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={create} className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Nama</Label>
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label>Kode</Label>
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
            </div>
            <div>
              <Label>Telepon</Label>
              <Input value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
            </div>
            <Button type="submit" className="md:col-span-2">Simpan</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{orgs.length} organisasi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {orgs.map((o) => (
            <div key={o.id} className="border border-border rounded-lg p-3">
              <p className="font-medium">{o.name}</p>
              <p className="text-xs font-mono text-muted-foreground">{o.id}</p>
              <p className="text-sm text-muted-foreground">
                {o.code || '-'} · {o.email || '-'}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
