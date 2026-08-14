'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { addAdvantage, deleteAdvantage } from '@/actions/content';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Advantage = {
  id: string;
  title: string;
  description: string;
  icon: string | null;
  sortOrder: number;
};

const ICON_OPTIONS = [
  'Mountain', 'Lock', 'Sparkles', 'ConciergeBell', 'Trees',
  'GraduationCap', 'Waves', 'Car',
];

export function AdvantagesEditor({
  items,
  projectId,
}: {
  items: Advantage[];
  projectId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await addAdvantage(projectId, {
        title: String(fd.get('title') || ''),
        description: String(fd.get('description') || ''),
        icon: String(fd.get('icon') || ''),
        sortOrder: items.length,
      });
      if (res.ok) {
        toast.success('Добавлено');
        (e.target as HTMLFormElement).reset();
        router.refresh();
      } else toast.error(res.error);
    });
  }

  function onDelete(id: string) {
    if (!confirm('Удалить преимущество?')) return;
    startTransition(async () => {
      const res = await deleteAdvantage(id);
      if (res.ok) {
        toast.success('Удалено');
        router.refresh();
      } else toast.error(res.error);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Преимущества ({items.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length > 0 && (
          <ul className="space-y-2">
            {items.map((a) => (
              <li
                key={a.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-border bg-background"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{a.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.description}</p>
                  {a.icon && <p className="text-xs text-muted-foreground/70 mt-1 font-mono">icon: {a.icon}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => onDelete(a.id)}
                  disabled={pending}
                  className="text-destructive hover:bg-destructive/10 rounded-md p-1.5"
                  aria-label="Удалить"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <details className="border-t border-border pt-4">
          <summary className="cursor-pointer text-sm font-medium hover:text-accent">
            + Добавить преимущество
          </summary>
          <form onSubmit={onAdd} className="mt-3 space-y-3">
            <div>
              <Label htmlFor="adv-title">Заголовок</Label>
              <Input id="adv-title" name="title" required className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="adv-desc">Описание</Label>
              <Textarea id="adv-desc" name="description" rows={2} required className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="adv-icon">Иконка</Label>
              <Select name="icon" defaultValue="Sparkles">
                <SelectTrigger id="adv-icon" className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ICON_OPTIONS.map((i) => (
                    <SelectItem key={i} value={i}>{i}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Курируемый список из встроенной библиотеки Lucide
              </p>
            </div>
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
              Добавить
            </Button>
          </form>
        </details>
      </CardContent>
    </Card>
  );
}
