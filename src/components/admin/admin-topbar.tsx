'use client';

import Link from 'next/link';
import { Building2, ExternalLink } from 'lucide-react';

export function AdminTopbar({ user }: { user: { email: string; name: string; role: string } }) {
  return (
    <header className="md:hidden sticky top-0 z-40 glass border-b border-border">
      <div className="flex h-14 items-center justify-between px-4">
        <Link href="/admin" className="font-semibold">
          Satu Admin
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground hidden sm:inline">{user.email}</span>
          <Link href="/" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border">
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
