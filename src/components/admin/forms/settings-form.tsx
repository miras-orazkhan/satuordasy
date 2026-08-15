'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { updateSettings } from '@/actions/admin';
import { toast } from 'sonner';
import { MediaUploader } from '@/components/admin/media-uploader';

type Props = {
  initial: Record<string, string>;
};

export function SettingsForm({ initial }: Props) {
  const [pending, startTransition] = useTransition();
  const [faviconUrl, setFaviconUrl] = useState(initial.faviconUrl ?? '');
  const [robotsAllowAll, setRobotsAllowAll] = useState(initial.robotsAllowAll === 'true');

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateSettings({
        faviconUrl,
        gtmContainerId: String(fd.get('gtmContainerId') || ''),
        robotsAllowAll,
        robotsCustomRules: String(fd.get('robotsCustomRules') || ''),
        geoDefaultRegion: String(fd.get('geoDefaultRegion') || ''),
        geoDefaultCity: String(fd.get('geoDefaultCity') || ''),
        brandName: String(fd.get('brandName') || 'Satu Ordasy'),
      });
      if (res.ok) toast.success('Настройки сохранены');
      else {
        toast.error(res.error);
        if (res.fieldErrors) {
          for (const [k, v] of Object.entries(res.fieldErrors)) {
            toast.error(`${k}: ${v[0]}`);
          }
        }
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Бренд, GTM, SEO/robots</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="brandName">Название бренда</Label>
            <Input id="brandName" name="brandName" defaultValue={initial.brandName ?? 'Satu Ordasy'} className="mt-1.5" />
            <p className="text-xs text-muted-foreground mt-1">Показывается в шапке и подвале сайта</p>
          </div>

          <div className="pt-4 border-t border-border">
            <h3 className="text-sm font-medium mb-3">Favicon (единый для всей платформы)</h3>
            <MediaUploader
              value={faviconUrl}
              onChange={setFaviconUrl}
              accept="image/svg+xml,image/png,image/x-icon,.ico,.svg,.png"
              label="Загрузить favicon"
            />
            {faviconUrl && (
              <Input className="mt-2 font-mono text-xs" defaultValue={faviconUrl} readOnly />
            )}
          </div>

          <div className="pt-4 border-t border-border">
            <h3 className="text-sm font-medium mb-3">Google Tag Manager</h3>
            <div>
              <Label htmlFor="gtm">GTM Container ID</Label>
              <Input
                id="gtm"
                name="gtmContainerId"
                defaultValue={initial.gtmContainerId ?? ''}
                className="mt-1.5 font-mono"
                placeholder="GTM-XXXXXXX"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Код GTM вставляется на всех страницах через SSR (единая точка вставки).
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <h3 className="text-sm font-medium mb-3">robots.txt</h3>
            <div className="flex items-center justify-between py-2">
              <div>
                <Label htmlFor="robotsAllow">Разрешить индексацию</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  При выкл. — robots.txt запрещает индексацию (для staging)
                </p>
              </div>
              <Switch
                id="robotsAllow"
                checked={robotsAllowAll}
                onCheckedChange={setRobotsAllowAll}
              />
            </div>
            <div>
              <Label htmlFor="robotsCustom">Дополнительные правила robots.txt</Label>
              <Textarea
                id="robotsCustom"
                name="robotsCustomRules"
                rows={4}
                defaultValue={initial.robotsCustomRules ?? ''}
                className="mt-1.5 font-mono text-xs"
                placeholder="Disallow: /admin"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <h3 className="text-sm font-medium mb-3">GEO-настройки по умолчанию</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="geo-region">Регион по умолчанию</Label>
                <Input id="geo-region" name="geoDefaultRegion" defaultValue={initial.geoDefaultRegion ?? ''} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="geo-city">Город по умолчанию</Label>
                <Input id="geo-city" name="geoDefaultCity" defaultValue={initial.geoDefaultCity ?? ''} className="mt-1.5" />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
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
