'use client';

import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export function LogoutButton({ variant = 'outline' as const }) {
  return (
    <Button
      type="button"
      variant={variant}
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="gap-2"
    >
      <LogOut className="h-4 w-4" />
      Keluar
    </Button>
  );
}
