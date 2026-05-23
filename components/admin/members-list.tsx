'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

type Member = {
  id: string;
  fullName: string;
  memberNumber: string | null;
  phone: string | null;
  totalPoints: string;
  status: string;
};

export function MembersListPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/members')
      .then((r) => r.json())
      .then((d) => setMembers(d.members || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between gap-4">
        <h1 className="text-2xl font-bold">Daftar Member</h1>
        <div className="flex gap-2">
          <Link href="/app/admin/members/create">
            <Button>Buat Member</Button>
          </Link>
          <Link href="/app/admin/members/import">
            <Button variant="secondary">Import CSV</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{members.length} member</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {members.map((m) => (
            <div key={m.id} className="border border-border rounded-lg p-3 flex justify-between gap-2">
              <div>
                <p className="font-medium">{m.fullName}</p>
                <p className="text-xs text-muted-foreground font-mono">{m.id}</p>
                <p className="text-sm text-muted-foreground">
                  {m.memberNumber || '-'} · {Number(m.totalPoints).toLocaleString()} poin
                </p>
              </div>
              <span className="text-xs uppercase h-fit">{m.status}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
