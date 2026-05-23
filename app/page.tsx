import { auth } from '@/auth/config';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Leaf, Droplets, Users, TrendingUp } from 'lucide-react';

export default async function Home() {
  const session = await auth();

  // Redirect berdasarkan role
  if (session?.user?.role === 'member') {
    redirect('/app/member/dashboard');
  } else if (session?.user?.role === 'admin_bumdes') {
    redirect('/app/admin/dashboard');
  } else if (session?.user?.role === 'super_admin') {
    redirect('/app/super-admin/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg text-foreground">Sampah Organik</span>
          </div>
          <div className="flex gap-4">
            <a href="/login">
              <Button variant="outline">Masuk</Button>
            </a>
            <a href="/register">
              <Button className="bg-primary hover:bg-primary/90">Daftar</Button>
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-6 leading-tight">
          Kelola Sampah Organik
          <br />
          <span className="text-primary">dengan Sistem Poin</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Platform komunitas untuk mengelola sampah organik secara efisien.
          Setor sampah, kumpulkan poin, dan dapatkan reward!
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <a href="/register">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Mulai Sekarang
            </Button>
          </a>
          <a href="#features">
            <Button size="lg" variant="outline">
              Pelajari Lebih Lanjut
            </Button>
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-foreground text-center mb-12">
          Fitur Unggulan
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-card border border-border rounded-lg p-8">
            <Droplets className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-2">
              Kelola Setor Sampah
            </h3>
            <p className="text-muted-foreground">
              Setor sampah organik Anda dengan mudah melalui platform kami.
              Setiap setor dicatat dan dikonversi menjadi poin.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-8">
            <TrendingUp className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-2">
              Kumpulkan Poin
            </h3>
            <p className="text-muted-foreground">
              Setiap kilogram sampah yang Anda setor akan memberikan poin.
              Semakin banyak setor, semakin banyak poin yang didapat.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-8">
            <Users className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-2">
              Dapatkan Reward
            </h3>
            <p className="text-muted-foreground">
              Tukarkan poin Anda dengan uang tunai atau hadiah menarik.
              Transparansi penuh dan pembayaran yang adil.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-12 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Siap Bergabung?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Daftar sekarang dan mulai setor sampah organik Anda.
            Bergabunglah dengan komunitas yang peduli lingkungan.
          </p>
          <a href="/register">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Daftar Gratis
            </Button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">Sampah Organik</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 Sistem Pengelolaan Sampah Organik. Semua hak dilindungi.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
