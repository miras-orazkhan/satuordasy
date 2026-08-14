import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { getPublishedProjectBySlug, getGlobalSocials } from '@/lib/queries';
import { getSetting } from '@/lib/settings';
import { getThemePreset, getFontPreset } from '@/lib/theme-presets';

import { HeroSection } from '@/components/public/sections/hero-section';
import { AdvantagesSection } from '@/components/public/sections/advantages-section';
import { AboutSection } from '@/components/public/sections/about-section';
import { GallerySection } from '@/components/public/sections/gallery-section';
import { FloorPlansSection } from '@/components/public/sections/floor-plans-section';
import { InteriorsSection } from '@/components/public/sections/interiors-section';
import { LeadFormSection } from '@/components/public/sections/lead-form-section';
import { FooterSection } from '@/components/public/sections/footer-section';
import { ProjectHeader } from '@/components/public/project-header';

export const revalidate = 60;

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = await db.project.findFirst({
    where: { slug, status: 'published' },
    select: {
      title: true,
      seoTitle: true,
      seoDescription: true,
      seoKeywords: true,
      ogImageUrl: true,
      geoRegion: true,
      geoCity: true,
    },
  });
  if (!project) return {};

  const title = project.seoTitle ?? project.title;
  const description = project.seoDescription ?? '';
  const keywords = project.seoKeywords?.split(',').map((s) => s.trim()) ?? [];

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      images: project.ogImageUrl ? [{ url: project.ogImageUrl }] : undefined,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: project.ogImageUrl ? [project.ogImageUrl] : undefined,
    },
    other: {
      'geo.region': project.geoRegion ?? '',
      'geo.placename': project.geoCity ?? '',
    },
  };
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const project = await getPublishedProjectBySlug(slug);
  if (!project) notFound();

  const brandName = await getSetting('brandName');
  const globalSocials = await getGlobalSocials();
  const socials = project.socials.length > 0 ? project.socials : globalSocials;

  const theme = getThemePreset(project.themePreset);
  const font = getFontPreset(project.fontPreset);
  const themeStyle = Object.entries(theme.cssVars)
    .map(([k, v]) => `${k}: ${v};`)
    .join(' ');

  return (
    <main
      className={`min-h-screen bg-background text-foreground ${theme.isDark ? 'dark' : ''}`}
      style={{ ...parseCssVars(themeStyle), '--font-sans': `var(--font-${font.nextFont})` } as React.CSSProperties}
    >
      <ProjectHeader title={project.title} brandName={brandName} />

      {project.hero && (
        <HeroSection
          title={project.hero.title}
          subtitle={project.hero.subtitle}
          ctaText={project.hero.ctaText}
          desktopImage={project.hero.desktopImage}
          mobileImage={project.hero.mobileImage}
        />
      )}

      <AdvantagesSection items={project.advantages} />

      {project.about && (
        <AboutSection
          description={project.about.description}
          mapEmbedUrl={project.about.mapEmbedUrl}
          nearby={project.about.nearby}
        />
      )}

      <GallerySection images={project.gallery} />

      <FloorPlansSection
        categories={project.floorCategories}
        catalog={project.catalog}
      />

      <InteriorsSection items={project.interiors} />

      <LeadFormSection projectId={project.id} />

      <FooterSection socials={socials} brandName={brandName} projectTitle={project.title} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildSchema(project)),
        }}
      />
    </main>
  );
}

function buildSchema(project: any) {
  return {
    '@context': 'https://schema.org',
    '@type': ['RealEstateListing', 'LocalBusiness'],
    name: project.title,
    description: project.seoDescription,
    url: `/zhk/${project.slug}`,
    image: project.ogImageUrl,
    address: {
      '@type': 'PostalAddress',
      addressLocality: project.geoCity,
      addressRegion: project.geoRegion,
    },
    geo:
      project.geoLat && project.geoLng
        ? {
            '@type': 'GeoCoordinates',
            latitude: project.geoLat,
            longitude: project.geoLng,
          }
        : undefined,
  };
}

function parseCssVars(css: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of css.split(';')) {
    const idx = part.indexOf(':');
    if (idx < 0) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    if (key) out[key] = val;
  }
  return out;
}
