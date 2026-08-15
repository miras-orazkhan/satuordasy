'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLoginPage() {
  const search = useSearchParams();
  const callbackUrl = search.get('callbackUrl') || '/admin';
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = String(formData.get('email') || '');
    const password = String(formData.get('password') || '');

    // IMPORTANT: use redirect: true so the browser does a full HTTP redirect
    // to callbackUrl. With redirect: false + router.push, the cookie may not
    // be set in time for the middleware to see it on the next request, causing
    // an infinite redirect loop back to /admin/login.
    const res = await signIn('credentials', {
      email,
      password,
      callbackUrl,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      toast.error('Неверный email или пароль');
      return;
    }
    toast.success('Вход выполнен');
    // Use a hard navigation (window.location) instead of router.push to ensure
    // the just-set authentication cookie is sent with the next request.
    if (res?.url) {
      window.location.href = res.url;
    } else {
      window.location.href = callbackUrl;
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-secondary/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="inline-flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-accent/10 text-accent mb-3">
            <Shield className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Вход в админ-панель
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Используйте учётные данные Satu Ordasy
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                autoFocus
                placeholder="you@example.com"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="mt-1.5"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Войти
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
