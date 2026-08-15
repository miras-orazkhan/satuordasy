import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const projects = await db.project.findMany({
    where: { status: 'published' },
    select: { slug: true, updatedAt: true },
  });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://vela-estates.example';

  const urls = [
    { loc: `${baseUrl}/`, lastmod: new Date().toISOString(), priority: '1.0', changefreq: 'weekly' },
    { loc: `${baseUrl}/privacy`, lastmod: new Date().toISOString(), priority: '0.3', changefreq: 'yearly' },
    { loc: `${baseUrl}/llms.txt`, lastmod: new Date().toISOString(), priority: '0.8', changefreq: 'weekly' },
    ...projects.map((p) => ({
      loc: `${baseUrl}/zhk/${p.slug}`,
      lastmod: p.updatedAt.toISOString(),
      priority: '0.9',
      changefreq: 'weekly',
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
