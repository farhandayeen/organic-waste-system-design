'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Leaf } from 'lucide-react';
import { registerSchema } from '@/lib/validations';

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bumdesIdFromUrl = searchParams.get('bumdesId') || '';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    phone: '',
    alamat: '',
    bumdesId: bumdesIdFromUrl,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setLoading(true);

    try {
      // Client-side validation
      const validation = registerSchema.safeParse({
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password,
        phone: formData.phone,
        alamat: formData.alamat,
        bumdesId: formData.bumdesId,
      });

      if (!validation.success) {
        const errors: Record<string, string> = {};
        validation.error.errors.forEach((err) => {
          errors[err.path[0] as string] = err.message;
        });
        setFieldErrors(errors);
        setLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Password tidak cocok');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          password: formData.password,
          phone: formData.phone,
          alamat: formData.alamat,
          bumdesId: formData.bumdesId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registrasi gagal');
        return;
      }

      router.push('/login?registered=true');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error registrasi');
      console.error('[RegisterForm] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2 text-center">
        <div className="flex items-center justify-center gap-2">
          <Leaf className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Daftar Akun</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Buat akun baru untuk bergabung
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Nama Depan</Label>
            <Input
              id="firstName"
              name="firstName"
              type="text"
              placeholder="John"
              value={formData.firstName}
              onChange={handleChange}
              disabled={loading}
              required
              className={fieldErrors.firstName ? 'border-red-500' : ''}
            />
            {fieldErrors.firstName && (
              <p className="text-xs text-red-500">{fieldErrors.firstName}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Nama Belakang</Label>
            <Input
              id="lastName"
              name="lastName"
              type="text"
              placeholder="Doe"
              value={formData.lastName}
              onChange={handleChange}
              disabled={loading}
              className={fieldErrors.lastName ? 'border-red-500' : ''}
            />
            {fieldErrors.lastName && (
              <p className="text-xs text-red-500">{fieldErrors.lastName}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="nama@example.com"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            required
            className={fieldErrors.email ? 'border-red-500' : ''}
          />
          {fieldErrors.email && (
            <p className="text-xs text-red-500">{fieldErrors.email}</p>
          )}
        </div>

        {!bumdesIdFromUrl && (
          <div className="space-y-2">
            <Label htmlFor="bumdesId">ID Organisasi (BUMDES)</Label>
            <Input
              id="bumdesId"
              name="bumdesId"
              type="text"
              placeholder="UUID organisasi"
              value={formData.bumdesId}
              onChange={handleChange}
              disabled={loading}
              required
              className={fieldErrors.bumdesId ? 'border-red-500' : ''}
            />
            {fieldErrors.bumdesId && (
              <p className="text-xs text-red-500">{fieldErrors.bumdesId}</p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="alamat">Alamat</Label>
          <Input
            id="alamat"
            name="alamat"
            type="text"
            placeholder="Alamat lengkap"
            value={formData.alamat}
            onChange={handleChange}
            disabled={loading}
            required
            className={fieldErrors.alamat ? 'border-red-500' : ''}
          />
          {fieldErrors.alamat && (
            <p className="text-xs text-red-500">{fieldErrors.alamat}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Nomor Telepon</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="+62812345678 atau 081234567890"
            value={formData.phone}
            onChange={handleChange}
            disabled={loading}
            required
            className={fieldErrors.phone ? 'border-red-500' : ''}
          />
          {fieldErrors.phone && (
            <p className="text-xs text-red-500">{fieldErrors.phone}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Kata Sandi</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Min 12 karakter, kombinasi A-Z, a-z, 0-9, !@#$%^&*"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            required
            className={fieldErrors.password ? 'border-red-500' : ''}
          />
          {fieldErrors.password && (
            <p className="text-xs text-red-500">{fieldErrors.password}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Konfirmasi Kata Sandi</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Masukkan ulang kata sandi"
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={loading}
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Mendaftar...
            </>
          ) : (
            'Daftar'
          )}
        </Button>
      </form>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Sudah punya akun? </span>
        <a href="/login" className="font-semibold text-primary hover:underline">
          Masuk di sini
        </a>
      </div>
    </div>
  );
}
