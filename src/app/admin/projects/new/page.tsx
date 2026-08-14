'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { createProject } from '@/actions/projects';
import { THEME_PRESETS, FONT_PRESETS } from '@/lib/theme-presets';
import { toast } from 'sonner';

export default function NewProjectPage() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    const fd = new FormData(e.currentTarget);
    const input = {
      slug: String(fd.get('slug') || ''),
      title: String(fd.get('title') || ''),
      status: (String(fd.get('status') || 'draft') as 'draft' | 'published'),
      themePreset: String(fd.get('themePreset') || 'noir'),
      fontPreset: String(fd.get('fontPreset') || 'inter'),
      seoTitle: String(fd.get('seoTitle') || ''),
      seoDescription: String(fd.get('seoDescription') || ''),
      seoKeywords: String(fd.get('seoKeywords') || ''),
      ogImageUrl: String(fd.get('ogImageUrl') || ''),
      geoRegion: String(fd.get('geoRegion') || ''),
      geoCity: String(fd.get('geoCity') || ''),
      geoLat: String(fd.get('geoLat') || ''),
      geoLng: String(fd.get('geoLng') || ''),
    };
    startTransition(async () => {
      const res = await createProject(input);
      if (res.ok) {
        toast.success('Проект создан');
        router.push(`/admin/projects/${res.id}`);
      } else {
        setErrors(res.fieldErrors ?? {});
        toast.error(res.error);
      }
    });
  }

  return (
    <div>
      <header className="mb-6">
        <Link
          href="/admin/projects"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Все проекты
        </Link>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Новый проект ЖК</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Базовые настройки. Контент секций редактируется на следующей странице.
        </p>
      </header>

      <form onSubmit={onSubmit} className="space-y-6 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Основное</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label htmlFor="title">Название ЖК *</Label>
              <Input id="title" name="title" required className="mt-1.5" placeholder="VELA Tower" />
              {errors.title && <p className="text-xs text-destructive mt-1">{errors.title[0]}</p>}
            </div>
            <div>
              <Label htmlFor="slug">Slug *</Label>
              <Input id="slug" name="slug" required className="mt-1.5 font-mono" placeholder="vela-tower" />
              <p className="text-xs text-muted-foreground mt-1">URL: /zhk/<span className="font-mono">slug</span></p>
              {errors.slug && <p className="text-xs text-destructive mt-1">{errors.slug[0]}</p>}
            </div>
            <div>
              <Label htmlFor="status">Статус</Label>
              <Select name="status" defaultValue="draft">
                <SelectTrigger id="status" className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Черновик</SelectItem>
                  <SelectItem value="published">Опубликовано</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Оформление</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="themePreset">Цветовой пресет</Label>
              <Select name="themePreset" defaultValue="noir">
                <SelectTrigger id="themePreset" className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {THEME_PRESETS.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      <span className="inline-flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full border border-border"
                          style={{ backgroundColor: p.swatches.accent }}
                        />
                        {p.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Курируемые пары, прошедшие проверку контраста WCAG AA
              </p>
            </div>
            <div>
              <Label htmlFor="fontPreset">Шрифт</Label>
              <Select name="fontPreset" defaultValue="inter">
                <SelectTrigger id="fontPreset" className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_PRESETS.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">SEO / GEO</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label htmlFor="seoTitle">SEO Title</Label>
              <Input id="seoTitle" name="seoTitle" className="mt-1.5" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="seoDescription">SEO Description</Label>
              <Textarea id="seoDescription" name="seoDescription" rows={3} className="mt-1.5" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="seoKeywords">Ключевые слова (через запятую)</Label>
              <Input id="seoKeywords" name="seoKeywords" className="mt-1.5" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="ogImageUrl">OG Image URL</Label>
              <Input id="ogImageUrl" name="ogImageUrl" type="url" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="geoRegion">Регион</Label>
              <Input id="geoRegion" name="geoRegion" className="mt-1.5" placeholder="Москва" />
            </div>
            <div>
              <Label htmlFor="geoCity">Город</Label>
              <Input id="geoCity" name="geoCity" className="mt-1.5" placeholder="Москва" />
            </div>
            <div>
              <Label htmlFor="geoLat">Широта</Label>
              <Input id="geoLat" name="geoLat" type="number" step="any" className="mt-1.5" placeholder="55.7558" />
            </div>
            <div>
              <Label htmlFor="geoLng">Долгота</Label>
              <Input id="geoLng" name="geoLng" type="number" step="any" className="mt-1.5" placeholder="37.6173" />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button asChild variant="outline">
            <Link href="/admin/projects">Отмена</Link>
          </Button>
          <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Создать проект
          </Button>
        </div>
      </form>
    </div>
  );
}
