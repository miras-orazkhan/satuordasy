import { Reveal } from '@/components/public/reveal';
import { MapPin } from 'lucide-react';

type NearbyObject = { id: string; name: string; distance: string };

type AboutProps = {
  description: string;
  mapEmbedUrl?: string | null;
  nearby: NearbyObject[];
};

export function AboutSection({ description, mapEmbedUrl, nearby }: AboutProps) {
  return (
    <section id="about" aria-labelledby="about-title" className="py-16 md:py-32 border-t border-border">
      <div className="container-premium">
        <div className="grid lg:grid-cols-2 gap-10 md:gap-16 items-start">
          <Reveal>
            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-3">
              О проекте
            </p>
            <h2
              id="about-title"
              className="text-3xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-balance"
            >
              Архитектура, которая говорит сама за себя
            </h2>
            <div className="mt-6 md:mt-8 space-y-4 text-base md:text-lg text-muted-foreground leading-relaxed">
              {description.split('\n').map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            {nearby.length > 0 && (
              <div className="mt-10 md:mt-12">
                <p className="text-sm text-muted-foreground uppercase tracking-wider mb-4">
                  Инфраструктура рядом
                </p>
                <ul className="divide-y divide-border border-y border-border">
                  {nearby.map((n) => (
                    <li
                      key={n.id}
                      className="py-3 flex items-center justify-between gap-4"
                    >
                      <span className="text-base md:text-lg">{n.name}</span>
                      <span className="text-sm md:text-base text-muted-foreground">
                        {n.distance}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Reveal>

          <Reveal delay={0.1}>
            {mapEmbedUrl ? (
              <div className="rounded-2xl md:rounded-3xl overflow-hidden border border-border bg-muted aspect-[4/3] md:aspect-square lg:aspect-[4/5]">
                <iframe
                  src={mapEmbedUrl}
                  className="w-full h-full"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Расположение ЖК на карте"
                />
              </div>
            ) : (
              <div className="rounded-2xl md:rounded-3xl border border-border bg-muted aspect-square flex items-center justify-center">
                <MapPin className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
