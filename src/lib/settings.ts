import { db } from '@/lib/db';
import { cache } from 'react';

/**
 * In-memory cache of global settings (favicon, GTM, robots, brand, etc.).
 * Re-validated on each request via revalidatePath, but cached within a single render.
 */
const DEFAULTS: Record<string, string> = {
  faviconUrl: '',
  gtmContainerId: '',
  robotsAllowAll: 'true',
  robotsCustomRules: '',
  geoDefaultRegion: 'Россия',
  geoDefaultCity: 'Москва',
  brandName: 'Satu Ordasy',
};

export const getSettings = cache(async (): Promise<Record<string, string>> => {
  try {
    const rows = await db.setting.findMany();
    const result: Record<string, string> = { ...DEFAULTS };
    for (const r of rows) {
      result[r.key] = r.value;
    }
    return result;
  } catch {
    return { ...DEFAULTS };
  }
});

export async function getSetting(key: string): Promise<string> {
  const settings = await getSettings();
  return settings[key] ?? DEFAULTS[key] ?? '';
}

export async function setSetting(key: string, value: string): Promise<void> {
  await db.setting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
}

export async function setSettings(values: Record<string, string>): Promise<void> {
  for (const [key, value] of Object.entries(values)) {
    await db.setting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  }
}

export async function getPrivacyPolicy(): Promise<string> {
  try {
    const row = await db.privacyPolicy.findUnique({ where: { id: 'singleton' } });
    return row?.content ?? DEFAULT_PRIVACY;
  } catch {
    // DB not available (build time on Vercel)
    return DEFAULT_PRIVACY;
  }
}

export async function setPrivacyPolicy(content: string): Promise<void> {
  await db.privacyPolicy.upsert({
    where: { id: 'singleton' },
    create: { id: 'singleton', content },
    update: { content },
  });
}

// ---------- FOOTER (editable singleton) ----------
export type FooterData = {
  phone: string | null;
  email: string | null;
  address: string | null;
  legalName: string | null;
  bin: string | null;
  iik: string | null;
  bankName: string | null;
  bic: string | null;
  workingHours: string | null;
  copyrightText: string | null;
  disclaimer: string | null;
};

const DEFAULT_FOOTER: FooterData = {
  phone: '+7 700 000 00 00',
  email: 'info@satuordasy.com',
  address: null,
  legalName: null,
  bin: null,
  iik: null,
  bankName: null,
  bic: null,
  workingHours: 'Пн–Пт 9:00–18:00',
  copyrightText: null,
  disclaimer: 'Информация на сайте носит ознакомительный характер и не является публичной офертой.',
};

export async function getFooter(): Promise<FooterData> {
  try {
    const row = await db.footer.findUnique({ where: { id: 'singleton' } });
    if (!row) return DEFAULT_FOOTER;
    return {
      phone: row.phone,
      email: row.email,
      address: row.address,
      legalName: row.legalName,
      bin: row.bin,
      iik: row.iik,
      bankName: row.bankName,
      bic: row.bic,
      workingHours: row.workingHours,
      copyrightText: row.copyrightText,
      disclaimer: row.disclaimer,
    };
  } catch {
    // DB not available (build time)
    return DEFAULT_FOOTER;
  }
}

export async function setFooter(data: FooterData): Promise<void> {
  await db.footer.upsert({
    where: { id: 'singleton' },
    create: {
      id: 'singleton',
      phone: data.phone || null,
      email: data.email || null,
      address: data.address || null,
      legalName: data.legalName || null,
      bin: data.bin || null,
      iik: data.iik || null,
      bankName: data.bankName || null,
      bic: data.bic || null,
      workingHours: data.workingHours || null,
      copyrightText: data.copyrightText || null,
      disclaimer: data.disclaimer || null,
    },
    update: {
      phone: data.phone || null,
      email: data.email || null,
      address: data.address || null,
      legalName: data.legalName || null,
      bin: data.bin || null,
      iik: data.iik || null,
      bankName: data.bankName || null,
      bic: data.bic || null,
      workingHours: data.workingHours || null,
      copyrightText: data.copyrightText || null,
      disclaimer: data.disclaimer || null,
    },
  });
}

// ---------- HOME PAGE (editable) ----------
const DEFAULT_HOME: { title: string; subtitle: string | null; heroImage: string | null; logoUrl: string | null } = {
  title: 'Satu Ordasy',
  subtitle: 'Выберите свой идеальный дом. Мы подберём для вас ваш дом мечты — лучшие жилые комплексы, планировки, расположение и инфраструктура.',
  heroImage: null,
  logoUrl: null,
};

export async function getHomePage() {
  try {
    const row = await db.homePage.findUnique({ where: { id: 'singleton' } });
    if (!row) return DEFAULT_HOME;
    return {
      title: row.title,
      subtitle: row.subtitle,
      heroImage: row.heroImage,
      logoUrl: row.logoUrl,
    };
  } catch {
    // DB not available (build time)
    return DEFAULT_HOME;
  }
}

export async function setHomePage(data: {
  title: string;
  subtitle?: string | null;
  heroImage?: string | null;
  logoUrl?: string | null;
}): Promise<void> {
  await db.homePage.upsert({
    where: { id: 'singleton' },
    create: {
      id: 'singleton',
      title: data.title,
      subtitle: data.subtitle ?? null,
      heroImage: data.heroImage ?? null,
      logoUrl: data.logoUrl ?? null,
    },
    update: {
      title: data.title,
      subtitle: data.subtitle ?? null,
      heroImage: data.heroImage ?? null,
      logoUrl: data.logoUrl ?? null,
    },
  });
}

// ---------- CUSTOM SVG ICONS ----------
export async function listCustomIcons() {
  try {
    return await db.advantageIcon.findMany({ orderBy: { name: 'asc' } });
  } catch {
    return [];
  }
}

export async function addCustomIcon(name: string, svgMarkup: string) {
  await db.advantageIcon.create({ data: { name, svgMarkup } });
}

export async function deleteCustomIcon(id: string) {
  await db.advantageIcon.delete({ where: { id } });
}

const DEFAULT_PRIVACY = `# Политика конфиденциальности

Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных пользователей сайта.

## 1. Общие положения

Оператор персональных данных — компания, размещающая информацию о жилых комплексах на данном сайте. Обработка персональных данных осуществляется в соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ «О персональных данных».

## 2. Состав персональных данных

Оператор обрабатывает следующие персональные данные:
- Имя, фамилия пользователя;
- Контактный телефон;
- Иные данные, добровольно предоставленные пользователем через формы обратной связи.

## 3. Цели обработки

Персональные данные обрабатываются исключительно для:
- Обработки заявок на информацию о жилых комплексах;
- Консультации пользователей по вопросам приобретения недвижимости;
- Информирования о новых проектах и акциях.

## 4. Права пользователя

Пользователь имеет право на доступ, исправление, удаление своих персональных данных, а также на отзыв согласия на их обработку. Для реализации этих прав необходимо направить запрос на контактный email Оператора.

## 5. Меры защиты

Оператор применяет организационные и технические меры для обеспечения безопасности персональных данных от неправомерного доступа, копирования, изменения и уничтожения.`;
