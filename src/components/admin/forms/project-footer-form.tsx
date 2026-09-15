'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, RotateCcw } from 'lucide-react';
import { updateProjectFooter, resetProjectFooter } from '@/actions/projects';
import { toast } from 'sonner';
import type { FooterData } from '@/lib/settings';

type ProjectFooterRow = {
  phone: string | null;
  email: string | null;
  address: string | null;
  legalName: string | null;
  bin: string | null;
  iik: string | null;
  bankName: string | null;
  bic: string | null;
  workingHours: string | null;
  copyrightText: string | null;
  disclaimer: string | null;
} | null;

type Props = {
  projectId: string;
  projectFooter: ProjectFooterRow;
  globalFooter: FooterData;
};

/**
 * Per-project footer override form.
 *
 * Lets the admin override any of the global footer fields for THIS specific
 * project (e.g. a different sales office phone for one ЖК).
 *
 * Empty fields fall back to the global Footer singleton.
 * A "Сбросить" button removes the override entirely.
 *
 * Field placeholders show the current global fallback value so the admin
 * sees what they'd be overriding.
 */
export function ProjectFooterForm({ projectId, projectFooter, globalFooter }: Props) {
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateProjectFooter(projectId, {
        phone: String(fd.get('phone') || ''),
        email: String(fd.get('email') || ''),
        address: String(fd.get('address') || ''),
        legalName: String(fd.get('legalName') || ''),
        bin: String(fd.get('bin') || ''),
        iik: String(fd.get('iik') || ''),
        bankName: String(fd.get('bankName') || ''),
        bic: String(fd.get('bic') || ''),
        workingHours: String(fd.get('workingHours') || ''),
        copyrightText: String(fd.get('copyrightText') || ''),
        disclaimer: String(fd.get('disclaimer') || ''),
      });
      if (res.ok) toast.success('Подвал проекта сохранён');
      else toast.error(res.error || 'Не удалось сохранить');
    });
  }

  function onReset() {
    if (!confirm('Сбросить подвал проекта и использовать глобальный?')) return;
    startTransition(async () => {
      const res = await resetProjectFooter(projectId);
      if (res.ok) {
        toast.success('Подвал сброшен — используется глобальный');
        // Clear all inputs
        const form = document.querySelector('#project-footer-form') as HTMLFormElement | null;
        form?.reset();
      } else {
        toast.error(res.error || 'Не удалось сбросить');
      }
    });
  }

  // Helper to show placeholder from the global fallback value
  const ph = (val: string | null | undefined) => (val ? val : '');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg">Подвал проекта</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Переопределяет глобальный подвал для этого ЖК. Пустые поля берут значение из{' '}
              <a href="/admin/settings" className="underline">глобальных настроек</a>.
            </p>
          </div>
          {projectFooter && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onReset}
              disabled={pending}
              className="shrink-0"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Сбросить
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form id="project-footer-form" onSubmit={onSubmit} className="space-y-6">
          {/* Contacts */}
          <div>
            <h3 className="text-sm font-medium mb-3">Контакты</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="pf-phone">Телефон</Label>
                <Input
                  id="pf-phone"
                  name="phone"
                  defaultValue={projectFooter?.phone ?? ''}
                  className="mt-1.5"
                  placeholder={ph(globalFooter.phone) || '+7 700 000 00 00'}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Кликабельная ссылка <code>tel:</code>
                </p>
              </div>
              <div>
                <Label htmlFor="pf-email">Email</Label>
                <Input
                  id="pf-email"
                  name="email"
                  type="email"
                  defaultValue={projectFooter?.email ?? ''}
                  className="mt-1.5"
                  placeholder={ph(globalFooter.email) || 'info@example.com'}
                />
              </div>
              <div>
                <Label htmlFor="pf-address">Адрес офиса</Label>
                <Input
                  id="pf-address"
                  name="address"
                  defaultValue={projectFooter?.address ?? ''}
                  className="mt-1.5"
                  placeholder={ph(globalFooter.address) || 'г. Шымкент, ул. Абая, 1'}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Например, адрес отдела продаж конкретно этого ЖК
                </p>
              </div>
              <div>
                <Label htmlFor="pf-hours">Часы работы</Label>
                <Input
                  id="pf-hours"
                  name="workingHours"
                  defaultValue={projectFooter?.workingHours ?? ''}
                  className="mt-1.5"
                  placeholder={ph(globalFooter.workingHours) || 'Пн–Пт 9:00–18:00'}
                />
              </div>
            </div>
          </div>

          {/* Legal */}
          <div className="pt-4 border-t border-border">
            <h3 className="text-sm font-medium mb-3">Реквизиты (override)</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="pf-legal">Юр. наименование</Label>
                <Input
                  id="pf-legal"
                  name="legalName"
                  defaultValue={projectFooter?.legalName ?? ''}
                  className="mt-1.5"
                  placeholder={ph(globalFooter.legalName) || 'ТОО «Satu Ordasy»'}
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="pf-bin">БИН / ИНН</Label>
                  <Input
                    id="pf-bin"
                    name="bin"
                    defaultValue={projectFooter?.bin ?? ''}
                    className="mt-1.5 font-mono"
                    placeholder={ph(globalFooter.bin) || '123456789012'}
                  />
                </div>
                <div>
                  <Label htmlFor="pf-bic">БИК</Label>
                  <Input
                    id="pf-bic"
                    name="bic"
                    defaultValue={projectFooter?.bic ?? ''}
                    className="mt-1.5 font-mono"
                    placeholder={ph(globalFooter.bic) || 'SABCKZKA'}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="pf-iik">ИИК</Label>
                <Input
                  id="pf-iik"
                  name="iik"
                  defaultValue={projectFooter?.iik ?? ''}
                  className="mt-1.5 font-mono"
                  placeholder={ph(globalFooter.iik) || 'KZ00 000 000 000 000 0000'}
                />
              </div>
              <div>
                <Label htmlFor="pf-bank">Банк</Label>
                <Input
                  id="pf-bank"
                  name="bankName"
                  defaultValue={projectFooter?.bankName ?? ''}
                  className="mt-1.5"
                  placeholder={ph(globalFooter.bankName) || 'АО «Народный Банк»'}
                />
              </div>
            </div>
          </div>

          {/* Misc */}
          <div className="pt-4 border-t border-border">
            <h3 className="text-sm font-medium mb-3">Текст</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="pf-copyright">Копирайт</Label>
                <Input
                  id="pf-copyright"
                  name="copyrightText"
                  defaultValue={projectFooter?.copyrightText ?? ''}
                  className="mt-1.5"
                  placeholder={ph(globalFooter.copyrightText) || `© ${new Date().getFullYear()} Satu Ordasy. Все права защищены.`}
                />
              </div>
              <div>
                <Label htmlFor="pf-disclaimer">Дисклеймер</Label>
                <Textarea
                  id="pf-disclaimer"
                  name="disclaimer"
                  rows={2}
                  defaultValue={projectFooter?.disclaimer ?? ''}
                  className="mt-1.5"
                  placeholder={ph(globalFooter.disclaimer) || 'Информация на сайте носит ознакомительный характер...'}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Сохранить подвал проекта
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
