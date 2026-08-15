import { getSetting } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export async function GET() {
  const allowAll = (await getSetting('robotsAllowAll')) === 'true';
  const customRules = await getSetting('robotsCustomRules');
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://satuordasy.com';

  const lines: string[] = [
    'User-agent: *',
    allowAll ? 'Allow: /' : 'Disallow: /',
    '',
    `Sitemap: ${baseUrl}/sitemap.xml`,
  ];

  if (customRules.trim()) {
    lines.push('', customRules.trim());
  }

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
