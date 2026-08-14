'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { updateAbout, addNearbyObject, deleteNearbyObject } from '@/actions/content';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

type NearbyObject = { id: string; name: string; distance: string; sortOrder: number };
type About = {
  id: string;
  description: string;
  mapEmbedUrl: string | null;
  mapLat: number | null;
  mapLng: number | null;
  nearby: NearbyObject[];
} | null;

export function AboutEditor({ about, projectId }: { about: About; projectId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateAbout(projectId, {
        description: String(fd.get('description') || ''),
        mapEmbedUrl: String(fd.get('mapEmbedUrl') || ''),
        mapLat: String(fd.get('mapLat') || ''),
        mapLng: String(fd.get('mapLng') || ''),
      });
      if (res.ok) toast.success('Раздел «О ЖК» сохранён');
      else toast.error(res.error);
    });
  }

  function onAddNearby(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (!about) return;
    startTransition(async () => {
      const res = await addNearbyObject(about.id, {
        name: String(fd.get('name') || ''),
        distance: String(fd.get('distance') || ''),
        sortOrder: about.nearby.length,
      });
      if (res.ok) {
        toast.success('Объект добавлен');
        (e.target as HTMLFormElement).reset();
        router.refresh();
      } else toast.error(res.error);
    });
  }

  function onDeleteNearby(id: string) {
    startTransition(async () => {
      const res = await deleteNearbyObject(id);
      if (res.ok) {
        toast.success('Удалено');
        router.refresh();
      } else toast.error(res.error);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">О проекте + карта + инфраструктура</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="about-desc">Описание</Label>
            <Textarea id="about-desc" name="description" rows={5} required defaultValue={about?.description ?? ''} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="about-map">URL карты (iframe embed)</Label>
            <Input id="about-map" name="mapEmbedUrl" defaultValue={about?.mapEmbedUrl ?? ''} className="mt-1.5" />
            <p className="text-xs text-muted-foreground mt-1">
              Яндекс.Карты: «Поделиться» → «HTML-код» → извлеките URL из <code>src</code>
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="about-lat">Широта</Label>
              <Input id="about-lat" name="mapLat" type="number" step="any" defaultValue={about?.mapLat ?? ''} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="about-lng">Долгота</Label>
              <Input id="about-lng" name="mapLng" type="number" step="any" defaultValue={about?.mapLng ?? ''} className="mt-1.5" />
            </div>
          </div>
          <Button type="submit" size="sm" disabled={pending}>
            {pending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
            Сохранить
          </Button>
        </form>

        <div className="pt-4 border-t border-border">
          <h4 className="text-sm font-medium mb-3">Инфраструктура рядом ({about?.nearby.length ?? 0})</h4>
          {about && about.nearby.length > 0 && (
            <ul className="space-y-2 mb-3">
              {about.nearby.map((n) => (
                <li key={n.id} className="flex items-center gap-3 p-2 rounded-lg border border-border">
                  <span className="flex-1 text-sm">{n.name}</span>
                  <span className="text-xs text-muted-foreground">{n.distance}</span>
                  <button
                    type="button"
                    onClick={() => onDeleteNearby(n.id)}
                    disabled={pending}
                    className="text-destructive hover:bg-destructive/10 rounded-md p-1.5"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <details>
            <summary className="cursor-pointer text-sm font-medium hover:text-accent">
              + Добавить объект инфраструктуры
            </summary>
            <form onSubmit={onAddNearby} className="mt-3 grid sm:grid-cols-3 gap-2 items-end">
              <div className="sm:col-span-2">
                <Label htmlFor="nearby-name">Название</Label>
                <Input id="nearby-name" name="name" required className="mt-1.5" placeholder="м. Охотный ряд" />
              </div>
              <div>
                <Label htmlFor="nearby-dist">Расстояние</Label>
                <Input id="nearby-dist" name="distance" required className="mt-1.5" placeholder="5 мин пешком" />
              </div>
              <Button type="submit" size="sm" disabled={pending} className="sm:col-span-3">
                {pending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
                Добавить
              </Button>
            </form>
          </details>
        </div>
      </CardContent>
    </Card>
  );
}
