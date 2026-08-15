import { db } from '@/lib/db';

export async function getPublishedProjectBySlug(slug: string) {
  return db.project.findFirst({
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
}

export async function getGlobalSocials() {
  return db.socialLink.findMany({
    where: { projectId: null },
    orderBy: { sortOrder: 'asc' },
  });
}

export async function getProjectForAdmin(id: string) {
  return db.project.findUnique({
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
}

export async function getAllProjectsForAdmin() {
  return db.project.findMany({
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
}

export async function getAllLeads() {
  return db.lead.findMany({
    include: {
      project: { select: { title: true, slug: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}
