import type { Metadata, Viewport } from 'next';
import { Inter, Manrope, Sora, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { SessionProvider } from '@/components/providers/session-provider';
import { getSetting } from '@/lib/settings';
import { GtmScript } from '@/components/analytics/gtm-script';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
});
const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
});
const sora = Sora({
  variable: '--font-sora',
  subsets: ['latin'],
  display: 'swap',
});
const plusJakarta = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Satu Ordasy — выберите свой идеальный дом',
    template: '%s — Satu Ordasy',
  },
  description:
    'Satu Ordasy поможет вам выбрать идеальный дом мечты. Подберём для вас квартиру в лучших жилых комплексах — планировки, расположение, инфраструктура и актуальные цены.',
  keywords: [
    'satu ordasy',
    'выбрать квартиру',
    'дом мечты',
    'жилые комплексы',
    'новостройки',
    'купить квартиру',
    'подбор квартиры',
    'планировки квартир',
  ],
  authors: [{ name: 'Satu Ordasy' }],
  openGraph: {
    title: 'Satu Ordasy — выберите свой идеальный дом',
    description:
      'Подберём для вас ваш дом мечты. Лучшие жилые комплексы, планировки, расположение и инфраструктура — всё для правильного выбора.',
    type: 'website',
    locale: 'ru_RU',
    siteName: 'Satu Ordasy',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Satu Ordasy — выберите свой идеальный дом',
    description:
      'Подберём для вас ваш дом мечты. Лучшие жилые комплексы, планировки, расположение и инфраструктура.',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a1a' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gtmId = await getSetting('gtmContainerId');
  const faviconUrl = await getSetting('faviconUrl');
  const brandName = await getSetting('brandName');

  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        {gtmId && <GtmScript gtmId={gtmId} />}
        {faviconUrl && <link rel="icon" href={faviconUrl} />}
      </head>
      <body
        className={`${inter.variable} ${manrope.variable} ${sora.variable} ${plusJakarta.variable} antialiased bg-background text-foreground font-sans`}
        style={{ '--font-sans': 'var(--font-inter)' } as React.CSSProperties}
        data-brand={brandName}
      >
        <SessionProvider>{children}</SessionProvider>
        <Toaster />
        <SonnerToaster richColors position="top-center" />
      </body>
    </html>
  );
}
