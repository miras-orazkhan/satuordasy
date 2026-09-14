'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { updateFooter } from '@/actions/admin';
import { toast } from 'sonner';
import type { FooterData } from '@/lib/settings';

type Props = {
  initial: FooterData;
};

export function FooterForm({ initial }: Props) {
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateFooter({
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
      if (res.ok) toast.success('Подвал сохранён');
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
        <CardTitle className="text-lg">Подвал сайта</CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Контакты, реквизиты и копирайт в подвале сайта. Заполняйте только нужные поля — пустые не отображаются.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Contacts */}
          <div>
            <h3 className="text-sm font-medium mb-3">Контакты</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="footer-phone">Телефон</Label>
                <Input
                  id="footer-phone"
                  name="phone"
                  defaultValue={initial.phone ?? ''}
                  className="mt-1.5"
                  placeholder="+7 700 000 00 00"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Будет кликабельной ссылкой <code>tel:</code>
                </p>
              </div>
              <div>
                <Label htmlFor="footer-email">Email</Label>
                <Input
                  id="footer-email"
                  name="email"
                  type="email"
                  defaultValue={initial.email ?? ''}
                  className="mt-1.5"
                  placeholder="info@example.com"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Будет кликабельной ссылкой <code>mailto:</code>
                </p>
              </div>
              <div>
                <Label htmlFor="footer-address">Адрес офиса</Label>
                <Input
                  id="footer-address"
                  name="address"
                  defaultValue={initial.address ?? ''}
                  className="mt-1.5"
                  placeholder="г. Шымкент, ул. Абая, 1"
                />
              </div>
              <div>
                <Label htmlFor="footer-hours">Часы работы</Label>
                <Input
                  id="footer-hours"
                  name="workingHours"
                  defaultValue={initial.workingHours ?? ''}
                  className="mt-1.5"
                  placeholder="Пн–Пт 9:00–18:00"
                />
              </div>
            </div>
          </div>

          {/* Legal info */}
          <div className="pt-4 border-t border-border">
            <h3 className="text-sm font-medium mb-3">Реквизиты компании</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="footer-legal">Юридическое наименование</Label>
                <Input
                  id="footer-legal"
                  name="legalName"
                  defaultValue={initial.legalName ?? ''}
                  className="mt-1.5"
                  placeholder="ТОО «Satu Ordasy»"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="footer-bin">БИН / ИНН</Label>
                  <Input
                    id="footer-bin"
                    name="bin"
                    defaultValue={initial.bin ?? ''}
                    className="mt-1.5 font-mono"
                    placeholder="123456789012"
                  />
                </div>
                <div>
                  <Label htmlFor="footer-bic">БИК / SWIFT</Label>
                  <Input
                    id="footer-bic"
                    name="bic"
                    defaultValue={initial.bic ?? ''}
                    className="mt-1.5 font-mono"
                    placeholder="SABCKZKA"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="footer-iik">ИИК (расчётный счёт)</Label>
                <Input
                  id="footer-iik"
                  name="iik"
                  defaultValue={initial.iik ?? ''}
                  className="mt-1.5 font-mono"
                  placeholder="KZ00 000 000 000 000 0000"
                />
              </div>
              <div>
                <Label htmlFor="footer-bank">Банк</Label>
                <Input
                  id="footer-bank"
                  name="bankName"
                  defaultValue={initial.bankName ?? ''}
                  className="mt-1.5"
                  placeholder="АО «Народный Банк Казахстана»"
                />
              </div>
            </div>
          </div>

          {/* Misc */}
          <div className="pt-4 border-t border-border">
            <h3 className="text-sm font-medium mb-3">Текст внизу</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="footer-copyright">Копирайт</Label>
                <Input
                  id="footer-copyright"
                  name="copyrightText"
                  defaultValue={initial.copyrightText ?? ''}
                  className="mt-1.5"
                  placeholder="© 2026 Satu Ordasy. Все права защищены."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Если пусто — используется стандартный: «© {new Date().getFullYear()} {brandName}. Все права защищены.»
                </p>
              </div>
              <div>
                <Label htmlFor="footer-disclaimer">Дисклеймер</Label>
                <Textarea
                  id="footer-disclaimer"
                  name="disclaimer"
                  rows={2}
                  defaultValue={initial.disclaimer ?? ''}
                  className="mt-1.5"
                  placeholder="Информация на сайте носит ознакомительный характер и не является публичной офертой."
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Сохранить подвал
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// Placeholder — replaced at runtime with actual brandName from settings
const brandName = 'Satu Ordasy';
