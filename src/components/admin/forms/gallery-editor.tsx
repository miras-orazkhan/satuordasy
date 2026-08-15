'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { addGalleryImage, deleteGalleryImage } from '@/actions/content';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { MediaUploader } from '@/components/admin/media-uploader';
import { CollapsibleForm } from '@/components/admin/collapsible-form';

type GalleryItem = { id: string; url: string; caption: string | null; sortOrder: number };

export function GalleryEditor({ items, projectId }: { items: GalleryItem[]; projectId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [url, setUrl] = useState('');
  const [caption, setCaption] = useState('');

  function onAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!url) {
      toast.error('Загрузите изображение');
      return;
    }
    startTransition(async () => {
      const res = await addGalleryImage(projectId, { url, caption, sortOrder: items.length });
      if (res.ok) {
        toast.success('Изображение добавлено');
        setUrl('');
        setCaption('');
        router.refresh();
      } else toast.error(res.error);
    });
  }

  function onDelete(id: string) {
    startTransition(async () => {
      const res = await deleteGalleryImage(id);
      if (res.ok) {
        toast.success('Удалено');
        router.refresh();
      } else toast.error(res.error);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Галерея ({items.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {items.map((g) => (
              <div key={g.id} className="relative aspect-square rounded-lg overflow-hidden border border-border group">
                { }
                <img src={g.url} alt={g.caption ?? ''} className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                  {g.caption && <p className="text-white text-xs line-clamp-2">{g.caption}</p>}
                  <button
                    type="button"
                    onClick={() => onDelete(g.id)}
                    disabled={pending}
                    className="mt-1 self-start text-white bg-red-500/80 hover:bg-red-500 rounded-md p-1"
                    aria-label="Удалить"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <CollapsibleForm label="Добавить изображение">
          <form onSubmit={onAdd} className="space-y-3">
            <MediaUploader value={url} onChange={setUrl} accept="image/*" label="Загрузить изображение (16:10 рекомендуется)" />
            <div>
              <Label htmlFor="gal-caption">Подпись (необязательно)</Label>
              <Input id="gal-caption" value={caption} onChange={(e) => setCaption(e.target.value)} className="mt-1.5" />
            </div>
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
              Добавить
            </Button>
          </form>
        </CollapsibleForm>
      </CardContent>
    </Card>
  );
}
