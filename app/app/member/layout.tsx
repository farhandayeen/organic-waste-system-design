import { AppShell } from '@/components/layout/app-shell';

const navItems = [
  { href: '/app/member/dashboard', label: 'Dashboard' },
  { href: '/app/member/deposits', label: 'Setor' },
  { href: '/app/member/rewards', label: 'Reward' },
  { href: '/app/member/profile', label: 'Profil' },
];

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell title="Member" navItems={navItems}>
      {children}
    </AppShell>
  );
}
