'use client';

import { useState, useCallback } from 'react';
import { Reveal } from '@/components/public/reveal';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Image = { id: string; url: string; caption: string | null };

export function GallerySection({ images }: { images: Image[] }) {
  const [index, setIndex] = useState(0);

  const goTo = useCallback(
    (i: number) => setIndex((i + images.length) % images.length),
    [images.length]
  );

  if (!images.length) return null;

  return (
    <section
      id="gallery"
      aria-labelledby="gallery-title"
      className="py-16 md:py-32 border-t border-border"
    >
      <div className="container-premium">
        <Reveal>
          <div className="flex items-end justify-between flex-wrap gap-4 mb-8 md:mb-12">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-3">
                Галерея
              </p>
              <h2
                id="gallery-title"
                className="text-3xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-balance"
              >
                Рендеры и виды
              </h2>
            </div>
            {images.length > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full h-10 w-10"
                  onClick={() => goTo(index - 1)}
                  aria-label="Предыдущее фото"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full h-10 w-10"
                  onClick={() => goTo(index + 1)}
                  aria-label="Следующее фото"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </Reveal>
      </div>

      {/* Full-bleed slider */}
      <div className="w-full overflow-hidden">
        <Reveal>
          <div className="relative aspect-[16/10] md:aspect-[21/9] lg:aspect-[3/1] w-full bg-muted overflow-hidden">
            {images.map((img, i) => (
              <img
                key={img.id}
                src={img.url}
                alt={img.caption ?? 'Изображение галереи'}
                className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
                style={{ opacity: i === index ? 1 : 0 }}
                loading={i === 0 ? 'eager' : 'lazy'}
              />
            ))}
            {images[index]?.caption && (
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 bg-gradient-to-t from-black/70 to-transparent">
                <p className="text-white text-sm md:text-lg font-medium">
                  {images[index].caption}
                </p>
              </div>
            )}
          </div>
        </Reveal>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="container-premium mt-6 md:mt-10">
          <div className="flex gap-2 md:gap-4 overflow-x-auto pb-2 scroll-premium">
            {images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => goTo(i)}
                className={
                  'relative aspect-[16/10] w-24 md:w-40 shrink-0 overflow-hidden rounded-lg md:rounded-xl transition-all ' +
                  (i === index
                    ? 'ring-2 ring-accent ring-offset-2 ring-offset-background'
                    : 'opacity-60 hover:opacity-100')
                }
                aria-label={`Фото ${i + 1}`}
                aria-current={i === index}
              >
                <img
                  src={img.url}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
