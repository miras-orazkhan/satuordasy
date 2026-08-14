import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/session';
import { getProjectForAdmin } from '@/lib/queries';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProjectSettingsForm } from '@/components/admin/forms/project-settings-form';
import { HeroEditor } from '@/components/admin/forms/hero-editor';
import { AboutEditor } from '@/components/admin/forms/about-editor';
import { AdvantagesEditor } from '@/components/admin/forms/advantages-editor';
import { GalleryEditor } from '@/components/admin/forms/gallery-editor';
import { FloorPlansEditor } from '@/components/admin/forms/floor-plans-editor';
import { InteriorsEditor } from '@/components/admin/forms/interiors-editor';
import { CatalogEditor } from '@/components/admin/forms/catalog-editor';
import { SocialLinksEditor } from '@/components/admin/forms/social-links-editor';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };

export default async function EditProjectPage({ params }: Params) {
  await requireAdmin();
  const { id } = await params;
  const project = await getProjectForAdmin(id);
  if (!project) notFound();

  return (
    <div className="space-y-8">
      <header>
        <Link
          href="/admin/projects"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Все проекты
        </Link>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{project.title}</h1>
              {project.status === 'published' ? (
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Опубликован</Badge>
              ) : (
                <Badge variant="secondary">Черновик</Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-2 text-sm font-mono">/zhk/{project.slug}</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href={`/zhk/${project.slug}`} target="_blank">
              <ExternalLink className="h-4 w-4 mr-1.5" /> Открыть страницу
            </Link>
          </Button>
        </div>
      </header>

      <ProjectSettingsForm project={project} />
      <HeroEditor hero={project.hero} projectId={project.id} />
      <AdvantagesEditor items={project.advantages} projectId={project.id} />
      <AboutEditor about={project.about} projectId={project.id} />
      <GalleryEditor items={project.gallery} projectId={project.id} />
      <FloorPlansEditor categories={project.floorCategories} projectId={project.id} />
      <InteriorsEditor items={project.interiors} projectId={project.id} />
      <CatalogEditor catalog={project.catalog} projectId={project.id} />
      <SocialLinksEditor items={project.socials} projectId={project.id} />
    </div>
  );
}
