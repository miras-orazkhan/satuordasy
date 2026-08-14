'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { updatePrivacy } from '@/actions/admin';
import { toast } from 'sonner';

export function PrivacyForm({ initial }: { initial: string }) {
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updatePrivacy({ content: String(fd.get('content') || '') });
      if (res.ok) toast.success('Политика сохранена');
      else toast.error(res.error);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <Label htmlFor="privacy-content">Текст политики (Markdown-подобный)</Label>
        <Textarea
          id="privacy-content"
          name="content"
          rows={20}
          defaultValue={initial}
          className="mt-1.5 font-mono text-xs"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Используйте <code># Заголовок</code> и <code>## Подзаголовок</code>. Параграфы разделяйте пустой строкой.
        </p>
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        {pending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
        Сохранить
      </Button>
    </form>
  );
}
