'use client';

import { useEffect, useState } from 'react';
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

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function HeroSection({ title, subtitle, ctaText, desktopImage, mobileImage }: HeroProps) {
  // Subtle parallax on hero image — one signature motion per page (Apple-style).
  // Disabled when prefers-reduced-motion.
  const [scrollY, setScrollY] = useState(0);
  const [reduced, setReduced] = useState<boolean>(() => prefersReducedMotion());

  useEffect(() => {
    if (reduced) return;

    const onScroll = () => {
      queueMicrotask(() => setScrollY(window.scrollY));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [reduced]);

  const translateY = reduced ? 0 : Math.min(scrollY * 0.35, 200);
  const scale = reduced ? 1 : 1 + Math.min(scrollY * 0.0003, 0.06);

  return (
    <section
      className="relative h-[92vh] min-h-[560px] w-full overflow-hidden"
      aria-label="Главный экран"
    >
      <div className="absolute inset-0 overflow-hidden">
        { }
        <Image
          src={desktopImage || mobileImage || ''}
          alt={title}
          fill
          className="absolute inset-0 h-full w-full object-cover will-change-transform"
          style={{ transform: `translate3d(0, ${translateY}px, 0) scale(${scale})` }}
          sizes="100vw"
          quality={75}
          priority
        />
      </div>
      {/* Single subtle bottom gradient for text readability — no decorative stripes */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

      <div className="container-premium relative h-full flex flex-col justify-end pb-16 md:pb-28">
        <HeroFade>
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

// Lightweight inline fade-in on mount — uses tw-animate-css classes, no JS animation
function HeroFade({ children }: { children: React.ReactNode }) {
  return <div className="animate-in fade-in duration-1000 fill-mode-both">{children}</div>;
}
