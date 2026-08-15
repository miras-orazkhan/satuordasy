'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { createCustomIcon, deleteCustomIcon } from '@/actions/admin';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { CollapsibleForm } from '@/components/admin/collapsible-form';

type CustomIcon = {
  id: string;
  name: string;
  svgMarkup: string;
};

export function CustomIconsManager({ icons }: { icons: CustomIcon[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [svgInput, setSvgInput] = useState('');
  const [nameInput, setNameInput] = useState('');

  function onAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!nameInput.trim() || !svgInput.includes('<svg')) {
      toast.error('Имя и корректный SVG обязательны');
      return;
    }
    startTransition(async () => {
      const res = await createCustomIcon(nameInput.trim(), svgInput);
      if (res.ok) {
        toast.success('Иконка добавлена');
        setNameInput('');
        setSvgInput('');
        router.refresh();
      } else toast.error(res.error);
    });
  }

  function onDelete(id: string) {
    if (!confirm('Удалить иконку?')) return;
    startTransition(async () => {
      const res = await deleteCustomIcon(id);
      if (res.ok) {
        toast.success('Удалено');
        router.refresh();
      } else toast.error(res.error);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Библиотека SVG-иконок ({icons.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">
          Сохраняйте здесь свои SVG-иконки для использования в преимуществах ЖК.
          Источники: Lucide (https://lucide.dev), Tabler Icons, Heroicons, или собственные из Figma.
        </p>

        {icons.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {icons.map((icon) => (
              <div
                key={icon.id}
                className="relative group p-3 rounded-lg border border-border bg-background text-accent flex flex-col items-center gap-1"
              >
                <div
                  className="h-8 w-8 [&_svg]:w-full [&_svg]:h-full"
                  dangerouslySetInnerHTML={{ __html: icon.svgMarkup }}
                />
                <span className="text-xs text-muted-foreground truncate w-full text-center">
                  {icon.name}
                </span>
                <button
                  type="button"
                  onClick={() => onDelete(icon.id)}
                  disabled={pending}
                  className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Удалить"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <CollapsibleForm label="Добавить SVG-иконку">
          <form onSubmit={onAdd} className="space-y-3">
            <div>
              <Label htmlFor="icon-name">Имя (для отображения в списке)</Label>
              <Input
                id="icon-name"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                required
                className="mt-1.5"
                placeholder="Например: Wi-Fi, Pool, Parking"
              />
            </div>
            <div>
              <Label htmlFor="icon-svg">SVG-разметка</Label>
              <Textarea
                id="icon-svg"
                rows={5}
                required
                value={svgInput}
                onChange={(e) => setSvgInput(e.target.value)}
                placeholder='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="..."/></svg>'
                className="mt-1.5 font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Цвет stroke будет автоматически наследоваться (currentColor) — иконка окрасится в акцентный цвет.
              </p>
            </div>
            {svgInput.includes('<svg') && (
              <div className="p-3 rounded-lg border border-border bg-accent/5 text-accent inline-flex">
                <div
                  className="h-10 w-10 [&_svg]:w-full [&_svg]:h-full"
                  dangerouslySetInnerHTML={{ __html: svgInput }}
                />
              </div>
            )}
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
              Сохранить иконку
            </Button>
          </form>
        </CollapsibleForm>
      </CardContent>
    </Card>
  );
}
