import Link from 'next/link';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/session';
import { getAllProjectsForAdmin } from '@/lib/queries';
import { ProjectsTableClient } from '@/components/admin/projects-table-client';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  await requireAdmin();
  const projects = await getAllProjectsForAdmin();

  return (
    <div>
      <header className="mb-6 md:mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
            Проекты
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            ЖК-проекты
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Всего: <span className="font-medium text-foreground">{projects.length}</span>
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/projects/new">
            <Plus className="h-4 w-4 mr-1.5" />
            Новый проект
          </Link>
        </Button>
      </header>

      {projects.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl">
          <p className="text-muted-foreground">Пока нет проектов.</p>
        </div>
      ) : (
        <ProjectsTableClient projects={projects} />
      )}
    </div>
  );
}
