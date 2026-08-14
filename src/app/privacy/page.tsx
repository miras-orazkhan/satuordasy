import type { Metadata } from 'next';
import Link from 'next/link';
import { getPrivacyPolicy } from '@/lib/settings';
import { getSetting } from '@/lib/settings';

export const metadata: Metadata = {
  title: 'Политика конфиденциальности',
  description: 'Порядок обработки персональных данных',
  robots: { index: true, follow: true },
};

export default async function PrivacyPage() {
  const content = await getPrivacyPolicy();
  const brandName = await getSetting('brandName');

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 glass border-b border-border/40">
        <div className="container-premium flex h-16 md:h-20 items-center justify-between">
          <Link href="/" className="text-lg md:text-xl font-semibold tracking-tight">
            {brandName}
          </Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← На главную
          </Link>
        </div>
      </header>

      <article className="container-premium py-16 md:py-32 max-w-3xl">
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-balance">
          Политика конфиденциальности
        </h1>
        <p className="text-muted-foreground mt-4 text-sm md:text-base">
          Последнее обновление: {new Date().toLocaleDateString('ru-RU')}
        </p>

        <div className="mt-12 md:mt-16 prose prose-lg max-w-none">
          {content.split('\n').map((line, i) => {
            if (line.startsWith('# ')) {
              return (
                <h2 key={i} className="text-2xl md:text-3xl font-semibold tracking-tight mt-10 md:mt-12 mb-4">
                  {line.slice(2)}
                </h2>
              );
            }
            if (line.startsWith('## ')) {
              return (
                <h3 key={i} className="text-xl md:text-2xl font-semibold tracking-tight mt-8 md:mt-10 mb-3">
                  {line.slice(3)}
                </h3>
              );
            }
            if (line.startsWith('- ')) {
              return (
                <li key={i} className="text-muted-foreground mt-2 leading-relaxed ml-4 list-disc">
                  {line.slice(2)}
                </li>
              );
            }
            if (line.trim() === '') return <div key={i} className="h-3" />;
            return (
              <p key={i} className="text-muted-foreground mt-4 leading-relaxed text-base md:text-lg">
                {line}
              </p>
            );
          })}
        </div>

        <div className="mt-16 md:mt-24 pt-8 border-t border-border">
          <Link href="/" className="text-sm text-accent hover:underline">
            ← Вернуться на главную
          </Link>
        </div>
      </article>
    </main>
  );
}
