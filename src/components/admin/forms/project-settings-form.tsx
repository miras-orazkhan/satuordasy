'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { updateProject } from '@/actions/projects';
import { THEME_PRESETS, FONT_PRESETS } from '@/lib/theme-presets';
import { toast } from 'sonner';

type Project = {
  id: string;
  slug: string;
  title: string;
  status: string;
  themePreset: string;
  fontPreset: string;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  ogImageUrl: string | null;
  geoRegion: string | null;
  geoCity: string | null;
  geoLat: number | null;
  geoLng: number | null;
};

export function ProjectSettingsForm({ project }: { project: Project }) {
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
      const res = await updateProject(project.id, input);
      if (res.ok) toast.success('Сохранено');
      else {
        setErrors(res.fieldErrors ?? {});
        toast.error(res.error);
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Настройки проекта</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Label htmlFor="title">Название *</Label>
            <Input id="title" name="title" defaultValue={project.title} required className="mt-1.5" />
            {errors.title && <p className="text-xs text-destructive mt-1">{errors.title[0]}</p>}
          </div>
          <div>
            <Label htmlFor="slug">Slug *</Label>
            <Input id="slug" name="slug" defaultValue={project.slug} required className="mt-1.5 font-mono" />
            {errors.slug && <p className="text-xs text-destructive mt-1">{errors.slug[0]}</p>}
          </div>
          <div>
            <Label htmlFor="status">Статус</Label>
            <Select name="status" defaultValue={project.status}>
              <SelectTrigger id="status" className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Черновик</SelectItem>
                <SelectItem value="published">Опубликовано</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="themePreset">Цветовой пресет</Label>
            <Select name="themePreset" defaultValue={project.themePreset}>
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
          </div>
          <div>
            <Label htmlFor="fontPreset">Шрифт</Label>
            <Select name="fontPreset" defaultValue={project.fontPreset}>
              <SelectTrigger id="fontPreset" className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_PRESETS.map((f) => (
                  <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-2 mt-2 border-t border-border pt-4">
            <h3 className="text-sm font-medium mb-3">SEO</h3>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="seoTitle">SEO Title</Label>
            <Input id="seoTitle" name="seoTitle" defaultValue={project.seoTitle ?? ''} className="mt-1.5" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="seoDescription">SEO Description</Label>
            <Textarea id="seoDescription" name="seoDescription" rows={3} defaultValue={project.seoDescription ?? ''} className="mt-1.5" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="seoKeywords">Ключевые слова (через запятую)</Label>
            <Input id="seoKeywords" name="seoKeywords" defaultValue={project.seoKeywords ?? ''} className="mt-1.5" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="ogImageUrl">OG Image URL</Label>
            <Input id="ogImageUrl" name="ogImageUrl" type="url" defaultValue={project.ogImageUrl ?? ''} className="mt-1.5" />
          </div>

          <div className="sm:col-span-2 mt-2 border-t border-border pt-4">
            <h3 className="text-sm font-medium mb-3">GEO</h3>
          </div>
          <div>
            <Label htmlFor="geoRegion">Регион</Label>
            <Input id="geoRegion" name="geoRegion" defaultValue={project.geoRegion ?? ''} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="geoCity">Город</Label>
            <Input id="geoCity" name="geoCity" defaultValue={project.geoCity ?? ''} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="geoLat">Широта</Label>
            <Input id="geoLat" name="geoLat" type="number" step="any" defaultValue={project.geoLat ?? ''} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="geoLng">Долгота</Label>
            <Input id="geoLng" name="geoLng" type="number" step="any" defaultValue={project.geoLng ?? ''} className="mt-1.5" />
          </div>

          <div className="sm:col-span-2 flex justify-end mt-2">
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Сохранить настройки
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
