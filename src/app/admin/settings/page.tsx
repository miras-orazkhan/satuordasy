import { requireAdmin } from '@/lib/session';
import { getSettings, getPrivacyPolicy, getHomePage, listCustomIcons } from '@/lib/settings';
import { db } from '@/lib/db';
import { SettingsForm } from '@/components/admin/forms/settings-form';
import { PrivacyForm } from '@/components/admin/forms/privacy-form';
import { GlobalSocialsEditor } from '@/components/admin/forms/global-socials-editor';
import { HomePageForm } from '@/components/admin/forms/home-page-form';
import { CustomIconsManager } from '@/components/admin/forms/custom-icons-manager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  await requireAdmin();
  const [settings, privacy, home, socials, customIcons] = await Promise.all([
    getSettings(),
    getPrivacyPolicy(),
    getHomePage(),
    db.socialLink.findMany({
      where: { projectId: null },
      orderBy: { sortOrder: 'asc' },
    }),
    listCustomIcons(),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Настройки</p>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Глобальные настройки</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Применяются ко всему сайту (главная страница, бренд, GTM, robots.txt и т.д.)
        </p>
      </header>

      <HomePageForm initial={home} />
      <SettingsForm initial={settings} />
      <CustomIconsManager icons={customIcons} />
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
