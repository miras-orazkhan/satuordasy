import { z } from 'zod';

// ---------- HELPERS ----------
/**
 * Validates a URL or relative path.
 * Accepts:
 *   - Empty string (field is optional)
 *   - Absolute URLs (https://example.com/image.png)
 *   - Relative paths (/api/r2/uploads/xxx.png, /uploads/xxx.png)
 *
 * We can't use z.string().url() because MediaUploader returns relative paths
 * like /api/r2/uploads/... which are valid on our domain but not absolute URLs.
 */
const urlOrPath = z
  .string()
  .max(2000)
  .refine(
    (val) =>
      !val ||
      val.startsWith('/') || // relative path
      val.startsWith('http://') ||
      val.startsWith('https://') ||
      val.startsWith('data:'),
    { message: 'Неверный URL' }
  )
  .optional()
  .or(z.literal(''));

// ---------- AUTH ----------
export const loginSchema = z.object({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(1, 'Введите пароль'),
});
export type LoginInput = z.infer<typeof loginSchema>;

// ---------- LEADS ----------
export const leadSchema = z.object({
  projectId: z.string().min(1),
  name: z.string().min(2, 'Имя слишком короткое').max(100),
  phone: z
    .string()
    .min(6, 'Введите корректный телефон')
    .max(30, 'Слишком длинный номер')
    .regex(/^[+\d\s()-]+$/, 'Допускаются только цифры и символы +() -'),
  comment: z.string().max(1000).optional().or(z.literal('')),
  consent: z.literal(true, { errorMap: () => ({ message: 'Требуется согласие на обработку ПД' }) }),
});
export type LeadInput = z.infer<typeof leadSchema>;

// ---------- PROJECT ----------
export const projectSchema = z.object({
  slug: z
    .string()
    .min(2, 'Минимум 2 символа')
    .max(80)
    .regex(/^[a-z0-9-]+$/, 'Только строчные латинские буквы, цифры и дефис'),
  title: z.string().min(2, 'Минимум 2 символа').max(200),
  status: z.enum(['draft', 'published']),
  themePreset: z.string().min(1),
  fontPreset: z.string().min(1),
  seoTitle: z.string().max(200).optional().or(z.literal('')),
  seoDescription: z.string().max(500).optional().or(z.literal('')),
  seoKeywords: z.string().max(500).optional().or(z.literal('')),
  ogImageUrl: urlOrPath,
  geoRegion: z.string().max(100).optional().or(z.literal('')),
  geoCity: z.string().max(100).optional().or(z.literal('')),
  geoLat: z.coerce.number().min(-90).max(90).optional().or(z.literal('')),
  geoLng: z.coerce.number().min(-180).max(180).optional().or(z.literal('')),
});
export type ProjectInput = z.infer<typeof projectSchema>;

// ---------- HERO ----------
export const heroSchema = z.object({
  title: z.string().min(2).max(200),
  subtitle: z.string().max(500).optional().or(z.literal('')),
  ctaText: z.string().min(2).max(50).default('Оставить заявку'),
  desktopImage: z.string().optional().or(z.literal('')),
  mobileImage: z.string().optional().or(z.literal('')),
});
export type HeroInput = z.infer<typeof heroSchema>;

// ---------- ADVANTAGES ----------
export const advantageSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().min(2).max(500),
  icon: z.string().max(200).optional().or(z.literal('')),
  customIconSvg: z.string().max(50000).optional().or(z.literal('')),
  sortOrder: z.number().int().default(0),
});
export type AdvantageInput = z.infer<typeof advantageSchema>;

// ---------- ABOUT ----------
export const aboutSchema = z.object({
  description: z.string().min(2).max(5000),
  mapEmbedUrl: urlOrPath,
  mapLat: z.coerce.number().optional(),
  mapLng: z.coerce.number().optional(),
});
export type AboutInput = z.infer<typeof aboutSchema>;

export const nearbyObjectSchema = z.object({
  name: z.string().min(1).max(200),
  distance: z.string().min(1).max(50),
  sortOrder: z.number().int().default(0),
});
export type NearbyObjectInput = z.infer<typeof nearbyObjectSchema>;

// ---------- GALLERY ----------
export const galleryImageSchema = z.object({
  url: z.string().min(1),
  caption: z.string().max(200).optional().or(z.literal('')),
  sortOrder: z.number().int().default(0),
});
export type GalleryImageInput = z.infer<typeof galleryImageSchema>;

// ---------- FLOOR PLANS ----------
export const floorPlanCategorySchema = z.object({
  name: z.string().min(1).max(100),
  sortOrder: z.number().int().default(0),
});
export type FloorPlanCategoryInput = z.infer<typeof floorPlanCategorySchema>;

export const floorPlanUnitSchema = z.object({
  name: z.string().max(100).optional().or(z.literal('')),
  area: z.coerce.number().positive('Площадь должна быть положительной'),
  imageUrl: z.string().optional().or(z.literal('')),
  sortOrder: z.number().int().default(0),
});
export type FloorPlanUnitInput = z.infer<typeof floorPlanUnitSchema>;

// ---------- INTERIORS ----------
export const interiorSchema = z.object({
  imageUrl: z.string().min(1),
  caption: z.string().max(200).optional().or(z.literal('')),
  description: z.string().max(2000).optional().or(z.literal('')),
  sortOrder: z.number().int().default(0),
});
export type InteriorInput = z.infer<typeof interiorSchema>;

// ---------- CATALOG ----------
export const catalogSchema = z.object({
  fileUrl: z.string().min(1),
  fileName: z.string().max(200).optional().or(z.literal('')),
});
export type CatalogInput = z.infer<typeof catalogSchema>;

// ---------- SOCIAL ----------
export const socialLinkSchema = z.object({
  platform: z.string().min(1).max(50),
  url: z.string().min(1).max(2000).refine(
    (val) => val.startsWith('/') || val.startsWith('http://') || val.startsWith('https://') || val.startsWith('data:'),
    { message: 'Неверный URL' }
  ),
  icon: z.string().max(100).optional().or(z.literal('')),
  sortOrder: z.number().int().default(0),
  projectId: z.string().optional().nullable(),
});
export type SocialLinkInput = z.infer<typeof socialLinkSchema>;

// ---------- LEAD FORM CONFIG (per-project) ----------
export const leadFormConfigSchema = z.object({
  formType: z.enum(['native', 'bitrix24']),
  bitrixPortalId: z.string().max(50).optional().or(z.literal('')),
  bitrixFormId: z.string().max(50).optional().or(z.literal('')),
  bitrixEmbedCode: z.string().max(10000).optional().or(z.literal('')),
  sectionTitle: z.string().max(200).optional().or(z.literal('')),
  sectionSubtitle: z.string().max(500).optional().or(z.literal('')),
});
export type LeadFormConfigInput = z.infer<typeof leadFormConfigSchema>;

// ---------- SETTINGS ----------
export const settingsSchema = z.object({
  faviconUrl: urlOrPath,
  gtmContainerId: z
    .string()
    .max(30)
    .regex(/^GTM-[A-Z0-9]+$/, 'Формат: GTM-XXXXXXX')
    .optional()
    .or(z.literal('')),
  robotsAllowAll: z.boolean().default(true),
  robotsCustomRules: z.string().max(2000).optional().or(z.literal('')),
  geoDefaultRegion: z.string().max(100).optional().or(z.literal('')),
  geoDefaultCity: z.string().max(100).optional().or(z.literal('')),
  brandName: z.string().min(1).max(100).default('Наши проекты'),
});
export type SettingsInput = z.infer<typeof settingsSchema>;

export const privacySchema = z.object({
  content: z.string().min(1).max(50000),
});
export type PrivacyInput = z.infer<typeof privacySchema>;

// ---------- USER ----------
export const userCreateSchema = z.object({
  email: z.string().email(),
  name: z.string().max(100).optional().or(z.literal('')),
  role: z.enum(['admin', 'manager']),
  password: z.string().min(6, 'Минимум 6 символов'),
});
export type UserCreateInput = z.infer<typeof userCreateSchema>;
