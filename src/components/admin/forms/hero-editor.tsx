'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { updateHero } from '@/actions/content';
import { toast } from 'sonner';
import { MediaUploader } from '@/components/admin/media-uploader';

type Hero = {
  title: string;
  subtitle: string | null;
  ctaText: string;
  desktopImage: string | null;
  mobileImage: string | null;
};

export function HeroEditor({ hero, projectId }: { hero: Hero | null; projectId: string }) {
  const [pending, startTransition] = useTransition();
  const [desktopImage, setDesktopImage] = useState(hero?.desktopImage ?? '');
  const [mobileImage, setMobileImage] = useState(hero?.mobileImage ?? '');

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateHero(projectId, {
        title: String(fd.get('title') || ''),
        subtitle: String(fd.get('subtitle') || ''),
        ctaText: String(fd.get('ctaText') || 'Оставить заявку'),
        desktopImage,
        mobileImage,
      });
      if (res.ok) toast.success('Hero сохранён');
      else toast.error(res.error);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Hero — главный экран</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="hero-title">Заголовок (H1) *</Label>
            <Input id="hero-title" name="title" required defaultValue={hero?.title ?? ''} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="hero-subtitle">Подзаголовок</Label>
            <Textarea id="hero-subtitle" name="subtitle" rows={2} defaultValue={hero?.subtitle ?? ''} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="hero-cta">Текст кнопки</Label>
            <Input id="hero-cta" name="ctaText" defaultValue={hero?.ctaText ?? 'Оставить заявку'} className="mt-1.5" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-border">
            <div>
              <Label>Десктоп-фон</Label>
              <div className="mt-2">
                <MediaUploader value={desktopImage} onChange={setDesktopImage} accept="image/*" label="Десктоп-изображение (2400px)" />
              </div>
              {desktopImage && (
                <Input
                  className="mt-2 text-xs font-mono"
                  defaultValue={desktopImage}
                  readOnly
                />
              )}
            </div>
            <div>
              <Label>Мобильный фон</Label>
              <div className="mt-2">
                <MediaUploader value={mobileImage} onChange={setMobileImage} accept="image/*" label="Мобильное изображение (1200px)" />
              </div>
              {mobileImage && (
                <Input
                  className="mt-2 text-xs font-mono"
                  defaultValue={mobileImage}
                  readOnly
                />
              )}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Сохранить Hero
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
