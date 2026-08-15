'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import {
  addFloorPlanCategory,
  deleteFloorPlanCategory,
  addFloorPlanUnit,
  deleteFloorPlanUnit,
} from '@/actions/content';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { MediaUploader } from '@/components/admin/media-uploader';

type FloorUnit = { id: string; name: string | null; area: number; imageUrl: string | null };
type FloorCategory = { id: string; name: string; units: FloorUnit[] };

export function FloorPlansEditor({
  categories,
  projectId,
}: {
  categories: FloorCategory[];
  projectId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [newCat, setNewCat] = useState('');
  const [expandedCat, setExpandedCat] = useState<string | null>(categories[0]?.id ?? null);
  // imageUrl state per category (for the add-unit form)
  const [unitImages, setUnitImages] = useState<Record<string, string>>({});

  function onAddCat(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!newCat.trim()) return;
    startTransition(async () => {
      const res = await addFloorPlanCategory(projectId, { name: newCat.trim(), sortOrder: categories.length });
      if (res.ok) {
        toast.success('Категория добавлена');
        setNewCat('');
        router.refresh();
      } else toast.error(res.error);
    });
  }

  function onDelCat(id: string) {
    if (!confirm('Удалить категорию со всеми планировками?')) return;
    startTransition(async () => {
      const res = await deleteFloorPlanCategory(id);
      if (res.ok) {
        toast.success('Удалено');
        router.refresh();
      } else toast.error(res.error);
    });
  }

  function onAddUnit(catId: string, e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const imageUrl = unitImages[catId] ?? '';
    startTransition(async () => {
      const res = await addFloorPlanUnit(catId, {
        name: String(fd.get('name') || ''),
        area: String(fd.get('area') || '0'),
        imageUrl,
        sortOrder: 0,
      });
      if (res.ok) {
        toast.success('Планировка добавлена');
        (e.target as HTMLFormElement).reset();
        setUnitImages((prev) => ({ ...prev, [catId]: '' }));
        router.refresh();
      } else toast.error(res.error);
    });
  }

  function onDelUnit(id: string) {
    startTransition(async () => {
      const res = await deleteFloorPlanUnit(id);
      if (res.ok) {
        toast.success('Удалено');
        router.refresh();
      } else toast.error(res.error);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Планировки — категории ({categories.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">
          Категории задаются произвольно для каждого ЖК (студия / 1-к / 2-к / пентхаус — любой набор).
        </p>

        {categories.length > 0 && (
          <div className="space-y-2">
            {categories.map((c) => (
              <div key={c.id} className="rounded-lg border border-border overflow-hidden">
                <div className="flex items-center justify-between p-3 bg-muted/30">
                  <button
                    type="button"
                    className="flex-1 text-left font-medium text-sm flex items-center justify-between"
                    onClick={() => setExpandedCat(expandedCat === c.id ? null : c.id)}
                  >
                    <span>{c.name}</span>
                    <span className="text-xs text-muted-foreground">{c.units.length} шт.</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelCat(c.id)}
                    disabled={pending}
                    className="text-destructive hover:bg-destructive/10 rounded-md p-1.5 ml-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {expandedCat === c.id && (
                  <div className="p-3 space-y-3 bg-background">
                    {c.units.length > 0 && (
                      <ul className="space-y-1">
                        {c.units.map((u) => (
                          <li key={u.id} className="flex items-center gap-3 p-2 rounded border border-border text-sm">
                            {u.imageUrl ? (
                               
                              <img src={u.imageUrl} alt="" className="h-12 w-12 object-cover rounded" />
                            ) : null}
                            <span className="flex-1">
                              {u.name && <span className="font-medium">{u.name}</span>}
                              {u.name && <span className="text-muted-foreground"> · </span>}
                              <span className="text-muted-foreground">{u.area} м²</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => onDelUnit(u.id)}
                              disabled={pending}
                              className="text-destructive hover:bg-destructive/10 rounded-md p-1"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                    <form onSubmit={(e) => onAddUnit(c.id, e)} className="space-y-3 pt-2 border-t border-border">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
                        <div className="sm:col-span-2">
                          <Label className="text-xs">Название</Label>
                          <Input name="name" placeholder="1-комнатная" className="mt-1" />
                        </div>
                        <div>
                          <Label className="text-xs">Площадь (м²)</Label>
                          <Input name="area" type="number" step="0.1" placeholder="64.5" className="mt-1" />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">Изображение планировки (необязательно)</Label>
                        <div className="mt-1.5">
                          <MediaUploader
                            value={unitImages[c.id] ?? ''}
                            onChange={(url) => setUnitImages((prev) => ({ ...prev, [c.id]: url }))}
                            accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                            label="Загрузить изображение планировки"
                          />
                        </div>
                      </div>
                      <Button type="submit" size="sm" disabled={pending}>
                        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
                        Добавить планировку
                      </Button>
                    </form>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <form onSubmit={onAddCat} className="flex items-end gap-2 pt-4 border-t border-border">
          <div className="flex-1">
            <Label htmlFor="cat-name" className="text-xs">Новая категория</Label>
            <Input
              id="cat-name"
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              placeholder="Студии / 1-комнатные / Пентхаусы"
              className="mt-1"
            />
          </div>
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
            Добавить категорию
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
