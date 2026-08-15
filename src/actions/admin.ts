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

// ---------- HOME PAGE ----------
export async function updateHomePage(input: {
  title: string;
  subtitle?: string | null;
  heroImage?: string | null;
  logoUrl?: string | null;
}): Promise<Result> {
  if (!input.title || input.title.trim().length < 1) {
    return { ok: false, error: 'Заголовок обязателен', fieldErrors: { title: ['Заполните поле'] } };
  }
  try {
    await db.homePage.upsert({
      where: { id: 'singleton' },
      create: {
        id: 'singleton',
        title: input.title,
        subtitle: input.subtitle || null,
        heroImage: input.heroImage || null,
        logoUrl: input.logoUrl || null,
      },
      update: {
        title: input.title,
        subtitle: input.subtitle || null,
        heroImage: input.heroImage || null,
        logoUrl: input.logoUrl || null,
      },
    });
    revalidatePath('/');
    revalidatePath('/admin/settings');
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: 'Ошибка: ' + (e?.message ?? 'unknown') };
  }
}

// ---------- CUSTOM SVG ICONS ----------
export async function createCustomIcon(name: string, svgMarkup: string): Promise<Result> {
  if (!name || name.trim().length < 1) {
    return { ok: false, error: 'Имя обязательно', fieldErrors: { name: ['Заполните'] } };
  }
  if (!svgMarkup || !svgMarkup.includes('<svg')) {
    return { ok: false, error: 'SVG должен содержать <svg>...</svg>', fieldErrors: { svgMarkup: ['Невалидный SVG'] } };
  }
  try {
    await db.advantageIcon.create({ data: { name: name.trim(), svgMarkup } });
    revalidatePath('/admin/settings');
    return { ok: true };
  } catch (e: any) {
    if (e?.code === 'P2002') {
      return { ok: false, error: 'Иконка с таким именем уже существует', fieldErrors: { name: ['Имя занято'] } };
    }
    return { ok: false, error: 'Ошибка: ' + (e?.message ?? 'unknown') };
  }
}

export async function deleteCustomIcon(id: string): Promise<Result> {
  try {
    await db.advantageIcon.delete({ where: { id } });
    revalidatePath('/admin/settings');
    return { ok: true };
  } catch {
    return { ok: false, error: 'Не удалось удалить иконку' };
  }
}
