'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export function MemberProfilePage() {
  const [member, setMember] = useState<{
    fullName: string;
    phone: string | null;
    address: string | null;
    memberNumber: string | null;
    totalPoints: string;
    organization?: { name: string };
    user?: { email: string };
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/member/profile')
      .then((r) => r.json())
      .then((d) => setMember(d.member))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!member) {
    return <p className="text-destructive">Profil tidak ditemukan.</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Profil Saya</h1>
      <Card>
        <CardHeader>
          <CardTitle>{member.fullName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>Email: {member.user?.email}</p>
          <p>No. Member: {member.memberNumber || '-'}</p>
          <p>Organisasi: {member.organization?.name || '-'}</p>
          <p>Telepon: {member.phone || '-'}</p>
          <p>Alamat: {member.address || '-'}</p>
          <p className="font-semibold text-primary pt-2">
            Total poin: {Number(member.totalPoints).toLocaleString()}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
