'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Building2, Settings, BarChart3 } from 'lucide-react';

interface SuperAdminDashboardProps {
  onNavigate?: (section: string) => void;
}

export function SuperAdminDashboard({ onNavigate }: SuperAdminDashboardProps) {
  const [stats, setStats] = useState({
    totalOrganizations: 0,
    totalAdmins: 0,
    totalMembers: 0,
    totalDeposits: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch organizations
        const orgsRes = await fetch('/api/super-admin/organizations');
        const orgsData = await orgsRes.json();

        // Fetch admins
        const adminsRes = await fetch('/api/super-admin/admins');
        const adminsData = await adminsRes.json();

        setStats({
          totalOrganizations: orgsData.organizations?.length || 0,
          totalAdmins: adminsData.admins?.length || 0,
          totalMembers: 0, // TODO: Implement
          totalDeposits: 0, // TODO: Implement
        });
      } catch (error) {
        console.error('[v0] Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Super Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Manage organizations, admins, and system settings
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Organizations</p>
              <p className="text-2xl font-bold mt-1">{stats.totalOrganizations}</p>
            </div>
            <Building2 className="w-8 h-8 text-primary" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Admin Users</p>
              <p className="text-2xl font-bold mt-1">{stats.totalAdmins}</p>
            </div>
            <Users className="w-8 h-8 text-primary" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Members</p>
              <p className="text-2xl font-bold mt-1">{stats.totalMembers}</p>
            </div>
            <Users className="w-8 h-8 text-secondary" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Deposits</p>
              <p className="text-2xl font-bold mt-1">{stats.totalDeposits}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-accent" />
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="organizations" className="bg-card border border-border rounded-lg">
        <TabsList className="border-b border-border rounded-none bg-transparent">
          <TabsTrigger value="organizations" className="rounded-none">
            Organizations
          </TabsTrigger>
          <TabsTrigger value="admins" className="rounded-none">
            Admin Users
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-none">
            Global Settings
          </TabsTrigger>
          <TabsTrigger value="audit" className="rounded-none">
            Audit Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="organizations" className="p-6 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Manage Organizations</h3>
            <a href="/app/super-admin/organizations">
              <Button>Kelola Organisasi</Button>
            </a>
          </div>
          <p className="text-sm text-muted-foreground">
            Create and manage BUMDES organizations. Each organization has its own admin users and members.
          </p>
        </TabsContent>

        <TabsContent value="admins" className="p-6 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Manage Admin Users</h3>
            <a href="/app/super-admin/admins">
              <Button>Kelola Admin</Button>
            </a>
          </div>
          <p className="text-sm text-muted-foreground">
            Create and manage admin BUMDES accounts. Admins manage members and deposits for their organization.
          </p>
        </TabsContent>

        <TabsContent value="settings" className="p-6 space-y-4">
          <h3 className="font-semibold">System Settings</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Configure global system settings that apply across all organizations.
          </p>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Points per Kg</label>
              <input
                type="number"
                defaultValue="10"
                className="w-full mt-1 px-3 py-2 border border-input rounded-md"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Exchange Rate (poin ke Rp)</label>
              <input
                type="number"
                defaultValue="50"
                className="w-full mt-1 px-3 py-2 border border-input rounded-md"
              />
            </div>
            <Button className="w-full">Save Settings</Button>
          </div>
        </TabsContent>

        <TabsContent value="audit" className="p-6 space-y-4">
          <h3 className="font-semibold">Audit Logs</h3>
          <p className="text-sm text-muted-foreground">
            View system-wide audit logs including all admin actions.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
