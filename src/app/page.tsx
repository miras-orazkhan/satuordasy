import Link from 'next/link';
import { db } from '@/lib/db';
import { getSetting } from '@/lib/settings';
import { ProjectsTabs } from '@/components/public/projects-tabs';
import { ArrowUpRight } from 'lucide-react';
import { getThemePreset } from '@/lib/theme-presets';

export const revalidate = 60;

export default async function Home() {
  const projects = await db.project.findMany({
    where: { status: 'published' },
    select: {
      id: true,
      slug: true,
      title: true,
      themePreset: true,
      fontPreset: true,
      seoTitle: true,
      seoDescription: true,
      hero: { select: { desktopImage: true, mobileImage: true, subtitle: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  const brandName = await getSetting('brandName');

  const hero = projects[0];

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/40">
        <div className="container-premium flex h-16 md:h-20 items-center justify-between">
          <Link href="/" className="text-lg md:text-xl font-semibold tracking-tight">
            {brandName}
          </Link>
          <nav className="flex items-center gap-3 md:gap-6 text-sm">
            <Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
              Админка
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative h-[70vh] min-h-[480px] w-full overflow-hidden">
        {hero?.hero?.desktopImage ? (
          <img
            src={hero.hero.desktopImage}
            alt={hero.title}
            className="absolute inset-0 h-full w-full object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-muted" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="container-premium relative h-full flex flex-col justify-end pb-16 md:pb-24">
          <p className="text-white/80 text-sm md:text-base mb-3 tracking-wider uppercase">
            Премиальные жилые комплексы
          </p>
          <h1 className="text-white text-4xl md:text-7xl lg:text-8xl font-bold tracking-tight text-balance max-w-5xl">
            {brandName}
          </h1>
          <p className="text-white/90 text-base md:text-xl mt-4 md:mt-6 max-w-2xl text-balance">
            Архитектура, которая остаётся в памяти. Выберите проект, чтобы узнать детали.
          </p>
        </div>
      </section>

      {/* Projects tabs section */}
      <section className="container-premium py-16 md:py-32">
        <div className="flex items-end justify-between mb-8 md:mb-16 flex-wrap gap-4">
          <div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-balance max-w-2xl">
              Наши проекты
            </h2>
            <p className="text-muted-foreground mt-4 max-w-xl text-base md:text-lg">
              Выберите жилой комплекс, чтобы перейти на его страницу. Каждый проект — отдельная история,
              с собственным оформлением и характером.
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Всего проектов: <span className="font-semibold text-foreground">{projects.length}</span>
          </p>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">
              Пока нет опубликованных проектов. Загляните в админку, чтобы создать первый ЖК.
            </p>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 mt-4 text-accent hover:underline"
            >
              Открыть админ-панель <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <ProjectsTabs projects={projects.map((p) => ({
            slug: p.slug,
            title: p.title,
            themePreset: p.themePreset,
            subtitle: p.hero?.subtitle ?? '',
            heroImage: p.hero?.desktopImage ?? p.hero?.mobileImage ?? '',
            description: p.seoDescription ?? '',
            swatches: getThemePreset(p.themePreset).swatches,
          }))} />
        )}
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}

async function Footer() {
  const socials = await db.socialLink.findMany({
    where: { projectId: null },
    orderBy: { sortOrder: 'asc' },
  });
  const brandName = await getSetting('brandName');
  return (
    <footer className="border-t border-border mt-auto">
      <div className="container-premium py-10 md:py-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-xl font-semibold tracking-tight">{brandName}</p>
            <p className="text-sm text-muted-foreground mt-1">Премиальные жилые комплексы</p>
          </div>
          <div className="flex items-center gap-6">
            {socials.map((s) => (
              <a
                key={s.id}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {s.platform}
              </a>
            ))}
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Политика конфиденциальности
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
