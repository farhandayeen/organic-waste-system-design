import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Akses Ditolak</h1>
        <p className="text-muted-foreground">Anda tidak memiliki izin untuk halaman ini.</p>
        <Link href="/login">
          <Button>Kembali ke Login</Button>
        </Link>
      </div>
    </div>
  );
}
