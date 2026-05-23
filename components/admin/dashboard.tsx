'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Leaf, AlertCircle, CheckCircle, Users, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface AdminStats {
  totalDeposits: number;
  totalWeight: number;
  activeMembers: number;
  pendingDeposits: number;
  pendingClaims: number;
  totalPointsCirculation: number;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/dashboard');
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
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Kelola setor sampah, member, dan reward
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Setor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-foreground">
                {stats?.totalDeposits.toLocaleString()}
              </div>
              <TrendingUp className="w-8 h-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Berat (kg)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {stats?.totalWeight.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Member Aktif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-foreground">
                {stats?.activeMembers}
              </div>
              <Users className="w-8 h-8 text-secondary/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              Setor Menunggu Verifikasi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-yellow-700 mb-4">
              {stats?.pendingDeposits}
            </div>
            <Link href="/app/admin/deposits">
              <Button className="w-full bg-yellow-600 hover:bg-yellow-700">
                Verifikasi Sekarang
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              Reward Menunggu Persetujuan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-700 mb-4">
              {stats?.pendingClaims}
            </div>
            <Link href="/app/admin/rewards">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Setujui Reward
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Management Section */}
      <Tabs defaultValue="deposits" className="space-y-4">
        <TabsList className="grid w-full md:grid-cols-4">
          <TabsTrigger value="deposits">Setor</TabsTrigger>
          <TabsTrigger value="members">Member</TabsTrigger>
          <TabsTrigger value="rewards">Reward</TabsTrigger>
          <TabsTrigger value="settings">Pengaturan</TabsTrigger>
        </TabsList>

        <TabsContent value="deposits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manajemen Setor Sampah</CardTitle>
              <CardDescription>
                Verifikasi dan kelola setor sampah dari member
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Link href="/app/admin/deposits" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Lihat Semua Setor
                  </Button>
                </Link>
                <Link href="/app/admin/deposits/manual" className="flex-1">
                  <Button className="w-full bg-primary">
                    Input Manual Setor
                  </Button>
                </Link>
              </div>
              <Link href="/app/admin/deposits/import" className="block">
                <Button variant="secondary" className="w-full">
                  Import dari CSV
                </Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manajemen Member</CardTitle>
              <CardDescription>
                Kelola data member dan poin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Link href="/app/admin/members" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Lihat Semua Member
                  </Button>
                </Link>
                <Link href="/app/admin/members/create" className="flex-1">
                  <Button className="w-full bg-primary">
                    Buat Member Baru
                  </Button>
                </Link>
              </div>
              <div className="flex gap-2">
                <Link href="/app/admin/members/import" className="flex-1">
                  <Button variant="secondary" className="w-full">
                    Import CSV
                  </Button>
                </Link>
                <Link href="/app/admin/points" className="flex-1">
                  <Button variant="secondary" className="w-full">
                    Adjustment Poin
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manajemen Reward</CardTitle>
              <CardDescription>
                Persetujui dan kelola pencairan poin member
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/app/admin/rewards">
                <Button className="w-full bg-primary">
                  Lihat Reward Pending
                </Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Sistem</CardTitle>
              <CardDescription>
                Konfigurasi sistem dan laporan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Link href="/app/admin/settings" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Pengaturan
                  </Button>
                </Link>
                <Link href="/app/admin/reports" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Laporan
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
