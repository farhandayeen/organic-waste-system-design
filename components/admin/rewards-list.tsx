'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

type Claim = {
  id: string;
  pointsClaimed: string;
  amountInRupiah: string;
  status: string;
  memberId: string;
  requestedAt: string;
};

export function RewardsListPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch('/api/admin/rewards')
      .then((r) => r.json())
      .then((d) => setClaims(d.claims || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const update = async (claimId: string, action: 'approve' | 'reject') => {
    const res = await fetch('/api/admin/rewards', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ claimId, action }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || 'Gagal');
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

  const pending = claims.filter((c) => c.status === 'pending');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Pencairan Reward</h1>
      <Card>
        <CardHeader>
          <CardTitle>{pending.length} menunggu persetujuan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {claims.length === 0 ? (
            <p className="text-muted-foreground text-sm">Belum ada klaim.</p>
          ) : (
            claims.map((c) => (
              <div
                key={c.id}
                className="border border-border rounded-lg p-4 flex flex-wrap justify-between gap-3"
              >
                <div>
                  <p className="font-medium">{Number(c.pointsClaimed).toLocaleString()} poin</p>
                  <p className="text-sm text-muted-foreground">
                    Rp {Number(c.amountInRupiah).toLocaleString('id-ID')} · {c.status}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(c.requestedAt).toLocaleString('id-ID')}
                  </p>
                </div>
                {c.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => update(c.id, 'approve')}>
                      Setujui
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => update(c.id, 'reject')}>
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
