'use client';

import { useState } from 'react';
import { Reveal } from '@/components/public/reveal';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

type FloorUnit = { id: string; name: string | null; area: number; imageUrl: string | null };
type FloorCategory = { id: string; name: string; units: FloorUnit[] };
type Catalog = { fileUrl: string; fileName: string | null } | null;

export function FloorPlansSection({
  categories,
  catalog,
}: {
  categories: FloorCategory[];
  catalog: Catalog;
}) {
  const [active, setActive] = useState(categories[0]?.id ?? null);
  const activeCategory = categories.find((c) => c.id === active) ?? categories[0];

  if (!categories.length) return null;

  return (
    <section
      id="plans"
      aria-labelledby="plans-title"
      className="py-16 md:py-32 border-t border-border"
    >
      <div className="container-premium">
        <Reveal>
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-3">
            Планировки
          </p>
          <h2
            id="plans-title"
            className="text-3xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-balance"
          >
            Квартиры под ваш образ жизни
          </h2>
        </Reveal>

        {/* Tabs — категории произвольные, задаются админом */}
        <div
          role="tablist"
          aria-label="Категории планировок"
          className="mt-8 md:mt-12 flex flex-wrap gap-2 border-b border-border"
        >
          {categories.map((c) => {
            const isActive = c.id === active;
            return (
              <button
                key={c.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActive(c.id)}
                className={
                  'relative px-4 md:px-6 py-3 text-sm md:text-base font-medium transition-colors ' +
                  (isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground')
                }
              >
                {c.name}
                <span className="ml-2 text-xs text-muted-foreground/60">({c.units.length})</span>
                {isActive && (
                  <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-accent" />
                )}
              </button>
            );
          })}
        </div>

        {/* Cards */}
        {activeCategory && activeCategory.units.length > 0 ? (
          <div className="mt-8 md:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {activeCategory.units.map((unit, i) => (
              <Reveal key={unit.id} delay={i * 0.04}>
                <article className="group h-full rounded-2xl md:rounded-3xl border border-border overflow-hidden bg-card hover:shadow-lg hover:shadow-black/[0.03] transition-all">
                  <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                    {unit.imageUrl ? (
                      <img
                        src={unit.imageUrl}
                        alt={unit.name ?? 'Планировка'}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
                        Нет изображения
                      </div>
                    )}
                  </div>
                  <div className="p-5 md:p-6">
                    {unit.name && (
                      <h3 className="text-lg md:text-xl font-semibold tracking-tight">
                        {unit.name}
                      </h3>
                    )}
                    <p className="mt-1 text-muted-foreground">
                      Площадь:{' '}
                      <span className="font-semibold text-foreground">
                        {unit.area.toLocaleString('ru-RU')} м²
                      </span>
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="mt-8 md:mt-12 py-12 text-center text-muted-foreground">
            В этой категории пока нет планировок
          </div>
        )}

        {/* Catalog download — общая для всех вкладок */}
        {catalog?.fileUrl && (
          <Reveal delay={0.1}>
            <div className="mt-12 md:mt-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 md:p-8 rounded-2xl md:rounded-3xl border border-border bg-secondary/30">
              <div>
                <h3 className="text-xl md:text-2xl font-semibold tracking-tight">
                  Скачать каталог планировок
                </h3>
                <p className="text-muted-foreground mt-1 text-sm md:text-base">
                  PDF со всеми планировками, ценами и условиями покупки
                  {catalog.fileName ? ` · ${catalog.fileName}` : ''}
                </p>
              </div>
              <Button asChild className="rounded-full" size="lg">
                <a href={catalog.fileUrl} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4 mr-2" />
                  Скачать каталог
                </a>
              </Button>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
