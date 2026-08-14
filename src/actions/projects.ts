'use server';

import { db } from '@/lib/db';
import { projectSchema } from '@/lib/validations';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export type ProjectActionResult =
  | { ok: true; id: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createProject(input: unknown): Promise<ProjectActionResult> {
  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Проверьте поля',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  const data = parsed.data;
  // Empty strings → undefined for optional fields
  const cleaned = {
    ...data,
    seoTitle: data.seoTitle || null,
    seoDescription: data.seoDescription || null,
    seoKeywords: data.seoKeywords || null,
    ogImageUrl: data.ogImageUrl || null,
    geoRegion: data.geoRegion || null,
    geoCity: data.geoCity || null,
    geoLat: data.geoLat || null,
    geoLng: data.geoLng || null,
  };

  try {
    const project = await db.project.create({ data: cleaned });
    // Auto-create empty hero + about
    await db.heroBlock.create({
      data: { projectId: project.id, title: project.title, subtitle: '', ctaText: 'Оставить заявку' },
    });
    await db.aboutSection.create({
      data: { projectId: project.id, description: '' },
    });
    revalidatePath('/');
    revalidatePath('/admin/projects');
    return { ok: true, id: project.id };
  } catch (e: any) {
    if (e?.code === 'P2002') {
      return { ok: false, error: 'Проект с таким slug уже существует', fieldErrors: { slug: ['Slug уже занят'] } };
    }
    return { ok: false, error: 'Ошибка создания: ' + (e?.message ?? 'unknown') };
  }
}

export async function updateProject(id: string, input: unknown): Promise<ProjectActionResult> {
  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Проверьте поля',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  const data = parsed.data;
  const cleaned = {
    ...data,
    seoTitle: data.seoTitle || null,
    seoDescription: data.seoDescription || null,
    seoKeywords: data.seoKeywords || null,
    ogImageUrl: data.ogImageUrl || null,
    geoRegion: data.geoRegion || null,
    geoCity: data.geoCity || null,
    geoLat: data.geoLat || null,
    geoLng: data.geoLng || null,
  };

  try {
    await db.project.update({ where: { id }, data: cleaned });
    revalidatePath('/');
    revalidatePath('/admin/projects');
    revalidatePath(`/zhk/${cleaned.slug}`);
    return { ok: true, id };
  } catch (e: any) {
    if (e?.code === 'P2002') {
      return { ok: false, error: 'Проект с таким slug уже существует', fieldErrors: { slug: ['Slug уже занят'] } };
    }
    return { ok: false, error: 'Ошибка обновления: ' + (e?.message ?? 'unknown') };
  }
}

export async function deleteProject(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await db.project.delete({ where: { id } });
    revalidatePath('/');
    revalidatePath('/admin/projects');
    return { ok: true };
  } catch {
    return { ok: false, error: 'Не удалось удалить проект' };
  }
}

export async function toggleProjectStatus(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const project = await db.project.findUnique({ where: { id }, select: { status: true } });
    if (!project) return { ok: false, error: 'Проект не найден' };
    const newStatus = project.status === 'published' ? 'draft' : 'published';
    await db.project.update({ where: { id }, data: { status: newStatus } });
    revalidatePath('/');
    revalidatePath('/admin/projects');
    return { ok: true };
  } catch {
    return { ok: false, error: 'Не удалось изменить статус' };
  }
}
