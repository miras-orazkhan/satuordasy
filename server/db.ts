import { PrismaClient } from '@prisma/client';
const globalDatabase = globalThis as typeof globalThis & { prisma?: PrismaClient };
export const db = globalDatabase.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalDatabase.prisma = db;

export const projectInclude = {
  hero: true,
  about: { include: { nearby: { orderBy: { sortOrder: 'asc' as const } } } },
  advantages: { orderBy: { sortOrder: 'asc' as const } },
  gallery: { orderBy: { sortOrder: 'asc' as const } },
  floorCategories: { orderBy: { sortOrder: 'asc' as const }, include: { units: { orderBy: { sortOrder: 'asc' as const } } } },
  interiors: { orderBy: { sortOrder: 'asc' as const } },
  catalog: true, socials: { orderBy: { sortOrder: 'asc' as const } }, leadForm: true,
} as const;
