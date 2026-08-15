'use client';

import { useState, useTransition } from 'react';
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
  customIconSvg: string | null;
  sortOrder: number;
};

type CustomIcon = {
  id: string;
  name: string;
  svgMarkup: string;
};

const ICON_OPTIONS = [
  'Mountain', 'Lock', 'Sparkles', 'ConciergeBell', 'Trees',
  'GraduationCap', 'Waves', 'Car',
];

export function AdvantagesEditor({
  items,
  projectId,
  customIcons = [],
}: {
  items: Advantage[];
  projectId: string;
  customIcons?: CustomIcon[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  // 'curated' = use Lucide icon from dropdown
  // 'custom'   = paste custom SVG markup
  // 'library'  = pick from saved custom icons
  const [iconMode, setIconMode] = useState<'curated' | 'custom' | 'library'>('curated');
  const [customSvg, setCustomSvg] = useState('');

  function onAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    let icon = '';
    let customIconSvg = '';

    if (iconMode === 'curated') {
      icon = String(fd.get('icon') || 'Sparkles');
    } else if (iconMode === 'custom') {
      customIconSvg = customSvg;
    } else if (iconMode === 'library') {
      // library icon name is stored in `icon` field as `library:<name>`
      const libChoice = String(fd.get('libraryIcon') || '');
      if (libChoice) {
        // store the full SVG markup directly so it renders without DB lookup later
        const found = customIcons.find((c) => c.id === libChoice);
        if (found) {
          customIconSvg = found.svgMarkup;
        }
      }
    }

    startTransition(async () => {
      const res = await addAdvantage(projectId, {
        title: String(fd.get('title') || ''),
        description: String(fd.get('description') || ''),
        icon,
        customIconSvg,
        sortOrder: items.length,
      });
      if (res.ok) {
        toast.success('Добавлено');
        (e.target as HTMLFormElement).reset();
        setCustomSvg('');
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
                <div className="h-10 w-10 shrink-0 rounded-lg bg-accent/10 text-accent flex items-center justify-center overflow-hidden [&_svg]:w-5 [&_svg]:h-5">
                  {a.customIconSvg ? (
                    <div dangerouslySetInnerHTML={{ __html: a.customIconSvg }} />
                  ) : (
                    <span className="text-xs font-mono">{a.icon?.slice(0, 4) ?? '—'}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{a.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.description}</p>
                  <p className="text-xs text-muted-foreground/70 mt-1 font-mono">
                    {a.customIconSvg ? 'custom SVG' : `icon: ${a.icon || '—'}`}
                  </p>
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

            {/* Icon mode selector */}
            <div>
              <Label className="text-xs">Тип иконки</Label>
              <div className="mt-1.5 flex gap-1 rounded-md border border-border p-1">
                <button
                  type="button"
                  onClick={() => setIconMode('curated')}
                  className={`flex-1 px-3 py-1.5 text-xs rounded ${iconMode === 'curated' ? 'bg-secondary text-foreground' : 'text-muted-foreground'}`}
                >
                  Из библиотеки
                </button>
                <button
                  type="button"
                  onClick={() => setIconMode('custom')}
                  className={`flex-1 px-3 py-1.5 text-xs rounded ${iconMode === 'custom' ? 'bg-secondary text-foreground' : 'text-muted-foreground'}`}
                >
                  Свой SVG
                </button>
                {customIcons.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIconMode('library')}
                    className={`flex-1 px-3 py-1.5 text-xs rounded ${iconMode === 'library' ? 'bg-secondary text-foreground' : 'text-muted-foreground'}`}
                  >
                    Из моих
                  </button>
                )}
              </div>
            </div>

            {iconMode === 'curated' && (
              <div>
                <Label htmlFor="adv-icon">Иконка из библиотеки Lucide</Label>
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
                  Курируемый список базовых иконок
                </p>
              </div>
            )}

            {iconMode === 'custom' && (
              <div>
                <Label htmlFor="adv-svg">SVG-разметка</Label>
                <Textarea
                  id="adv-svg"
                  rows={5}
                  required={iconMode === 'custom'}
                  placeholder='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="..."/></svg>'
                  value={customSvg}
                  onChange={(e) => setCustomSvg(e.target.value)}
                  className="mt-1.5 font-mono text-xs"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Вставьте полный SVG-код. Иконка будет отображаться в фирменном цвете (accent).
                  Загрузите SVG из Figma/Illustrator или скопируйте с Lucide/Tabler/Heroicons.
                </p>
                {customSvg && customSvg.includes('<svg') && (
                  <div className="mt-2 p-3 rounded-lg border border-border bg-accent/5 text-accent inline-flex">
                    <div
                      className="h-8 w-8 [&_svg]:w-full [&_svg]:h-full"
                      dangerouslySetInnerHTML={{ __html: customSvg }}
                    />
                  </div>
                )}
              </div>
            )}

            {iconMode === 'library' && customIcons.length > 0 && (
              <div>
                <Label htmlFor="adv-lib">Выбрать из сохранённых</Label>
                <Select name="libraryIcon" defaultValue={customIcons[0]?.id}>
                  <SelectTrigger id="adv-lib" className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {customIcons.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Сохранённые SVG-иконки (управляются в разделе «Настройки»)
                </p>
              </div>
            )}

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
