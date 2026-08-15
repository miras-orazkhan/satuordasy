'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { addSocialLink, deleteSocialLink } from '@/actions/content';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CollapsibleForm } from '@/components/admin/collapsible-form';

type Social = { id: string; platform: string; url: string; icon: string | null };
const ICON_OPTIONS = ['Send', 'Instagram', 'Youtube', 'Linkedin', 'Facebook', 'Twitter'];

export function GlobalSocialsEditor({ items = [] }: { items?: Social[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await addSocialLink({
        platform: String(fd.get('platform') || ''),
        url: String(fd.get('url') || ''),
        icon: String(fd.get('icon') || ''),
        sortOrder: items.length,
        projectId: null,
      });
      if (res.ok) {
        toast.success('Добавлено');
        (e.target as HTMLFormElement).reset();
        router.refresh();
      } else toast.error(res.error);
    });
  }

  function onDelete(id: string) {
    startTransition(async () => {
      const res = await deleteSocialLink(id);
      if (res.ok) {
        toast.success('Удалено');
        router.refresh();
      } else toast.error(res.error);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Глобальные соцсети ({items.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">
          Используются по умолчанию в подвале всех страниц, если у ЖК нет своих соцсетей.
        </p>

        {items.length > 0 && (
          <ul className="space-y-2">
            {items.map((s) => (
              <li key={s.id} className="flex items-center gap-3 p-2 rounded-lg border border-border text-sm">
                <span className="font-mono text-xs text-muted-foreground">{s.icon ?? '—'}</span>
                <span className="flex-1 font-medium">{s.platform}</span>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-muted-foreground hover:text-accent truncate max-w-[40%]"
                >
                  {s.url}
                </a>
                <button
                  type="button"
                  onClick={() => onDelete(s.id)}
                  disabled={pending}
                  className="text-destructive hover:bg-destructive/10 rounded-md p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <CollapsibleForm label="Добавить глобальную соцсеть">
          <form onSubmit={onAdd} className="grid sm:grid-cols-3 gap-2 items-end">
            <div>
              <Label className="text-xs">Платформа</Label>
              <Input name="platform" required placeholder="Telegram" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">URL</Label>
              <Input name="url" required type="url" placeholder="https://t.me/..." className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Иконка</Label>
              <Select name="icon" defaultValue="Send">
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ICON_OPTIONS.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" size="sm" disabled={pending} className="sm:col-span-3">
              {pending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
              Добавить
            </Button>
          </form>
        </CollapsibleForm>
      </CardContent>
    </Card>
  );
}
