'use client';

import { useState, useTransition, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Trash2, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { updateLeadStatus, deleteLead } from '@/actions/leads';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type Lead = {
  id: string;
  name: string;
  phone: string;
  comment: string | null;
  status: string;
  createdAt: Date;
  project: { title: string; slug: string };
};

const STATUS_LABELS: Record<string, string> = {
  new: 'Новая',
  in_progress: 'В работе',
  done: 'Обработана',
  rejected: 'Отклонена',
};

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-50 text-blue-700 border-blue-200',
  in_progress: 'bg-amber-50 text-amber-700 border-amber-200',
  done: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
};

export function LeadsTable({ leads }: { leads: Lead[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = leads.filter((l) => {
    if (filter !== 'all' && l.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        l.name.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        l.project.title.toLowerCase().includes(q)
      );
    }
    return true;
  });

  function onStatusChange(id: string, status: string) {
    startTransition(async () => {
      const res = await updateLeadStatus(id, status);
      if (res.ok) {
        toast.success('Статус обновлён');
        router.refresh();
      } else toast.error(res.error ?? 'Ошибка');
    });
  }

  function onDelete(id: string) {
    if (!confirm('Удалить заявку?')) return;
    startTransition(async () => {
      const res = await deleteLead(id);
      if (res.ok) {
        toast.success('Заявка удалена');
        router.refresh();
      } else toast.error(res.error ?? 'Ошибка');
    });
  }

  return (
    <div>
      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по имени, телефону, проекту"
            className="pl-9"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="new">Новые</SelectItem>
            <SelectItem value="in_progress">В работе</SelectItem>
            <SelectItem value="done">Обработанные</SelectItem>
            <SelectItem value="rejected">Отклонённые</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-xl">
          <p className="text-muted-foreground">Заявок не найдено</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden bg-background">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="py-3 px-4 font-medium">Имя</th>
                  <th className="py-3 px-4 font-medium">Телефон</th>
                  <th className="py-3 px-4 font-medium hidden md:table-cell">Проект</th>
                  <th className="py-3 px-4 font-medium hidden sm:table-cell">Дата</th>
                  <th className="py-3 px-4 font-medium">Статус</th>
                  <th className="py-3 px-4 font-medium text-right">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <Fragment key={l.id}>
                    <tr className="border-t border-border hover:bg-muted/30">
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setExpanded(expanded === l.id ? null : l.id)}
                          className="inline-flex items-center gap-2 font-medium hover:text-accent text-left"
                        >
                          {expanded === l.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                          {l.name}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground font-mono text-xs">{l.phone}</td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        <a
                          href={`/zhk/${l.project.slug}`}
                          target="_blank"
                          className="text-muted-foreground hover:text-accent inline-flex items-center gap-1"
                        >
                          {l.project.title}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </td>
                      <td className="py-3 px-4 hidden sm:table-cell text-muted-foreground text-xs">
                        {new Date(l.createdAt).toLocaleString('ru-RU', {
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
                            STATUS_COLORS[l.status]
                          )}
                        >
                          {STATUS_LABELS[l.status]}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Select
                          value={l.status}
                          onValueChange={(v) => onStatusChange(l.id, v)}
                          disabled={pending}
                        >
                          <SelectTrigger className="h-8 w-[150px] ml-auto text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">Новая</SelectItem>
                            <SelectItem value="in_progress">В работе</SelectItem>
                            <SelectItem value="done">Обработана</SelectItem>
                            <SelectItem value="rejected">Отклонена</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                    {expanded === l.id && (
                      <tr className="border-t border-border bg-muted/20">
                        <td colSpan={6} className="p-4">
                          <div className="space-y-2">
                            <div className="grid sm:grid-cols-3 gap-3 text-sm">
                              <div>
                                <p className="text-xs text-muted-foreground">Имя</p>
                                <p className="font-medium">{l.name}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Телефон</p>
                                <p className="font-medium font-mono">{l.phone}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Проект</p>
                                <p className="font-medium">{l.project.title}</p>
                              </div>
                            </div>
                            {l.comment && (
                              <div>
                                <p className="text-xs text-muted-foreground mt-3">Комментарий</p>
                                <p className="mt-1 text-sm bg-background border border-border rounded p-3">
                                  {l.comment}
                                </p>
                              </div>
                            )}
                            <div className="flex justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onDelete(l.id)}
                                disabled={pending}
                                className="text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Удалить заявку
                              </Button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
