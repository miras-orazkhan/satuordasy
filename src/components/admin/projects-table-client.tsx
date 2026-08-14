'use client';

import Link from 'next/link';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, ExternalLink, Trash2, Eye, EyeOff, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { deleteProject, toggleProjectStatus } from '@/actions/projects';
import { toast } from 'sonner';
import { getThemePreset } from '@/lib/theme-presets';

type Project = {
  id: string;
  slug: string;
  title: string;
  status: string;
  themePreset: string;
  fontPreset: string;
  createdAt: Date;
  updatedAt: Date;
  _count: { leads: number };
};

export function ProjectsTableClient({ projects }: { projects: Project[] }) {
  return (
    <div className="rounded-xl border border-border overflow-hidden bg-background">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="py-3 px-4 font-medium">Название</th>
              <th className="py-3 px-4 font-medium hidden sm:table-cell">Slug</th>
              <th className="py-3 px-4 font-medium">Тема</th>
              <th className="py-3 px-4 font-medium">Статус</th>
              <th className="py-3 px-4 font-medium hidden md:table-cell">Заявок</th>
              <th className="py-3 px-4 font-medium hidden md:table-cell">Обновлён</th>
              <th className="py-3 px-4 font-medium text-right"></th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <ProjectRow key={p.id} project={p} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProjectRow({ project }: { project: Project }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const theme = getThemePreset(project.themePreset);

  const onToggle = () => {
    startTransition(async () => {
      const res = await toggleProjectStatus(project.id);
      if (res.ok) {
        toast.success(project.status === 'published' ? 'Снят с публикации' : 'Опубликован');
        router.refresh();
      } else {
        toast.error(res.error ?? 'Ошибка');
      }
    });
  };

  const onDelete = () => {
    if (!confirm(`Удалить проект «${project.title}»? Все связанные данные будут удалены.`)) return;
    startTransition(async () => {
      const res = await deleteProject(project.id);
      if (res.ok) {
        toast.success('Проект удалён');
        router.refresh();
      } else {
        toast.error(res.error ?? 'Ошибка');
      }
    });
  };

  return (
    <tr className="border-t border-border hover:bg-muted/30">
      <td className="py-3 px-4">
        <Link
          href={`/admin/projects/${project.id}`}
          className="font-medium hover:text-accent transition-colors"
        >
          {project.title}
        </Link>
      </td>
      <td className="py-3 px-4 hidden sm:table-cell text-muted-foreground font-mono text-xs">
        {project.slug}
      </td>
      <td className="py-3 px-4">
        <span className="inline-flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full border border-border"
            style={{ backgroundColor: theme.swatches.accent }}
            aria-hidden
          />
          <span className="text-xs">{project.themePreset}</span>
        </span>
      </td>
      <td className="py-3 px-4">
        {project.status === 'published' ? (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Опубликовано</Badge>
        ) : (
          <Badge variant="secondary">Черновик</Badge>
        )}
      </td>
      <td className="py-3 px-4 hidden md:table-cell text-muted-foreground">{project._count.leads}</td>
      <td className="py-3 px-4 hidden md:table-cell text-muted-foreground text-xs">
        {new Date(project.updatedAt).toLocaleDateString('ru-RU')}
      </td>
      <td className="py-3 px-4 text-right">
        <div className="flex items-center justify-end gap-1">
          <Button asChild variant="ghost" size="icon" className="h-8 w-8">
            <Link href={`/zhk/${project.slug}`} target="_blank">
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={pending}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Действия</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/admin/projects/${project.id}`}>
                  <Pencil className="h-4 w-4 mr-2" /> Редактировать
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onToggle}>
                {project.status === 'published' ? (
                  <><EyeOff className="h-4 w-4 mr-2" /> Снять с публикации</>
                ) : (
                  <><Eye className="h-4 w-4 mr-2" /> Опубликовать</>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" /> Удалить
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </td>
    </tr>
  );
}
