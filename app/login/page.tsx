import { LoginForm } from '@/components/auth/login-form';
import { Leaf } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Leaf className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground">Sampah Organik</h1>
          <p className="text-base text-muted-foreground">
            Platform Pengelolaan Sampah Organik Komunitas
          </p>
        </div>

        {/* Card */}
        <div className="bg-card rounded-lg shadow-md border border-border p-8">
          <LoginForm />
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>
            Sistem ini membantu komunitas mengelola sampah organik
            <br />
            dengan sistem poin dan reward yang adil.
          </p>
        </div>
      </div>
    </div>
  );
}
