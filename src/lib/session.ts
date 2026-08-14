import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export type SessionUser = {
  id: string;
  email: string;
  name?: string | null;
  role: 'admin' | 'manager';
};

/**
 * Returns the current session user or null.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
  };
}

/**
 * Requires an authenticated user. If not — redirects to /admin/login.
 * Returns the user with role.
 */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect('/admin/login');
  return user;
}

/**
 * Requires an admin user. Managers are redirected to /admin/leads.
 */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== 'admin') redirect('/admin/leads');
  return user;
}

/**
 * Checks if user has access to a specific section.
 * Admin — full access. Manager — only leads.
 */
export function canAccess(user: SessionUser, section: string): boolean {
  if (user.role === 'admin') return true;
  if (user.role === 'manager' && section === 'leads') return true;
  return false;
}
