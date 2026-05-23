import { AppShell } from '@/components/layout/app-shell';

const navItems = [
  { href: '/app/super-admin/dashboard', label: 'Dashboard' },
  { href: '/app/super-admin/organizations', label: 'Organisasi' },
  { href: '/app/super-admin/admins', label: 'Admin' },
];

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell title="Super Admin" navItems={navItems}>
      {children}
    </AppShell>
  );
}
