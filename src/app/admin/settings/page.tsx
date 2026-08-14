import { requireAdmin } from '@/lib/session';
import { getSettings, getPrivacyPolicy } from '@/lib/settings';
import { db } from '@/lib/db';
import { SettingsForm } from '@/components/admin/forms/settings-form';
import { PrivacyForm } from '@/components/admin/forms/privacy-form';
import { GlobalSocialsEditor } from '@/components/admin/forms/global-socials-editor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  await requireAdmin();
  const settings = await getSettings();
  const privacy = await getPrivacyPolicy();
  const socials = await db.socialLink.findMany({
    where: { projectId: null },
    orderBy: { sortOrder: 'asc' },
  });

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Настройки</p>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Глобальные настройки</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Применяются ко всему сайту (/favicon, GTM, robots.txt и т.д.)
        </p>
      </header>

      <SettingsForm initial={settings} />
      <GlobalSocialsEditor items={socials} />
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Политика конфиденциальности</CardTitle>
        </CardHeader>
        <CardContent>
          <PrivacyForm initial={privacy} />
        </CardContent>
      </Card>
    </div>
  );
}
