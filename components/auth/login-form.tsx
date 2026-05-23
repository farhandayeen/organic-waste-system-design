'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Leaf } from 'lucide-react';
import { loginSchema } from '@/lib/validations';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setIsLoading(true);

    try {
      // Client-side validation
      const validation = loginSchema.safeParse({ email, password });
      if (!validation.success) {
        const errors: Record<string, string> = {};
        validation.error.errors.forEach((err) => {
          errors[err.path[0] as string] = err.message;
        });
        setFieldErrors(errors);
        setIsLoading(false);
        return;
      }

      // Attempt login
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      console.log('[LoginForm] SignIn result:', result);

      if (result?.error) {
        setError(result.error || 'Email atau password salah');
        console.error('[LoginForm] Error:', result.error);
      } else if (result?.ok) {
        console.log('[LoginForm] Login success, redirecting...');
        // Wait a moment for session to be set
        await new Promise(resolve => setTimeout(resolve, 500));
        router.push('/');
        router.refresh();
      } else {
        setError('Gagal login. Coba lagi.');
      }
    } catch (err) {
      setError('Terjadi kesalahan. Coba lagi.');
      console.error('[LoginForm] Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2 text-center">
        <div className="flex items-center justify-center gap-2">
          <Leaf className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Sampah Organik</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Sistem Manajemen Sampah Organik Komunitas
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="nama@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
            className={fieldErrors.email ? 'border-red-500' : ''}
          />
          {fieldErrors.email && (
            <p className="text-xs text-red-500">{fieldErrors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Kata Sandi</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
            className={fieldErrors.password ? 'border-red-500' : ''}
          />
          {fieldErrors.password && (
            <p className="text-xs text-red-500">{fieldErrors.password}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Masuk...
            </>
          ) : (
            'Masuk'
          )}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Atau
          </span>
        </div>
      </div>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Belum punya akun? </span>
        <a href="/register" className="font-semibold text-primary hover:underline">
          Daftar di sini
        </a>
      </div>
    </div>
  );
}
