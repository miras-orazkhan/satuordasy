'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { deleteUser } from '@/actions/admin';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

type User = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: Date;
};

export function UsersTable({ users }: { users: User[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const session = useSession();

  function onDelete(id: string, email: string) {
    if (session.data?.user?.email === email) {
      toast.error('Нельзя удалить самого себя');
      return;
    }
    if (!confirm('Удалить пользователя?')) return;
    startTransition(async () => {
      const res = await deleteUser(id);
      if (res.ok) {
        toast.success('Удалён');
        router.refresh();
      } else toast.error(res.error);
    });
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden bg-background">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
            <th className="py-3 px-4 font-medium">Имя</th>
            <th className="py-3 px-4 font-medium">Email</th>
            <th className="py-3 px-4 font-medium">Роль</th>
            <th className="py-3 px-4 font-medium hidden sm:table-cell">Создан</th>
            <th className="py-3 px-4 font-medium text-right"></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t border-border hover:bg-muted/30">
              <td className="py-3 px-4 font-medium">
                {u.name ?? '—'}
                {session.data?.user?.email === u.email && (
                  <span className="ml-2 text-xs text-muted-foreground">(вы)</span>
                )}
              </td>
              <td className="py-3 px-4 text-muted-foreground">{u.email}</td>
              <td className="py-3 px-4">
                <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                  {u.role === 'admin' ? 'Администратор' : 'Менеджер'}
                </Badge>
              </td>
              <td className="py-3 px-4 hidden sm:table-cell text-muted-foreground text-xs">
                {new Date(u.createdAt).toLocaleDateString('ru-RU')}
              </td>
              <td className="py-3 px-4 text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  disabled={pending || session.data?.user?.email === u.email}
                  onClick={() => onDelete(u.id, u.email)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
