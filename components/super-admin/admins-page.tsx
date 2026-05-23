'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

type Admin = {
  id: string;
  email: string;
  firstName: string;
  lastName: string | null;
  bumdesId: string | null;
};

type Org = { id: string; name: string };

export function SuperAdminAdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: 'Password123!',
    bumdesId: '',
  });

  const load = async () => {
    const [aRes, oRes] = await Promise.all([
      fetch('/api/super-admin/admins'),
      fetch('/api/super-admin/organizations'),
    ]);
    const aData = await aRes.json();
    const oData = await oRes.json();
    setAdmins(aData.admins || []);
    setOrgs(oData.organizations || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/super-admin/admins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, role: 'admin_bumdes' }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || 'Gagal');
      return;
    }
    setForm({ email: '', firstName: '', lastName: '', password: 'Password123!', bumdesId: '' });
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
      <h1 className="text-2xl font-bold">Admin BUMDES</h1>

      <Card>
        <CardHeader>
          <CardTitle>Buat Admin</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={create} className="space-y-4 max-w-md">
            <div>
              <Label>Organisasi</Label>
              <select
                required
                className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                value={form.bumdesId}
                onChange={(e) => setForm({ ...form, bumdesId: e.target.value })}
              >
                <option value="">Pilih</option>
                {orgs.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Email</Label>
              <Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <Label>Nama Depan</Label>
              <Input required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
            </div>
            <div>
              <Label>Password</Label>
              <Input required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <Button type="submit">Buat Admin</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{admins.length} admin</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {admins.map((a) => (
            <div key={a.id} className="border border-border rounded-lg p-3">
              <p className="font-medium">{a.firstName} {a.lastName}</p>
              <p className="text-sm text-muted-foreground">{a.email}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
