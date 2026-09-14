'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowDown } from 'lucide-react';
import { scrollToId } from '@/lib/scroll';

type HeroProps = {
  title: string;
  subtitle?: string | null;
  ctaText: string;
  desktopImage?: string | null;
  mobileImage?: string | null;
};

/**
 * Hero with subtle parallax (disabled when prefers-reduced-motion).
 *
 * Image optimisation:
 *   - Hero image is fetched with `priority` (high-priority LCP fetch).
 *   - Inline SVG blur placeholder avoids layout shift on slow connections.
 *   - Image fades in only after it actually loads (no premature fade).
 */
export function HeroSection({ title, subtitle, ctaText, desktopImage, mobileImage }: HeroProps) {
  const [scrollY, setScrollY] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (reduced) return;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrollY(window.scrollY);
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [reduced]);

  const translateY = reduced ? 0 : Math.min(scrollY * 0.35, 200);
  const scale = reduced ? 1 : 1 + Math.min(scrollY * 0.0003, 0.06);

  const imgSrc = desktopImage || mobileImage || '';

  return (
    <section
      className="relative h-[92vh] min-h-[560px] w-full overflow-hidden"
      aria-label="Главный экран"
    >
      <div className="absolute inset-0 overflow-hidden">
        {/* Blur placeholder while hero image is loading — no layout shift */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-muted via-muted/80 to-background"
          aria-hidden="true"
          style={{
            opacity: imgLoaded ? 0 : 1,
            transition: 'opacity 0.5s ease',
          }}
        />
        {imgSrc && (
          <Image
            ref={imgRef as any}
            src={imgSrc}
            alt={title}
            fill
            className="absolute inset-0 h-full w-full object-cover will-change-transform"
            style={{
              transform: `translate3d(0, ${translateY}px, 0) scale(${scale})`,
              opacity: imgLoaded ? 1 : 0,
              transition: 'opacity 0.5s ease',
            }}
            sizes="100vw"
            quality={72}
            priority
            fetchPriority="high"
            onLoad={() => setImgLoaded(true)}
          />
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

      <div className="container-premium relative h-full flex flex-col justify-end pb-16 md:pb-28">
        <HeroFade reduced={reduced}>
          <h1 className="text-white text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-balance max-w-5xl">
            {title}
          </h1>
          {subtitle && (
            <p className="text-white/90 text-lg md:text-xl lg:text-2xl mt-5 md:mt-8 max-w-2xl text-balance">
              {subtitle}
            </p>
          )}
          <div className="mt-8 md:mt-12 flex flex-wrap items-center gap-4">
            <Button
              size="lg"
              onClick={() => scrollToId('leads-form')}
              className="rounded-full px-7 md:px-8 h-12 md:h-14 text-base font-medium"
            >
              {ctaText}
            </Button>
            <button
              onClick={() => scrollToId('about')}
              className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm transition-colors group"
            >
              <span>Узнать о проекте</span>
              <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-1" />
            </button>
          </div>
        </HeroFade>
      </div>
    </section>
  );
}

/**
 * Inline fade-in on mount — uses CSS transition, no JS animation library.
 * Respects prefers-reduced-motion (renders plain children).
 */
function HeroFade({ children, reduced }: { children: React.ReactNode; reduced: boolean }) {
  if (reduced) return <>{children}</>;
  return (
    <div
      style={{
        animation: 'heroFadeIn 1s cubic-bezier(0.16, 1, 0.3, 1) both',
      }}
    >
      {children}
    </div>
  );
}
