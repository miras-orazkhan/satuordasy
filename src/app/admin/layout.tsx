import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminTopbar } from '@/components/admin/admin-topbar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  // Middleware already redirects unauthenticated users to /admin/login.
  // If session is missing here (e.g., during the login page itself), render children bare.
  if (!session?.user) {
    return <>{children}</>;
  }

  const user = {
    email: session.user.email,
    name: session.user.name ?? session.user.email,
    role: session.user.role,
  };

  // Count new leads for the badge
  const newLeadsCount = await db.lead.count({ where: { status: 'new' } });

  return (
    <div className="min-h-screen bg-secondary/30 text-foreground">
      <div className="flex">
        <AdminSidebar user={user} newLeadsCount={newLeadsCount} />
        <div className="flex-1 min-w-0 flex flex-col">
          <AdminTopbar user={user} />
          <main className="flex-1 p-4 md:p-8 max-w-[1400px] w-full mx-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}
