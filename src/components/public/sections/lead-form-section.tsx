'use client';

import { useState, useTransition } from 'react';
import { leadSchema } from '@/lib/validations';
import { submitLead } from '@/actions/leads';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2, Check } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { BitrixFormWidget } from '@/components/public/bitrix-form-widget';

type LeadFormConfig = {
  formType: string;
  bitrixPortalId: string | null;
  bitrixFormId: string | null;
  bitrixEmbedCode: string | null;
  sectionTitle: string | null;
  sectionSubtitle: string | null;
};

export function LeadFormSection({
  projectId,
  config,
}: {
  projectId: string;
  config?: LeadFormConfig | null;
}) {
  const isBitrix = config?.formType === 'bitrix24' &&
    (config.bitrixEmbedCode || (config.bitrixPortalId && config.bitrixFormId));

  const sectionTitle = config?.sectionTitle ||
    (isBitrix ? 'Получить консультацию' : 'Оставьте заявку на просмотр');
  const sectionSubtitle = config?.sectionSubtitle ||
    'Заполните форму — менеджер перезвонит в течение 30 минут в рабочее время. Консультация бесплатная и ни к чему не обязывает.';

  return (
    <section
      id="leads-form"
      aria-labelledby="leads-title"
      className="py-16 md:py-32 border-t border-border scroll-mt-20"
      tabIndex={-1}
    >
      <div className="container-premium">
        <div className="grid lg:grid-cols-2 gap-10 md:gap-16 items-start">
          <div>
            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-3">
              Заявка
            </p>
            <h2
              id="leads-title"
              className="text-3xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-balance"
            >
              {sectionTitle}
            </h2>
            <p className="mt-5 md:mt-8 text-muted-foreground text-base md:text-lg leading-relaxed max-w-md">
              {sectionSubtitle}
            </p>
          </div>

          <div>
            {isBitrix ? (
              <BitrixFormWidget
                portalId={config!.bitrixPortalId ?? ''}
                formId={config!.bitrixFormId ?? ''}
                embedCode={config!.bitrixEmbedCode}
              />
            ) : (
              <NativeLeadForm projectId={projectId} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function NativeLeadForm({ projectId }: { projectId: string }) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    const fd = new FormData(e.currentTarget);
    const data = {
      projectId,
      name: String(fd.get('name') || ''),
      phone: String(fd.get('phone') || ''),
      comment: String(fd.get('comment') || ''),
      consent: fd.get('consent') === 'on' || fd.get('consent') === 'true',
    };

    // Client-side Zod validation (mirrors server-side)
    const parsed = leadSchema.safeParse(data);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as string;
        if (!errs[key]) errs[key] = issue.message;
      }
      setErrors(errs);
      toast.error('Проверьте введённые данные');
      return;
    }

    startTransition(async () => {
      const result = await submitLead(parsed.data);
      if (result.ok) {
        setDone(true);
        toast.success('Заявка отправлена', {
          description: 'Мы свяжемся с вами в ближайшее время.',
        });
        (e.target as HTMLFormElement).reset();
      } else {
        if (result.fieldErrors) {
          const e2: Record<string, string> = {};
          for (const [k, v] of Object.entries(result.fieldErrors)) {
            if (v?.length) e2[k] = v[0];
          }
          setErrors(e2);
        }
        toast.error(result.error);
      }
    });
  }

  if (done) {
    return (
      <div className="rounded-2xl md:rounded-3xl border border-border p-8 md:p-12 text-center bg-card">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent mb-4">
          <Check className="h-7 w-7" strokeWidth={2} />
        </div>
        <h3 className="text-2xl font-semibold tracking-tight">Заявка отправлена</h3>
        <p className="mt-2 text-muted-foreground">
          Мы свяжемся с вами в ближайшее время.
        </p>
        <Button
          variant="outline"
          className="mt-6 rounded-full"
          onClick={() => setDone(false)}
        >
          Отправить ещё одну
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl md:rounded-3xl border border-border p-6 md:p-8 bg-card space-y-5"
      noValidate
    >
      <div>
        <Label htmlFor="lead-name">Имя</Label>
        <Input
          id="lead-name"
          name="name"
          className="mt-1.5"
          autoComplete="name"
          placeholder="Как к вам обращаться"
          aria-invalid={!!errors.name}
        />
        {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
      </div>

      <div>
        <Label htmlFor="lead-phone">Телефон</Label>
        <Input
          id="lead-phone"
          name="phone"
          className="mt-1.5"
          type="tel"
          autoComplete="tel"
          placeholder="+7 (___) ___-__-__"
          aria-invalid={!!errors.phone}
        />
        {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
      </div>

      <div>
        <Label htmlFor="lead-comment">Комментарий (необязательно)</Label>
        <Textarea
          id="lead-comment"
          name="comment"
          className="mt-1.5 resize-none"
          rows={3}
          placeholder="Когда удобно позвонить, какие вопросы вас интересуют"
        />
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <Checkbox
          name="consent"
          id="lead-consent"
          className="mt-0.5"
          aria-invalid={!!errors.consent}
        />
        <span className="text-sm text-muted-foreground leading-relaxed">
          Я согласен с{' '}
          <Link href="/privacy" className="text-foreground underline underline-offset-2 hover:text-accent">
            политикой конфиденциальности
          </Link>{' '}
          и обработкой персональных данных
        </span>
      </label>
      {errors.consent && (
        <p className="text-sm text-destructive -mt-2">{errors.consent}</p>
      )}

      <Button
        type="submit"
        className="w-full rounded-full h-12"
        disabled={pending}
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Отправляем…
          </>
        ) : (
          'Отправить заявку'
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Нажимая кнопку, вы соглашаетесь с политикой обработки персональных данных.
      </p>
    </form>
  );
}
