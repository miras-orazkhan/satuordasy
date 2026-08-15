import { db } from '@/lib/db';

/**
 * Strip Date objects from a Prisma result so it can be passed from a Server
 * Component to a Client Component ('use client') without RSC serialization
 * errors. RSC cannot serialize Date objects — it throws:
 *   "TypeError: Date object cannot be serialized as JSON"
 * in production builds (dev mode is more lenient).
 *
 * We use JSON.parse(JSON.stringify(...)) — fastest way to deep-clone and
 * convert all Date objects to ISO strings.
 */
function toSerializable<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export async function getPublishedProjectBySlug(slug: string) {
  const project = await db.project.findFirst({
    where: { slug, status: 'published' },
    include: {
      hero: true,
      about: { include: { nearby: { orderBy: { sortOrder: 'asc' } } } },
      advantages: { orderBy: { sortOrder: 'asc' } },
      gallery: { orderBy: { sortOrder: 'asc' } },
      floorCategories: {
        orderBy: { sortOrder: 'asc' },
        include: { units: { orderBy: { sortOrder: 'asc' } } },
      },
      interiors: { orderBy: { sortOrder: 'asc' } },
      catalog: true,
      socials: { orderBy: { sortOrder: 'asc' } },
      leadForm: true,
    },
  });
  // Strip Date objects so the result can be passed to 'use client' components
  return project ? toSerializable(project) : null;
}

export async function getGlobalSocials() {
  const socials = await db.socialLink.findMany({
    where: { projectId: null },
    orderBy: { sortOrder: 'asc' },
  });
  return toSerializable(socials);
}

export async function getProjectForAdmin(id: string) {
  const project = await db.project.findUnique({
    where: { id },
    include: {
      hero: true,
      about: { include: { nearby: { orderBy: { sortOrder: 'asc' } } } },
      advantages: { orderBy: { sortOrder: 'asc' } },
      gallery: { orderBy: { sortOrder: 'asc' } },
      floorCategories: {
        orderBy: { sortOrder: 'asc' },
        include: { units: { orderBy: { sortOrder: 'asc' } } },
      },
      interiors: { orderBy: { sortOrder: 'asc' } },
      catalog: true,
      socials: { orderBy: { sortOrder: 'asc' } },
      leadForm: true,
    },
  });
  return project ? toSerializable(project) : null;
}

export async function getAllProjectsForAdmin() {
  const projects = await db.project.findMany({
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      themePreset: true,
      fontPreset: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { leads: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });
  return toSerializable(projects);
}

export async function getAllLeads() {
  const leads = await db.lead.findMany({
    include: {
      project: { select: { title: true, slug: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return toSerializable(leads);
}
