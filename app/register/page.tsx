import { RegisterForm } from '@/components/auth/register-form';
import { redirect } from 'next/navigation';
import { auth } from '@/auth/config';
import { Suspense } from 'react';

export default async function RegisterPage() {
  const session = await auth();

  if (session) {
    redirect('/app/member/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="w-full max-w-md">
        <Suspense fallback={<div className="text-center text-muted-foreground">Memuat formulir...</div>}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
