'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

type ProjectItem = {
  slug: string;
  title: string;
  themePreset: string;
  subtitle: string;
  heroImage: string;
  description: string;
  swatches: { background: string; foreground: string; accent: string };
};

export function ProjectsTabs({ projects }: { projects: ProjectItem[] }) {
  const [active, setActive] = useState(0);
  const project = projects[active];
  if (!project) return null;

  return (
    <div>
      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Наши проекты"
        className="flex flex-wrap gap-2 mb-8 md:mb-12 border-b border-border pb-px"
      >
        {projects.map((p, i) => {
          const isActive = i === active;
          return (
            <button
              key={p.slug}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(i)}
              className={
                'relative px-4 md:px-6 py-3 md:py-4 text-sm md:text-base font-medium transition-colors ' +
                (isActive
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground')
              }
            >
              {p.title}
              {isActive && (
                <span
                  className="absolute left-0 right-0 -bottom-px h-0.5"
                  style={{ backgroundColor: p.swatches.accent }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Active project preview */}
      <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
        <Link
          href={`/zhk/${project.slug}`}
          className="group relative block aspect-[4/5] md:aspect-[3/4] overflow-hidden rounded-2xl bg-muted"
        >
          {project.heroImage && (
             
            <img
              src={project.heroImage}
              alt={project.title}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <div className="absolute top-4 right-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white transition-transform group-hover:scale-110">
            <ArrowUpRight className="h-5 w-5" />
          </div>
        </Link>

        <div className="flex flex-col">
          <h3 className="text-3xl md:text-5xl font-semibold tracking-tight">{project.title}</h3>
          {project.subtitle && (
            <p className="text-muted-foreground mt-4 text-base md:text-lg text-balance">
              {project.subtitle}
            </p>
          )}
          {project.description && (
            <p className="text-muted-foreground/80 mt-4 text-sm md:text-base leading-relaxed">
              {project.description}
            </p>
          )}

          <div className="mt-8 flex items-center gap-3">
            <Link
              href={`/zhk/${project.slug}`}
              className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-6 py-3 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Перейти к проекту <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
