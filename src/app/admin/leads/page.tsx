import { requireUser } from '@/lib/session';
import { getAllLeads } from '@/lib/queries';
import { LeadsTable } from '@/components/admin/leads-table';

export const dynamic = 'force-dynamic';

export default async function LeadsPage() {
  await requireUser();
  const leads = await getAllLeads();

  return (
    <div>
      <header className="mb-6">
        <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Заявки</p>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Заявки с сайтов</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Всего: <span className="font-medium text-foreground">{leads.length}</span>
        </p>
      </header>

      <LeadsTable leads={leads} />
    </div>
  );
}
