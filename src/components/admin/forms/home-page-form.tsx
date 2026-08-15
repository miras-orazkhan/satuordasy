'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { updateHomePage } from '@/actions/admin';
import { toast } from 'sonner';
import { MediaUploader } from '@/components/admin/media-uploader';

type HomeData = {
  title: string;
  subtitle: string | null;
  heroImage: string | null;
  logoUrl: string | null;
};

export function HomePageForm({ initial }: { initial: HomeData }) {
  const [pending, startTransition] = useTransition();
  const [heroImage, setHeroImage] = useState(initial.heroImage ?? '');
  const [logoUrl, setLogoUrl] = useState(initial.logoUrl ?? '');

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateHomePage({
        title: String(fd.get('title') || ''),
        subtitle: String(fd.get('subtitle') || '') || null,
        heroImage: heroImage || null,
        logoUrl: logoUrl || null,
      });
      if (res.ok) toast.success('Главная страница сохранена');
      else toast.error(res.error);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Главная страница</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="home-title">Название сайта (показывается в шапке и Hero)</Label>
            <Input
              id="home-title"
              name="title"
              required
              defaultValue={initial.title}
              className="mt-1.5"
              placeholder="Satu Ordasy"
            />
          </div>
          <div>
            <Label htmlFor="home-subtitle">Подзаголовок на Hero</Label>
            <Textarea
              id="home-subtitle"
              name="subtitle"
              rows={2}
              defaultValue={initial.subtitle ?? ''}
              className="mt-1.5"
              placeholder="Архитектура, которая остаётся в памяти. Выберите проект, чтобы узнать детали."
            />
          </div>

          <div className="pt-4 border-t border-border">
            <Label>Логотип (показывается в шапке)</Label>
            <div className="mt-2">
              <MediaUploader
                value={logoUrl}
                onChange={setLogoUrl}
                accept="image/svg+xml,image/png,image/webp,image/jpeg,.svg,.png"
                label="Загрузить логотип (SVG/PNG)"
              />
            </div>
            {logoUrl && (
              <div className="mt-3 p-3 rounded-lg border border-border bg-muted/30">
                <p className="text-xs text-muted-foreground mb-2">Превью логотипа:</p>
                { }
                <img src={logoUrl} alt="Logo" className="h-10 w-auto" />
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-border">
            <Label>Hero-изображение (фон главного экрана)</Label>
            <div className="mt-2">
              <MediaUploader
                value={heroImage}
                onChange={setHeroImage}
                accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                label="Загрузить Hero-фон (2400×1600 рекомендуется)"
              />
            </div>
            {heroImage && (
              <div className="mt-3 p-3 rounded-lg border border-border bg-muted/30">
                <p className="text-xs text-muted-foreground mb-2">Превью Hero:</p>
                { }
                <img src={heroImage} alt="Hero" className="h-32 w-full object-cover rounded-md" />
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Сохранить главную страницу
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
