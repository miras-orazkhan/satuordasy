import { db } from '@/lib/db';

/**
 * In-memory cache of global settings (favicon, GTM, robots, brand, etc.).
 * Re-validated on each request via revalidatePath, but cached within a single render.
 */
let cache: Record<string, string> | null = null;

const DEFAULTS: Record<string, string> = {
  faviconUrl: '',
  gtmContainerId: '',
  robotsAllowAll: 'true',
  robotsCustomRules: '',
  geoDefaultRegion: 'Россия',
  geoDefaultCity: 'Москва',
  brandName: 'Наши проекты',
};

export async function getSettings(): Promise<Record<string, string>> {
  if (cache) return cache;
  try {
    const rows = await db.setting.findMany();
    const result: Record<string, string> = { ...DEFAULTS };
    for (const r of rows) {
      result[r.key] = r.value;
    }
    // Cache only for the lifetime of a request, not across requests
    return result;
  } catch {
    return { ...DEFAULTS };
  }
}

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
  const row = await db.privacyPolicy.findUnique({ where: { id: 'singleton' } });
  return row?.content ?? DEFAULT_PRIVACY;
}

export async function setPrivacyPolicy(content: string): Promise<void> {
  await db.privacyPolicy.upsert({
    where: { id: 'singleton' },
    create: { id: 'singleton', content },
    update: { content },
  });
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
