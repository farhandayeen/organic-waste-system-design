'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Leaf, TrendingUp, Award, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface MemberStats {
  totalPoints: number;
  totalDeposits: number;
  totalWithdrawals: number;
  verifiedDeposits: number;
  pendingDeposits: number;
  lastDepositDate: string | null;
  membershipDate: string;
}

export function MemberDashboard() {
  const [stats, setStats] = useState<MemberStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/member/rewards');
        if (!response.ok) throw new Error('Failed to fetch stats');
        const data = await response.json();
        setStats(data.stats);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Leaf className="w-8 h-8 text-primary" />
          Dashboard Sampah Organik
        </h1>
        <p className="text-muted-foreground mt-1">
          Kelola setor sampah dan tukar poin Anda dengan reward
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-4">
        {/* Total Points */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Poin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-foreground">
                {stats?.totalPoints.toLocaleString()}
              </div>
              <Award className="w-8 h-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>

        {/* Total Deposits */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Setor (kg)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-foreground">
                {stats?.totalDeposits.toLocaleString()}
              </div>
              <TrendingUp className="w-8 h-8 text-secondary/50" />
            </div>
          </CardContent>
        </Card>

        {/* Verified Deposits */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Setor Terverifikasi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {stats?.verifiedDeposits}
            </div>
          </CardContent>
        </Card>

        {/* Pending Deposits */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Setor Menunggu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-foreground">
                {stats?.pendingDeposits}
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link href="/app/member/deposits/new">
          <Button className="w-full bg-primary hover:bg-primary/90 h-24 text-lg">
            <Leaf className="mr-2 w-5 h-5" />
            Setor Sampah Baru
          </Button>
        </Link>

        <Link href="/app/member/rewards">
          <Button variant="outline" className="w-full h-24 text-lg">
            <Award className="mr-2 w-5 h-5" />
            Tukar Poin
          </Button>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Last Deposit */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Setor Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.lastDepositDate ? (
              <div className="space-y-2">
                <p className="text-2xl font-bold text-primary">
                  {new Date(stats.lastDepositDate).toLocaleDateString('id-ID')}
                </p>
                <Link href="/app/member/deposits">
                  <Button variant="link" className="text-primary">
                    Lihat Semua Setor →
                  </Button>
                </Link>
              </div>
            ) : (
              <p className="text-muted-foreground">
                Belum ada setor. Mulai setor sampah organik Anda sekarang!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Membership */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Anggota Sejak</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-secondary">
              {new Date(stats?.membershipDate || '').toLocaleDateString('id-ID')}
            </p>
            <Link href="/app/member/profile">
              <Button variant="link" className="text-primary">
                Lihat Profil Lengkap →
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
