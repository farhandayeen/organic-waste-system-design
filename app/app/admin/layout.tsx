import { AppShell } from '@/components/layout/app-shell';

const navItems = [
  { href: '/app/admin/dashboard', label: 'Dashboard' },
  { href: '/app/admin/deposits', label: 'Setor' },
  { href: '/app/admin/members', label: 'Member' },
  { href: '/app/admin/rewards', label: 'Reward' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell title="Admin BUMDES" navItems={navItems}>
      {children}
    </AppShell>
  );
}
