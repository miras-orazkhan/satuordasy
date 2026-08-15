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

// Render at request time (no DB at build time on Vercel)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
      geoLat: true,
      geoLng: true,
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
      locale: 'ru_RU',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: project.ogImageUrl ? [project.ogImageUrl] : undefined,
    },
    alternates: {
      canonical: `/zhk/${slug}`,
    },
    other: {
      // GEO (Generative Engine Optimization) — meta tags for AI crawlers
      'geo.region': project.geoRegion ? `RU-${project.geoRegion}` : '',
      'geo.placename': project.geoCity ?? '',
      'geo.position': project.geoLat && project.geoLng ? `${project.geoLat};${project.geoLng}` : '',
      'ICBM': project.geoLat && project.geoLng ? `${project.geoLat}, ${project.geoLng}` : '',
      // Hint for AI crawlers that this is a real-estate listing
      'article:tag': ['жилой комплекс', 'недвижимость', project.geoCity, project.title].filter(Boolean).join(', '),
      'robots': 'index, follow, max-image-preview:large, max-snippet:-1',
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

  // Build schema.org JSON-LD safely — wrap in try/catch to avoid 500 if data has
  // unexpected null/undefined values that break JSON.stringify on Vercel.
  let schemaJson = '{}';
  try {
    schemaJson = JSON.stringify(buildSchema(project));
  } catch (e) {
    console.error('Schema build error:', e);
  }

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

      <LeadFormSection
        projectId={project.id}
        config={project.leadForm ? {
          formType: project.leadForm.formType,
          bitrixPortalId: project.leadForm.bitrixPortalId,
          bitrixFormId: project.leadForm.bitrixFormId,
          bitrixEmbedCode: project.leadForm.bitrixEmbedCode,
          sectionTitle: project.leadForm.sectionTitle,
          sectionSubtitle: project.leadForm.sectionSubtitle,
        } : null}
      />

      <FooterSection socials={socials} brandName={brandName} projectTitle={project.title} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: schemaJson }}
      />
    </main>
  );
}

function buildSchema(project: any) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? '';

  // FAQ entries derived from advantages (each advantage becomes a Q&A)
  const faqEntries = (project.advantages ?? []).map((a: any) => ({
    '@type': 'Question',
    name: `Что особенного в «${a.title}»?`,
    acceptedAnswer: {
      '@type': 'Answer',
      text: a.description,
    },
  }));

  return {
    '@context': 'https://schema.org',
    '@graph': [
      // 1. RealEstateListing — primary entity
      {
        '@type': ['RealEstateListing', 'LocalBusiness', 'Place'],
        '@id': `${baseUrl}/zhk/${project.slug}#listing`,
        name: project.title,
        description: project.seoDescription ?? project.about?.description,
        url: `${baseUrl}/zhk/${project.slug}`,
        image: project.ogImageUrl,
        address: {
          '@type': 'PostalAddress',
          addressLocality: project.geoCity,
          addressRegion: project.geoRegion,
          addressCountry: 'RU',
        },
        geo:
          project.geoLat && project.geoLng
            ? {
                '@type': 'GeoCoordinates',
                latitude: project.geoLat,
                longitude: project.geoLng,
              }
            : undefined,
        // Amenities = advantages, structured for AI engines
        amenityFeature: (project.advantages ?? []).map((a: any) => ({
          '@type': 'LocationFeatureSpecification',
          name: a.title,
          value: true,
          description: a.description,
        })),
        // Floor plans
        floorSize: (project.floorCategories ?? []).flatMap((c: any) =>
          (c.units ?? []).map((u: any) => ({
            '@type': 'QuantitativeValue',
            name: u.name ?? c.name,
            value: u.area,
            unitText: 'm²',
          }))
        ),
      },
      // 2. FAQPage — for AI Overview / Perplexity / ChatGPT to surface answers
      ...(faqEntries.length > 0
        ? [
            {
              '@type': 'FAQPage',
              '@id': `${baseUrl}/zhk/${project.slug}#faq`,
              mainEntity: faqEntries,
            },
          ]
        : []),
      // 3. BreadcrumbList — for AI engines to understand site structure
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Главная',
            item: baseUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: project.title,
            item: `${baseUrl}/zhk/${project.slug}`,
          },
        ],
      },
    ],
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
