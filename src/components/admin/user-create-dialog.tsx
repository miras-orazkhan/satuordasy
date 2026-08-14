'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Loader2 } from 'lucide-react';
import { createUser } from '@/actions/admin';
import { toast } from 'sonner';

export function UserCreateDialog() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createUser({
        email: String(fd.get('email') || ''),
        name: String(fd.get('name') || ''),
        role: (String(fd.get('role') || 'manager') as 'admin' | 'manager'),
        password: String(fd.get('password') || ''),
      });
      if (res.ok) {
        toast.success('Пользователь создан');
        setOpen(false);
        router.refresh();
      } else {
        setErrors(res.fieldErrors ?? {});
        toast.error(res.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-1.5" />
          Новый пользователь
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Создать пользователя</DialogTitle>
          <DialogDescription>
            Менеджер видит только раздел «Заявки». Админ — полный доступ.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required className="mt-1.5" />
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email[0]}</p>}
          </div>
          <div>
            <Label htmlFor="name">Имя (необязательно)</Label>
            <Input id="name" name="name" className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="role">Роль</Label>
            <Select name="role" defaultValue="manager">
              <SelectTrigger id="role" className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manager">Менеджер (только заявки)</SelectItem>
                <SelectItem value="admin">Администратор (полный доступ)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="password">Пароль</Label>
            <Input id="password" name="password" type="password" required className="mt-1.5" />
            {errors.password && <p className="text-xs text-destructive mt-1">{errors.password[0]}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
              Отмена
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Создать
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
