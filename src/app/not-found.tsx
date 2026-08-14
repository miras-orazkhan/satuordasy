import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="container-premium h-16 md:h-20 flex items-center">
        <Link href="/" className="text-lg md:text-xl font-semibold tracking-tight">
          Vela Estates
        </Link>
      </header>
      <div className="flex-1 container-premium flex flex-col items-center justify-center text-center">
        <p className="text-sm text-muted-foreground uppercase tracking-wider mb-3">404</p>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-balance">
          Страница не найдена
        </h1>
        <p className="mt-5 text-muted-foreground text-base md:text-lg max-w-md">
          Возможно, страница была удалена или вы перешли по устаревшей ссылке.
        </p>
        <Button asChild className="mt-8 rounded-full">
          <Link href="/">Вернуться на главную</Link>
        </Button>
      </div>
    </main>
  );
}
