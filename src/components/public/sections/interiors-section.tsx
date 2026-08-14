import { Reveal } from '@/components/public/reveal';

type Interior = {
  id: string;
  imageUrl: string;
  caption: string | null;
  description: string | null;
};

export function InteriorsSection({ items }: { items: Interior[] }) {
  if (!items.length) return null;

  return (
    <section
      id="interiors"
      aria-labelledby="interiors-title"
      className="py-16 md:py-32 border-t border-border"
    >
      <div className="container-premium">
        <Reveal>
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-3">
            Интерьеры
          </p>
          <h2
            id="interiors-title"
            className="text-3xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-balance"
          >
            Авторские интерьеры
          </h2>
        </Reveal>

        <div className="mt-12 md:mt-16 space-y-12 md:space-y-20">
          {items.map((item, i) => (
            <Reveal key={item.id} delay={i * 0.05}>
              <article className="grid md:grid-cols-12 gap-6 md:gap-10 items-center">
                <div
                  className={
                    'md:col-span-8 ' + (i % 2 === 1 ? 'md:order-2' : '')
                  }
                >
                  <div className="relative aspect-[4/3] md:aspect-[16/10] overflow-hidden rounded-2xl md:rounded-3xl bg-muted">
                    <img
                      src={item.imageUrl}
                      alt={item.caption ?? 'Интерьер'}
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
                <div
                  className={
                    'md:col-span-4 ' + (i % 2 === 1 ? 'md:order-1' : '')
                  }
                >
                  {item.caption && (
                    <h3 className="text-2xl md:text-3xl font-semibold tracking-tight">
                      {item.caption}
                    </h3>
                  )}
                  {item.description && (
                    <p className="mt-4 text-muted-foreground text-base md:text-lg leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
