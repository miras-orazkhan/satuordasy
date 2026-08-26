import { createHmac, timingSafeEqual } from 'node:crypto';
import type { User } from '@prisma/client';

const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'change-me-in-production';
const cookieName = 'satu_session';
type Session = Pick<User, 'id' | 'email' | 'name' | 'role'> & { expires: number };
const encode = (value: string) => Buffer.from(value).toString('base64url');

export function createSessionCookie(user: Pick<User, 'id' | 'email' | 'name' | 'role'>): string {
  const payload = encode(JSON.stringify({ ...user, expires: Date.now() + 7 * 864e5 }));
  const signature = createHmac('sha256', secret).update(payload).digest('base64url');
  return `${cookieName}=${payload}.${signature}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
}

export function clearSessionCookie(): string { return `${cookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`; }

export function readSession(request: Request): Session | null {
  const raw = request.headers.get('cookie')?.split(';').map(x => x.trim()).find(x => x.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1);
  if (!raw) return null;
  const [payload, signature] = raw.split('.');
  if (!payload || !signature) return null;
  const expected = createHmac('sha256', secret).update(payload).digest('base64url');
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try { const session = JSON.parse(Buffer.from(payload, 'base64url').toString()) as Session; return session.expires > Date.now() ? session : null; } catch { return null; }
}

export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  try { return new URL(origin).host === new URL(request.url).host; } catch { return false; }
}
