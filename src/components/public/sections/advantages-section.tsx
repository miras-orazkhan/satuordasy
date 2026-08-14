import { Reveal } from '@/components/public/reveal';
import {
  Sparkles,
  Mountain,
  Lock,
  ConciergeBell,
  Trees,
  GraduationCap,
  Waves,
  Car,
  Image as ImageIcon,
} from 'lucide-react';

type Advantage = {
  id: string;
  title: string;
  description: string;
  icon: string | null;
};

export function AdvantagesSection({ items }: { items: Advantage[] }) {
  if (!items.length) return null;

  return (
    <section id="advantages" aria-labelledby="advantages-title" className="py-16 md:py-32">
      <div className="container-premium">
        <Reveal>
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-3">
            Преимущества
          </p>
          <h2
            id="advantages-title"
            className="text-3xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-balance max-w-3xl"
          >
            Почему выбирают нас
          </h2>
        </Reveal>

        <div className="mt-12 md:mt-20 grid grid-cols-1 md:grid-cols-2 gap-px bg-border rounded-3xl overflow-hidden border border-border">
          {items.map((item, i) => (
            <Reveal key={item.id} delay={i * 0.05}>
              <AdvantageCard item={item} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function AdvantageCard({ item }: { item: Advantage }) {
  return (
    <div className="bg-background p-8 md:p-12 h-full flex flex-col">
      <div className="inline-flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
        <AdvantageIcon name={item.icon} />
      </div>
      <h3 className="mt-6 md:mt-8 text-xl md:text-2xl font-semibold tracking-tight">
        {item.title}
      </h3>
      <p className="mt-3 text-muted-foreground text-base md:text-lg leading-relaxed text-balance">
        {item.description}
      </p>
    </div>
  );
}

const ICON_CLASS = 'h-6 w-6 md:h-7 md:w-7';

/**
 * Render the correct Lucide icon based on the curated name whitelist.
 * Uses switch-based JSX return to satisfy React Compiler's static-components rule.
 */
function AdvantageIcon({ name }: { name: string | null }) {
  switch (name) {
    case 'Mountain':
      return <Mountain className={ICON_CLASS} strokeWidth={1.5} />;
    case 'Lock':
      return <Lock className={ICON_CLASS} strokeWidth={1.5} />;
    case 'Sparkles':
      return <Sparkles className={ICON_CLASS} strokeWidth={1.5} />;
    case 'ConciergeBell':
      return <ConciergeBell className={ICON_CLASS} strokeWidth={1.5} />;
    case 'Trees':
      return <Trees className={ICON_CLASS} strokeWidth={1.5} />;
    case 'GraduationCap':
      return <GraduationCap className={ICON_CLASS} strokeWidth={1.5} />;
    case 'Waves':
      return <Waves className={ICON_CLASS} strokeWidth={1.5} />;
    case 'Car':
      return <Car className={ICON_CLASS} strokeWidth={1.5} />;
    default:
      if (name && name.startsWith('custom:')) return <ImageIcon className={ICON_CLASS} strokeWidth={1.5} />;
      return <Sparkles className={ICON_CLASS} strokeWidth={1.5} />;
  }
}
