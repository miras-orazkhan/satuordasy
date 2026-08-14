import { requireAdmin } from '@/lib/session';
import { db } from '@/lib/db';
import { UsersTable } from '@/components/admin/users-table';
import { UserCreateDialog } from '@/components/admin/user-create-dialog';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  await requireAdmin();
  const users = await db.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  return (
    <div>
      <header className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Пользователи</p>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Пользователи админки</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Всего: <span className="font-medium text-foreground">{users.length}</span>
          </p>
        </div>
        <UserCreateDialog />
      </header>

      <UsersTable users={users} />
    </div>
  );
}
