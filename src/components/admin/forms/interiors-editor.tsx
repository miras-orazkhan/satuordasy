'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { addInterior, deleteInterior } from '@/actions/content';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { MediaUploader } from '@/components/admin/media-uploader';

type Interior = {
  id: string;
  imageUrl: string;
  caption: string | null;
  description: string | null;
};

export function InteriorsEditor({
  items,
  projectId,
}: {
  items: Interior[];
  projectId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [description, setDescription] = useState('');

  function onAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!imageUrl) {
      toast.error('Загрузите изображение интерьера');
      return;
    }
    startTransition(async () => {
      const res = await addInterior(projectId, {
        imageUrl,
        caption,
        description,
        sortOrder: items.length,
      });
      if (res.ok) {
        toast.success('Добавлено');
        setImageUrl('');
        setCaption('');
        setDescription('');
        router.refresh();
      } else toast.error(res.error);
    });
  }

  function onDelete(id: string) {
    startTransition(async () => {
      const res = await deleteInterior(id);
      if (res.ok) {
        toast.success('Удалено');
        router.refresh();
      } else toast.error(res.error);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Интерьеры ({items.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length > 0 && (
          <div className="space-y-2">
            {items.map((i) => (
              <div key={i.id} className="flex gap-3 p-3 rounded-lg border border-border">
                { }
                <img src={i.imageUrl} alt={i.caption ?? ''} className="h-16 w-16 object-cover rounded-md shrink-0" />
                <div className="flex-1 min-w-0">
                  {i.caption && <p className="font-medium text-sm">{i.caption}</p>}
                  {i.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{i.description}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => onDelete(i.id)}
                  disabled={pending}
                  className="text-destructive hover:bg-destructive/10 rounded-md p-1.5"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <details className="pt-4 border-t border-border">
          <summary className="cursor-pointer text-sm font-medium hover:text-accent">
            + Добавить интерьер
          </summary>
          <form onSubmit={onAdd} className="mt-3 space-y-3">
            <MediaUploader value={imageUrl} onChange={setImageUrl} accept="image/*" label="Загрузить изображение интерьера" />
            <div>
              <Label htmlFor="intr-caption" className="text-xs">Подпись</Label>
              <Input id="intr-caption" value={caption} onChange={(e) => setCaption(e.target.value)} className="mt-1" placeholder="Гостиная" />
            </div>
            <div>
              <Label htmlFor="intr-desc" className="text-xs">Описание (необязательно)</Label>
              <Textarea id="intr-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="mt-1" />
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
