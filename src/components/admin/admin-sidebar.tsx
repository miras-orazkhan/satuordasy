'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Building2,
  Inbox,
  Settings,
  Users,
  LogOut,
  Shield,
  type LucideProps,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type NavItem = {
  href: string;
  label: string;
  icon: (props: LucideProps) => JSX.Element;
  roles: ('admin' | 'manager')[];
  badge?: number;
};

type User = { email: string; name: string; role: 'admin' | 'manager' };

export function AdminSidebar({
  user,
  newLeadsCount,
}: {
  user: User;
  newLeadsCount: number;
}) {
  const pathname = usePathname();
  const items: NavItem[] = [
    { href: '/admin', label: 'Дашборд', icon: LayoutDashboard, roles: ['admin', 'manager'] },
    {
      href: '/admin/leads',
      label: 'Заявки',
      icon: Inbox,
      roles: ['admin', 'manager'],
      badge: newLeadsCount,
    },
    { href: '/admin/projects', label: 'Проекты', icon: Building2, roles: ['admin'] },
    { href: '/admin/settings', label: 'Настройки', icon: Settings, roles: ['admin'] },
    { href: '/admin/users', label: 'Пользователи', icon: Users, roles: ['admin'] },
  ];

  const visibleItems = items.filter((item) => item.roles.includes(user.role));

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-background h-screen sticky top-0">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg tracking-tight">
          <Shield className="h-5 w-5 text-accent" />
          Vela Admin
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-secondary text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="flex-1">{item.label}</span>
              {item.badge && item.badge > 0 ? (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-xs font-semibold text-accent-foreground">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-9 w-9 rounded-full bg-accent/10 text-accent flex items-center justify-center text-sm font-semibold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Выйти
        </button>
      </div>
    </aside>
  );
}
