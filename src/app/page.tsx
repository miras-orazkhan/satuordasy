import Link from 'next/link';
import { db } from '@/lib/db';
import { getSetting, getHomePage } from '@/lib/settings';
import { ProjectsTabs } from '@/components/public/projects-tabs';
import { getThemePreset } from '@/lib/theme-presets';

// Render at request time (no DB at build time on Vercel)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const [projects, brandName, home] = await Promise.all([
    db.project.findMany({
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
    }),
    getSetting('brandName'),
    getHomePage(),
  ]);

  // HomePage settings override brandName if set
  const siteName = home.title || brandName;

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/40">
        <div className="container-premium flex h-16 md:h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-lg md:text-xl font-semibold tracking-tight">
            {home.logoUrl ? (
               
              <img
                src={home.logoUrl}
                alt={siteName}
                className="h-8 md:h-10 w-auto"
              />
            ) : null}
            {siteName}
          </Link>
        </div>
      </header>

      {/* Hero — clean, no decorative stripes */}
      <section className="relative h-[70vh] min-h-[480px] w-full overflow-hidden">
        {home.heroImage ? (
           
          <img
            src={home.heroImage}
            alt={siteName}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-muted" />
        )}
        {/* Minimal darkening at the bottom for text readability — no stripes */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="container-premium relative h-full flex flex-col justify-end pb-16 md:pb-24">
          <p className="text-white/80 text-sm md:text-base mb-3 tracking-wider uppercase">
            Выберите свой идеальный дом
          </p>
          <h1 className="text-white text-4xl md:text-7xl lg:text-8xl font-bold tracking-tight text-balance max-w-5xl">
            {siteName}
          </h1>
          {home.subtitle && (
            <p className="text-white/90 text-base md:text-xl mt-4 md:mt-6 max-w-2xl text-balance">
              {home.subtitle}
            </p>
          )}
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
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">
              Пока нет опубликованных проектов.
            </p>
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
      <Footer brandName={siteName} />
    </main>
  );
}

async function Footer({ brandName }: { brandName: string }) {
  const socials = await db.socialLink.findMany({
    where: { projectId: null },
    orderBy: { sortOrder: 'asc' },
  });
  return (
    <footer className="border-t border-border mt-auto">
      <div className="container-premium py-10 md:py-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-xl font-semibold tracking-tight">{brandName}</p>
            <p className="text-sm text-muted-foreground mt-1">Выберите свой идеальный дом</p>
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
