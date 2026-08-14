'use server';

import { db } from '@/lib/db';
import { settingsSchema, privacySchema, userCreateSchema } from '@/lib/validations';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';

type Result = { ok: true } | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function updateSettings(input: unknown): Promise<Result> {
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'Проверьте поля', fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  const data = parsed.data;
  const toSave: Record<string, string> = {
    faviconUrl: data.faviconUrl ?? '',
    gtmContainerId: data.gtmContainerId ?? '',
    robotsAllowAll: String(data.robotsAllowAll ?? true),
    robotsCustomRules: data.robotsCustomRules ?? '',
    geoDefaultRegion: data.geoDefaultRegion ?? '',
    geoDefaultCity: data.geoDefaultCity ?? '',
    brandName: data.brandName,
  };
  for (const [key, value] of Object.entries(toSave)) {
    await db.setting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  }
  revalidatePath('/', 'layout');
  revalidatePath('/admin/settings');
  revalidatePath('/sitemap.xml');
  revalidatePath('/robots.txt');
  return { ok: true };
}

export async function updatePrivacy(input: unknown): Promise<Result> {
  const parsed = privacySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'Проверьте поля', fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  await db.privacyPolicy.upsert({
    where: { id: 'singleton' },
    create: { id: 'singleton', content: parsed.data.content },
    update: { content: parsed.data.content },
  });
  revalidatePath('/privacy');
  revalidatePath('/admin/settings');
  return { ok: true };
}

export async function createUser(input: unknown): Promise<Result> {
  const parsed = userCreateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'Проверьте поля', fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  const data = parsed.data;
  const passwordHash = await bcrypt.hash(data.password, 10);
  try {
    await db.user.create({
      data: {
        email: data.email.toLowerCase(),
        name: data.name || null,
        passwordHash,
        role: data.role,
      },
    });
    revalidatePath('/admin/users');
    return { ok: true };
  } catch (e: any) {
    if (e?.code === 'P2002') {
      return { ok: false, error: 'Пользователь с таким email уже существует', fieldErrors: { email: ['Email занят'] } };
    }
    return { ok: false, error: 'Ошибка: ' + (e?.message ?? 'unknown') };
  }
}

export async function deleteUser(id: string): Promise<Result> {
  try {
    await db.user.delete({ where: { id } });
    revalidatePath('/admin/users');
    return { ok: true };
  } catch {
    return { ok: false, error: 'Не удалось удалить пользователя' };
  }
}
