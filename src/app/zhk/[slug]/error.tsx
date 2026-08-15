'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

/**
 * Error boundary for /zhk/[slug] routes.
 * Catches rendering errors that would otherwise produce a 500 with a cryptic
 * "Application error: a server-side exception has occurred" message.
 *
 * The full error is logged to Vercel Runtime Logs (server-side) so we can
 * debug, but the user sees a friendly message instead.
 */
export default function ZhkError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to console — this will appear in Vercel Runtime Logs
    console.error('[/zhk/[slug]] render error:', error?.message, error?.digest, error?.stack);
  }, [error]);

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="container-premium h-16 md:h-20 flex items-center">
        <Link href="/" className="text-lg md:text-xl font-semibold tracking-tight">
          Satu Ordasy
        </Link>
      </header>
      <div className="flex-1 container-premium flex flex-col items-center justify-center text-center py-20">
        <p className="text-sm text-muted-foreground uppercase tracking-wider mb-3">
          Ошибка загрузки проекта
        </p>
        <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-balance max-w-2xl">
          Не удалось загрузить страницу проекта
        </h1>
        <p className="mt-5 text-muted-foreground text-base md:text-lg max-w-md">
          Произошла ошибка при рендеринге страницы. Попробуйте обновить страницу —
          если ошибка повторяется, вернитесь на главную и выберите другой проект.
        </p>
        {error?.digest && (
          <p className="mt-4 text-xs text-muted-foreground/60 font-mono">
            Код ошибки: {error.digest}
          </p>
        )}
        <div className="mt-8 flex items-center gap-3">
          <Button onClick={reset} variant="outline">
            Попробовать снова
          </Button>
          <Button asChild>
            <Link href="/">На главную</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
