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
};

export function MemberDepositsListPage() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/member/deposits')
      .then((r) => r.json())
      .then((d) => setDeposits(d.deposits || []))
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
      <div className="flex justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">Riwayat Setor</h1>
        <Link href="/app/member/deposits/new">
          <Button>Setor Baru</Button>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{deposits.length} setor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {deposits.length === 0 ? (
            <p className="text-muted-foreground text-sm">Belum ada setor.</p>
          ) : (
            deposits.map((d) => (
              <div key={d.id} className="border border-border rounded-lg p-3">
                <p className="font-medium">
                  {new Date(d.depositDate).toLocaleDateString('id-ID')} · {Number(d.weightKg)} kg
                </p>
                <p className="text-sm text-muted-foreground">
                  {Number(d.pointsAwarded)} poin · <span className="uppercase">{d.status}</span>
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
