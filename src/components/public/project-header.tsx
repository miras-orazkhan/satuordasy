'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

type Props = { title: string; brandName: string };

const NAV = [
  { label: 'Преимущества', target: 'advantages' },
  { label: 'О проекте', target: 'about' },
  { label: 'Галерея', target: 'gallery' },
  { label: 'Планировки', target: 'plans' },
  { label: 'Интерьеры', target: 'interiors' },
  { label: 'Заявка', target: 'leads-form' },
];

export function ProjectHeader({ title, brandName }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      queueMicrotask(() => setScrolled(window.scrollY > 32));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={
        'sticky top-0 z-50 transition-all ' +
        (scrolled
          ? 'glass border-b border-border/40'
          : 'bg-transparent')
      }
    >
      <div className="container-premium flex h-16 md:h-20 items-center justify-between">
        <Link
          href="/"
          className={
            'text-lg md:text-xl font-semibold tracking-tight transition-colors ' +
            (scrolled ? 'text-foreground' : 'text-white')
          }
        >
          {brandName}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV.map((item) => (
            <button
              key={item.target}
              onClick={() => {
                const el = document.getElementById(item.target);
                el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className={
                'text-sm font-medium transition-colors ' +
                (scrolled
                  ? 'text-muted-foreground hover:text-foreground'
                  : 'text-white/80 hover:text-white')
              }
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full"
          onClick={() => setOpen((v) => !v)}
          aria-label="Меню"
          aria-expanded={open}
        >
          {scrolled ? (
            open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />
          ) : (
            open ? <X className="h-5 w-5 text-white" /> : <Menu className="h-5 w-5 text-white" />
          )}
        </button>
      </div>

      {/* Mobile nav */}
      {open && (
        <nav className="md:hidden border-t border-border glass">
          <div className="container-premium py-4 flex flex-col gap-1">
            {NAV.map((item) => (
              <button
                key={item.target}
                onClick={() => {
                  setOpen(false);
                  const el = document.getElementById(item.target);
                  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="text-left py-2 text-sm font-medium text-foreground"
              >
                {item.label}
              </button>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
