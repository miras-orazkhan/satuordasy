'use server';

import { db } from '@/lib/db';
import {
  heroSchema,
  aboutSchema,
  advantageSchema,
  nearbyObjectSchema,
  galleryImageSchema,
  floorPlanCategorySchema,
  floorPlanUnitSchema,
  interiorSchema,
  catalogSchema,
  socialLinkSchema,
  leadFormConfigSchema,
} from '@/lib/validations';
import { revalidatePath } from 'next/cache';

type Result = { ok: true } | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

// ---------- HERO ----------
export async function updateHero(projectId: string, input: unknown): Promise<Result> {
  const parsed = heroSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'Проверьте поля', fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  const data = {
    ...parsed.data,
    subtitle: parsed.data.subtitle || null,
    desktopImage: parsed.data.desktopImage || null,
    mobileImage: parsed.data.mobileImage || null,
  };
  await db.heroBlock.upsert({
    where: { projectId },
    create: { projectId, ...data },
    update: data,
  });
  revalidatePath('/admin/projects');
  return { ok: true };
}

// ---------- ABOUT ----------
export async function updateAbout(projectId: string, input: unknown): Promise<Result> {
  const parsed = aboutSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'Проверьте поля', fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  const data = {
    ...parsed.data,
    mapEmbedUrl: parsed.data.mapEmbedUrl || null,
    mapLat: parsed.data.mapLat ?? null,
    mapLng: parsed.data.mapLng ?? null,
  };
  await db.aboutSection.upsert({
    where: { projectId },
    create: { projectId, description: '', ...data },
    update: data,
  });
  revalidatePath('/admin/projects');
  return { ok: true };
}

// ---------- ADVANTAGES ----------
export async function addAdvantage(projectId: string, input: unknown): Promise<Result> {
  const parsed = advantageSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Проверьте поля', fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  const count = await db.advantage.count({ where: { projectId } });
  await db.advantage.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      icon: parsed.data.icon || null,
      customIconSvg: parsed.data.customIconSvg || null,
      projectId,
      sortOrder: parsed.data.sortOrder ?? count,
    },
  });
  revalidatePath('/admin/projects');
  return { ok: true };
}

export async function updateAdvantage(id: string, input: unknown): Promise<Result> {
  const parsed = advantageSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Проверьте поля', fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  await db.advantage.update({
    where: { id },
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      icon: parsed.data.icon || null,
      customIconSvg: parsed.data.customIconSvg || null,
    },
  });
  revalidatePath('/admin/projects');
  return { ok: true };
}

export async function deleteAdvantage(id: string): Promise<Result> {
  await db.advantage.delete({ where: { id } });
  revalidatePath('/admin/projects');
  return { ok: true };
}

// ---------- NEARBY OBJECTS ----------
export async function addNearbyObject(aboutId: string, input: unknown): Promise<Result> {
  const parsed = nearbyObjectSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Проверьте поля', fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  const count = await db.nearbyObject.count({ where: { aboutId } });
  await db.nearbyObject.create({ data: { ...parsed.data, aboutId, sortOrder: parsed.data.sortOrder ?? count } });
  revalidatePath('/admin/projects');
  return { ok: true };
}

export async function deleteNearbyObject(id: string): Promise<Result> {
  await db.nearbyObject.delete({ where: { id } });
  revalidatePath('/admin/projects');
  return { ok: true };
}

// ---------- GALLERY ----------
export async function addGalleryImage(projectId: string, input: unknown): Promise<Result> {
  const parsed = galleryImageSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Проверьте поля', fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  const count = await db.galleryImage.count({ where: { projectId } });
  await db.galleryImage.create({ data: { ...parsed.data, caption: parsed.data.caption || null, projectId, sortOrder: parsed.data.sortOrder ?? count } });
  revalidatePath('/admin/projects');
  return { ok: true };
}

export async function deleteGalleryImage(id: string): Promise<Result> {
  await db.galleryImage.delete({ where: { id } });
  revalidatePath('/admin/projects');
  return { ok: true };
}

// ---------- FLOOR PLAN CATEGORIES ----------
export async function addFloorPlanCategory(projectId: string, input: unknown): Promise<Result> {
  const parsed = floorPlanCategorySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Проверьте поля', fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  const count = await db.floorPlanCategory.count({ where: { projectId } });
  await db.floorPlanCategory.create({ data: { ...parsed.data, projectId, sortOrder: parsed.data.sortOrder ?? count } });
  revalidatePath('/admin/projects');
  return { ok: true };
}

export async function deleteFloorPlanCategory(id: string): Promise<Result> {
  await db.floorPlanCategory.delete({ where: { id } });
  revalidatePath('/admin/projects');
  return { ok: true };
}

// ---------- FLOOR PLAN UNITS ----------
export async function addFloorPlanUnit(categoryId: string, input: unknown): Promise<Result> {
  const parsed = floorPlanUnitSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Проверьте поля', fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  const count = await db.floorPlanUnit.count({ where: { categoryId } });
  await db.floorPlanUnit.create({ data: { ...parsed.data, name: parsed.data.name || null, imageUrl: parsed.data.imageUrl || null, categoryId, sortOrder: parsed.data.sortOrder ?? count } });
  revalidatePath('/admin/projects');
  return { ok: true };
}

export async function deleteFloorPlanUnit(id: string): Promise<Result> {
  await db.floorPlanUnit.delete({ where: { id } });
  revalidatePath('/admin/projects');
  return { ok: true };
}

// ---------- INTERIORS ----------
export async function addInterior(projectId: string, input: unknown): Promise<Result> {
  const parsed = interiorSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Проверьте поля', fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  const count = await db.interiorItem.count({ where: { projectId } });
  await db.interiorItem.create({ data: { ...parsed.data, caption: parsed.data.caption || null, description: parsed.data.description || null, projectId, sortOrder: parsed.data.sortOrder ?? count } });
  revalidatePath('/admin/projects');
  return { ok: true };
}

export async function deleteInterior(id: string): Promise<Result> {
  await db.interiorItem.delete({ where: { id } });
  revalidatePath('/admin/projects');
  return { ok: true };
}

// ---------- CATALOG ----------
export async function updateCatalog(projectId: string, input: unknown): Promise<Result> {
  const parsed = catalogSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Проверьте поля', fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  const data = { ...parsed.data, fileName: parsed.data.fileName || null };
  await db.catalog.upsert({
    where: { projectId },
    create: { projectId, ...data },
    update: data,
  });
  revalidatePath('/admin/projects');
  return { ok: true };
}

// ---------- LEAD FORM CONFIG (per-project) ----------
export async function updateLeadFormConfig(projectId: string, input: unknown): Promise<Result> {
  const parsed = leadFormConfigSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Проверьте поля', fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };

  const data = {
    formType: parsed.data.formType,
    bitrixPortalId: parsed.data.bitrixPortalId || null,
    bitrixFormId: parsed.data.bitrixFormId || null,
    bitrixEmbedCode: parsed.data.bitrixEmbedCode || null,
    sectionTitle: parsed.data.sectionTitle || null,
    sectionSubtitle: parsed.data.sectionSubtitle || null,
  };

  await db.leadFormConfig.upsert({
    where: { projectId },
    create: { projectId, ...data },
    update: data,
  });
  revalidatePath('/admin/projects');
  return { ok: true };
}

// ---------- SOCIAL LINKS ----------
export async function addSocialLink(input: unknown): Promise<Result> {
  const parsed = socialLinkSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Проверьте поля', fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  const data = { ...parsed.data, icon: parsed.data.icon || null, projectId: parsed.data.projectId ?? null };
  const count = await db.socialLink.count({ where: { projectId: data.projectId ?? null } });
  await db.socialLink.create({ data: { ...data, sortOrder: parsed.data.sortOrder ?? count } });
  revalidatePath('/admin/projects');
  revalidatePath('/');
  return { ok: true };
}

export async function deleteSocialLink(id: string): Promise<Result> {
  await db.socialLink.delete({ where: { id } });
  revalidatePath('/admin/projects');
  revalidatePath('/');
  return { ok: true };
}
