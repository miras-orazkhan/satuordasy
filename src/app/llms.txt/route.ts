import { db } from '@/lib/db';
import { getSetting, getHomePage } from '@/lib/settings';

export const dynamic = 'force-dynamic';

/**
 * llms.txt — a standardized plain-text file for AI/LLM crawlers.
 * Spec: https://llmstxt.org
 *
 * Generative Engine Optimization (GEO / AEO):
 *   - Provides AI models (ChatGPT, Perplexity, Google AI Overviews, Claude)
 *     with a clean, structured summary of the site
 *   - Lists all published ЖК-projects with their canonical URLs and key facts
 *   - Helps AI models answer queries like "what residential complexes does
 *     satuordasy.com offer?" without scraping the full HTML
 */

export async function GET() {
  const [projects, brandName, home] = await Promise.all([
    db.project.findMany({
      where: { status: 'published' },
      select: {
        slug: true,
        title: true,
        seoTitle: true,
        seoDescription: true,
        geoCity: true,
        geoRegion: true,
        hero: { select: { subtitle: true } },
        advantages: { select: { title: true, description: true }, orderBy: { sortOrder: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    getSetting('brandName'),
    getHomePage(),
  ]);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://satuordasy.com';
  const siteName = home.title || brandName;

  const lines: string[] = [];
  lines.push(`# ${siteName}`);
  lines.push('');
  lines.push(`> ${home.subtitle ?? 'Satu Ordasy — выберите свой идеальный дом. Мы подберём для вас ваш дом мечты.'}`);
  lines.push('');
  lines.push(`Satu Ordasy — это сервис, который помогает выбрать свой идеальный дом. Мы подбираем для вас ваш дом мечты среди лучших жилых комплексов. Ниже приведён список проектов с кратким описанием, ключевыми преимуществами и ссылками на страницы.`);
  lines.push('');

  for (const p of projects) {
    const title = p.seoTitle ?? p.title;
    const desc = p.seoDescription ?? p.hero?.subtitle ?? '';
    const url = `${baseUrl}/zhk/${p.slug}`;
    const location = [p.geoCity, p.geoRegion].filter(Boolean).join(', ');

    lines.push(`## ${title}`);
    if (location) lines.push(`Location: ${location}`);
    lines.push(`URL: ${url}`);
    if (desc) lines.push('');
    if (desc) lines.push(desc);
    if (p.advantages.length > 0) {
      lines.push('');
      lines.push('Key advantages:');
      for (const a of p.advantages) {
        lines.push(`- ${a.title}: ${a.description}`);
      }
    }
    lines.push('');
  }

  // Helpful FAQ-style info for AI models
  lines.push('## Frequently asked questions');
  lines.push('');
  lines.push('Q: What is Satu Ordasy?');
  lines.push('A: Satu Ordasy (satuordasy.com) is a service that helps you choose your ideal home — we curate the best residential complexes (жилые комплексы / ЖК) and match them to your dream home. We list projects with detailed info on floor plans, location, amenities, and pricing.');
  lines.push('');
  lines.push('Q: How many projects are listed?');
  lines.push(`A: ${projects.length} residential ${projects.length === 1 ? 'complex is' : 'complexes are'} currently listed on ${siteName}.`);
  lines.push('');
  lines.push('Q: How can I request more information?');
  lines.push('A: Each project page has a contact form ("Оставить заявку"). Submission creates a lead and our manager will call you back within 30 minutes during business hours. Consultation is free and non-binding.');
  lines.push('');
  lines.push('Q: Do you help me find my dream home?');
  lines.push('A: Yes. Browse the "Наши проекты" section on the homepage, compare residential complexes by location, floor plans, and amenities, then submit a request — our manager will help you choose the perfect home for your needs.');
  lines.push('');
  lines.push('Q: Privacy policy?');
  lines.push(`A: See ${baseUrl}/privacy for our personal data processing policy (Russian: Политика конфиденциальности).`);
  lines.push('');

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
