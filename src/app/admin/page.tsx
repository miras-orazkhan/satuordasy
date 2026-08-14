import Link from 'next/link';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/session';
import { Building2, Inbox, ArrowUpRight, Activity } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const user = await requireUser();

  const [projectsCount, publishedCount, leadsCount, newLeadsCount] = await Promise.all([
    db.project.count(),
    db.project.count({ where: { status: 'published' } }),
    db.lead.count(),
    db.lead.count({ where: { status: 'new' } }),
  ]);

  const recentLeads = await db.lead.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { project: { select: { title: true, slug: true } } },
  });

  return (
    <div>
      <header className="mb-8 md:mb-12">
        <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
          Дашборд
        </p>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
          Здравствуйте, {user.name}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Роль: <span className="font-medium text-foreground">{user.role === 'admin' ? 'Администратор' : 'Менеджер'}</span>
        </p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-10">
        <StatCard
          icon={<Building2 className="h-5 w-5" />}
          label="Всего проектов"
          value={projectsCount}
          href="/admin/projects"
          linkLabel="Все проекты"
        />
        <StatCard
          icon={<Activity className="h-5 w-5" />}
          label="Опубликовано"
          value={publishedCount}
          accent="positive"
        />
        <StatCard
          icon={<Inbox className="h-5 w-5" />}
          label="Новые заявки"
          value={newLeadsCount}
          href="/admin/leads"
          linkLabel="Перейти"
          accent="accent"
        />
        <StatCard
          icon={<Inbox className="h-5 w-5" />}
          label="Всего заявок"
          value={leadsCount}
        />
      </div>

      {/* Recent leads */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight">Последние заявки</h2>
          <Link
            href="/admin/leads"
            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            Все заявки <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        {recentLeads.length === 0 ? (
          <p className="text-muted-foreground text-sm">Заявок пока нет.</p>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden bg-background">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="py-3 px-4 font-medium">Имя</th>
                  <th className="py-3 px-4 font-medium hidden sm:table-cell">Телефон</th>
                  <th className="py-3 px-4 font-medium hidden md:table-cell">Проект</th>
                  <th className="py-3 px-4 font-medium hidden sm:table-cell">Дата</th>
                  <th className="py-3 px-4 font-medium">Статус</th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.map((lead) => (
                  <tr key={lead.id} className="border-t border-border hover:bg-muted/30">
                    <td className="py-3 px-4 font-medium">{lead.name}</td>
                    <td className="py-3 px-4 hidden sm:table-cell text-muted-foreground">{lead.phone}</td>
                    <td className="py-3 px-4 hidden md:table-cell text-muted-foreground">{lead.project.title}</td>
                    <td className="py-3 px-4 hidden sm:table-cell text-muted-foreground">
                      {new Date(lead.createdAt).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={lead.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  href,
  linkLabel,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  href?: string;
  linkLabel?: string;
  accent?: 'positive' | 'accent';
}) {
  const accentClass =
    accent === 'positive'
      ? 'text-emerald-600'
      : accent === 'accent'
      ? 'text-accent'
      : 'text-muted-foreground';
  return (
    <div className="rounded-xl border border-border bg-background p-4 md:p-5">
      <div className="flex items-center justify-between mb-3">
        <span className={`${accentClass}`}>{icon}</span>
        {href && linkLabel && (
          <Link href={href} className="text-xs text-muted-foreground hover:text-foreground">
            {linkLabel}
          </Link>
        )}
      </div>
      <p className="text-2xl md:text-3xl font-semibold tracking-tight">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const labels: Record<string, { label: string; className: string }> = {
    new: { label: 'Новая', className: 'bg-blue-50 text-blue-700 border-blue-200' },
    in_progress: { label: 'В работе', className: 'bg-amber-50 text-amber-700 border-amber-200' },
    done: { label: 'Обработана', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    rejected: { label: 'Отклонена', className: 'bg-red-50 text-red-700 border-red-200' },
  };
  const s = labels[status] ?? labels.new;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${s.className}`}>
      {s.label}
    </span>
  );
}
