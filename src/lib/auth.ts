import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

export const authOptions: NextAuthOptions = {
  // NOTE: using a static secret for the dev sandbox. Override NEXTAUTH_SECRET in production.
  secret: process.env.NEXTAUTH_SECRET ?? 'zhk-constructor-dev-secret-change-me',
  session: { strategy: 'jwt' },
  // trustHost: lets NextAuth derive its base URL from request headers (works behind Vercel proxy)
  // when NEXTAUTH_URL is not explicitly set. Without this, NextAuth in v4 may fail on
  // serverless hosts where Host/Origin headers differ from the canonical URL.
  useSecureCookies: process.env.NODE_ENV === 'production',
  trustHost: true,
  pages: {
    signIn: '/admin/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Пароль', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await db.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });
        if (!user) return null;
        const ok = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!ok) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? user.email,
          role: user.role,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
};

// Extend session/user types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: 'admin' | 'manager';
    };
  }
  interface User {
    role: 'admin' | 'manager';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: 'admin' | 'manager';
    id: string;
  }
}
