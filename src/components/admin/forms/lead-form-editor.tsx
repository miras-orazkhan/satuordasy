'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { updateLeadFormConfig } from '@/actions/content';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

type LeadFormConfig = {
  id?: string;
  formType: string;
  bitrixPortalId: string | null;
  bitrixFormId: string | null;
  bitrixEmbedCode: string | null;
  sectionTitle: string | null;
  sectionSubtitle: string | null;
};

export function LeadFormEditor({
  config,
  projectId,
}: {
  config: LeadFormConfig | null;
  projectId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [formType, setFormType] = useState<'native' | 'bitrix24'>(
    (config?.formType as 'native' | 'bitrix24') ?? 'native'
  );
  const [mode, setMode] = useState<'simple' | 'code'>(
    config?.bitrixEmbedCode ? 'code' : 'simple'
  );

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateLeadFormConfig(projectId, {
        formType,
        bitrixPortalId: String(fd.get('bitrixPortalId') || ''),
        bitrixFormId: String(fd.get('bitrixFormId') || ''),
        bitrixEmbedCode: String(fd.get('bitrixEmbedCode') || ''),
        sectionTitle: String(fd.get('sectionTitle') || ''),
        sectionSubtitle: String(fd.get('sectionSubtitle') || ''),
      });
      if (res.ok) toast.success('Настройки формы сохранены');
      else toast.error(res.error);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Форма заявки</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Form type toggle */}
          <div>
            <Label className="text-xs">Тип формы</Label>
            <div className="mt-1.5 flex gap-1 rounded-md border border-border p-1">
              <button
                type="button"
                onClick={() => setFormType('native')}
                className={`flex-1 px-3 py-1.5 text-xs rounded ${formType === 'native' ? 'bg-secondary text-foreground' : 'text-muted-foreground'}`}
              >
                Встроенная форма
              </button>
              <button
                type="button"
                onClick={() => setFormType('bitrix24')}
                className={`flex-1 px-3 py-1.5 text-xs rounded ${formType === 'bitrix24' ? 'bg-secondary text-foreground' : 'text-muted-foreground'}`}
              >
                Виджет Bitrix24
              </button>
            </div>
            {formType === 'native' && (
              <p className="text-xs text-muted-foreground mt-1">
                Стандартная форма: имя, телефон, комментарий. Заявки сохраняются в БД и доступны в разделе «Заявки».
              </p>
            )}
            {formType === 'bitrix24' && (
              <p className="text-xs text-muted-foreground mt-1">
                Виджет Bitrix24 CRM: заявки будут отправляться напрямую в ваш Bitrix24. Стандартная форма скрывается.
              </p>
            )}
          </div>

          {/* Section text (always shown) */}
          <div className="grid sm:grid-cols-2 gap-3 pt-2 border-t border-border">
            <div>
              <Label htmlFor="lf-title" className="text-xs">Заголовок секции</Label>
              <Input
                id="lf-title"
                name="sectionTitle"
                defaultValue={config?.sectionTitle ?? ''}
                placeholder={formType === 'bitrix24' ? 'Получить консультацию' : 'Оставьте заявку на просмотр'}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="lf-subtitle" className="text-xs">Подзаголовок секции</Label>
              <Input
                id="lf-subtitle"
                name="sectionSubtitle"
                defaultValue={config?.sectionSubtitle ?? ''}
                placeholder="Заполните форму — менеджер перезвонит в течение 30 минут"
                className="mt-1"
              />
            </div>
          </div>

          {/* Bitrix24 config */}
          {formType === 'bitrix24' && (
            <div className="pt-4 border-t border-border space-y-3">
              <div>
                <Label className="text-xs">Способ настройки</Label>
                <div className="mt-1.5 flex gap-1 rounded-md border border-border p-1">
                  <button
                    type="button"
                    onClick={() => setMode('simple')}
                    className={`flex-1 px-3 py-1.5 text-xs rounded ${mode === 'simple' ? 'bg-secondary text-foreground' : 'text-muted-foreground'}`}
                  >
                    По Portal ID + Form ID
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('code')}
                    className={`flex-1 px-3 py-1.5 text-xs rounded ${mode === 'code' ? 'bg-secondary text-foreground' : 'text-muted-foreground'}`}
                  >
                    Полный код встраивания
                  </button>
                </div>
              </div>

              {mode === 'simple' && (
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="lf-portal" className="text-xs">Bitrix24 Portal ID</Label>
                    <Input
                      id="lf-portal"
                      name="bitrixPortalId"
                      defaultValue={config?.bitrixPortalId ?? ''}
                      placeholder="b35129330"
                      className="mt-1 font-mono text-xs"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Число после <code>bitrix24.kz/</code> в URL вашего портала. Например: <code>b35129330</code>.
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="lf-formid" className="text-xs">Bitrix24 Form ID</Label>
                    <Input
                      id="lf-formid"
                      name="bitrixFormId"
                      defaultValue={config?.bitrixFormId ?? ''}
                      placeholder="12"
                      className="mt-1 font-mono text-xs"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Число из <code>loader_XX.js</code> и <code>data-b24-form=&quot;inline/XX/...&quot;</code>.
                    </p>
                  </div>
                </div>
              )}

              {mode === 'code' && (
                <div>
                  <Label htmlFor="lf-embed" className="text-xs">Полный код встраивания Bitrix24</Label>
                  <Textarea
                    id="lf-embed"
                    name="bitrixEmbedCode"
                    rows={10}
                    defaultValue={config?.bitrixEmbedCode ?? ''}
                    placeholder={`<script data-b24-form="inline/12/dc506k" data-skip-moving="true">
(function(w,d,u){
var s=d.createElement('script');s.async=true;s.src=u+'?'+(Date.now()/180000|0);
var h=d.getElementsByTagName('script')[0];h.parentNode.insertBefore(s,h);
})(window,document,'https://cdn-ru.bitrix24.kz/b35129330/crm/form/loader_12.js');
</script>`}
                    className="mt-1 font-mono text-xs"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Вставьте код как есть из Bitrix24 → CRM → Формы → Встроить форму.
                    Переопределяет Portal ID / Form ID, если они заданы выше.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button type="submit" size="sm" disabled={pending}>
              {pending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Сохранить настройки формы
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
