/**
 * Курируемые пресеты оформления для ЖК.
 * Каждый пресет — заранее выверенная пара «фон + акцент», прошедшая проверку на контраст (WCAG AA).
 * Свободный выбор цветов НЕ допускается — только эти пресеты.
 */

export type ThemePreset = {
  id: string;
  name: string;
  description: string;
  isDark: boolean;
  cssVars: {
    // OKLCH значения для согласованности с shadcn/ui
    '--background': string;
    '--foreground': string;
    '--card': string;
    '--card-foreground': string;
    '--popover': string;
    '--popover-foreground': string;
    '--primary': string;
    '--primary-foreground': string;
    '--secondary': string;
    '--secondary-foreground': string;
    '--muted': string;
    '--muted-foreground': string;
    '--accent': string;
    '--accent-foreground': string;
    '--border': string;
    '--input': string;
    '--ring': string;
  };
  // Tailwind hex для превью в админке
  swatches: {
    background: string;
    foreground: string;
    accent: string;
  };
};

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'noir',
    name: 'Noir',
    description: 'Глубокий чёрный с холодным серебряным акцентом',
    isDark: true,
    cssVars: {
      '--background': 'oklch(0.145 0 0)',
      '--foreground': 'oklch(0.985 0 0)',
      '--card': 'oklch(0.205 0 0)',
      '--card-foreground': 'oklch(0.985 0 0)',
      '--popover': 'oklch(0.205 0 0)',
      '--popover-foreground': 'oklch(0.985 0 0)',
      '--primary': 'oklch(0.985 0 0)',
      '--primary-foreground': 'oklch(0.205 0 0)',
      '--secondary': 'oklch(0.269 0 0)',
      '--secondary-foreground': 'oklch(0.985 0 0)',
      '--muted': 'oklch(0.269 0 0)',
      '--muted-foreground': 'oklch(0.708 0 0)',
      '--accent': 'oklch(0.92 0.005 240)',
      '--accent-foreground': 'oklch(0.145 0 0)',
      '--border': 'oklch(1 0 0 / 10%)',
      '--input': 'oklch(1 0 0 / 15%)',
      '--ring': 'oklch(0.708 0 0)',
    },
    swatches: { background: '#1a1a1a', foreground: '#f5f5f5', accent: '#d9dde3' },
  },
  {
    id: 'ivory',
    name: 'Ivory',
    description: 'Тёплый слоновая кость с бронзовым акцентом',
    isDark: false,
    cssVars: {
      '--background': 'oklch(0.98 0.008 80)',
      '--foreground': 'oklch(0.18 0.01 80)',
      '--card': 'oklch(0.995 0.004 80)',
      '--card-foreground': 'oklch(0.18 0.01 80)',
      '--popover': 'oklch(0.995 0.004 80)',
      '--popover-foreground': 'oklch(0.18 0.01 80)',
      '--primary': 'oklch(0.18 0.01 80)',
      '--primary-foreground': 'oklch(0.995 0.004 80)',
      '--secondary': 'oklch(0.95 0.008 80)',
      '--secondary-foreground': 'oklch(0.18 0.01 80)',
      '--muted': 'oklch(0.95 0.008 80)',
      '--muted-foreground': 'oklch(0.5 0.01 80)',
      '--accent': 'oklch(0.55 0.1 60)',
      '--accent-foreground': 'oklch(0.995 0.004 80)',
      '--border': 'oklch(0.9 0.008 80)',
      '--input': 'oklch(0.9 0.008 80)',
      '--ring': 'oklch(0.55 0.1 60)',
    },
    swatches: { background: '#f8f5ef', foreground: '#2a2620', accent: '#9d6d3a' },
  },
  {
    id: 'graphite',
    name: 'Graphite',
    description: 'Тёмно-серый графит с янтарным акцентом',
    isDark: true,
    cssVars: {
      '--background': 'oklch(0.22 0.005 240)',
      '--foreground': 'oklch(0.96 0 0)',
      '--card': 'oklch(0.27 0.005 240)',
      '--card-foreground': 'oklch(0.96 0 0)',
      '--popover': 'oklch(0.27 0.005 240)',
      '--popover-foreground': 'oklch(0.96 0 0)',
      '--primary': 'oklch(0.96 0 0)',
      '--primary-foreground': 'oklch(0.22 0.005 240)',
      '--secondary': 'oklch(0.32 0.005 240)',
      '--secondary-foreground': 'oklch(0.96 0 0)',
      '--muted': 'oklch(0.32 0.005 240)',
      '--muted-foreground': 'oklch(0.72 0 0)',
      '--accent': 'oklch(0.75 0.13 75)',
      '--accent-foreground': 'oklch(0.22 0.005 240)',
      '--border': 'oklch(1 0 0 / 10%)',
      '--input': 'oklch(1 0 0 / 15%)',
      '--ring': 'oklch(0.75 0.13 75)',
    },
    swatches: { background: '#2a2c30', foreground: '#f5f5f5', accent: '#d4a043' },
  },
  {
    id: 'pearl',
    name: 'Pearl',
    description: 'Чистый белый с изумрудным акцентом',
    isDark: false,
    cssVars: {
      '--background': 'oklch(0.99 0 0)',
      '--foreground': 'oklch(0.15 0 0)',
      '--card': 'oklch(1 0 0)',
      '--card-foreground': 'oklch(0.15 0 0)',
      '--popover': 'oklch(1 0 0)',
      '--popover-foreground': 'oklch(0.15 0 0)',
      '--primary': 'oklch(0.15 0 0)',
      '--primary-foreground': 'oklch(0.99 0 0)',
      '--secondary': 'oklch(0.96 0 0)',
      '--secondary-foreground': 'oklch(0.15 0 0)',
      '--muted': 'oklch(0.96 0 0)',
      '--muted-foreground': 'oklch(0.55 0 0)',
      '--accent': 'oklch(0.55 0.12 165)',
      '--accent-foreground': 'oklch(0.99 0 0)',
      '--border': 'oklch(0.9 0 0)',
      '--input': 'oklch(0.9 0 0)',
      '--ring': 'oklch(0.55 0.12 165)',
    },
    swatches: { background: '#fcfcfc', foreground: '#1a1a1a', accent: '#1e8466' },
  },
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Тёмно-синяя полночь с медным акцентом',
    isDark: true,
    cssVars: {
      '--background': 'oklch(0.18 0.025 250)',
      '--foreground': 'oklch(0.97 0.005 250)',
      '--card': 'oklch(0.23 0.025 250)',
      '--card-foreground': 'oklch(0.97 0.005 250)',
      '--popover': 'oklch(0.23 0.025 250)',
      '--popover-foreground': 'oklch(0.97 0.005 250)',
      '--primary': 'oklch(0.97 0.005 250)',
      '--primary-foreground': 'oklch(0.18 0.025 250)',
      '--secondary': 'oklch(0.28 0.025 250)',
      '--secondary-foreground': 'oklch(0.97 0.005 250)',
      '--muted': 'oklch(0.28 0.025 250)',
      '--muted-foreground': 'oklch(0.72 0.01 250)',
      '--accent': 'oklch(0.7 0.14 55)',
      '--accent-foreground': 'oklch(0.18 0.025 250)',
      '--border': 'oklch(1 0 0 / 10%)',
      '--input': 'oklch(1 0 0 / 15%)',
      '--ring': 'oklch(0.7 0.14 55)',
    },
    swatches: { background: '#1c2440', foreground: '#f3f4f8', accent: '#d28a3a' },
  },
  {
    id: 'sand',
    name: 'Sand',
    description: 'Тёплый песочный с терракотовым акцентом',
    isDark: false,
    cssVars: {
      '--background': 'oklch(0.96 0.012 70)',
      '--foreground': 'oklch(0.2 0.02 50)',
      '--card': 'oklch(0.98 0.008 70)',
      '--card-foreground': 'oklch(0.2 0.02 50)',
      '--popover': 'oklch(0.98 0.008 70)',
      '--popover-foreground': 'oklch(0.2 0.02 50)',
      '--primary': 'oklch(0.2 0.02 50)',
      '--primary-foreground': 'oklch(0.98 0.008 70)',
      '--secondary': 'oklch(0.92 0.012 70)',
      '--secondary-foreground': 'oklch(0.2 0.02 50)',
      '--muted': 'oklch(0.92 0.012 70)',
      '--muted-foreground': 'oklch(0.5 0.02 50)',
      '--accent': 'oklch(0.58 0.13 40)',
      '--accent-foreground': 'oklch(0.98 0.008 70)',
      '--border': 'oklch(0.88 0.012 70)',
      '--input': 'oklch(0.88 0.012 70)',
      '--ring': 'oklch(0.58 0.13 40)',
    },
    swatches: { background: '#f5ebda', foreground: '#3a2c1f', accent: '#b8542a' },
  },
  {
    id: 'slate',
    name: 'Slate',
    description: 'Тёмный сланец с акцентом шафран',
    isDark: true,
    cssVars: {
      '--background': 'oklch(0.24 0.008 240)',
      '--foreground': 'oklch(0.96 0 0)',
      '--card': 'oklch(0.29 0.008 240)',
      '--card-foreground': 'oklch(0.96 0 0)',
      '--popover': 'oklch(0.29 0.008 240)',
      '--popover-foreground': 'oklch(0.96 0 0)',
      '--primary': 'oklch(0.96 0 0)',
      '--primary-foreground': 'oklch(0.24 0.008 240)',
      '--secondary': 'oklch(0.34 0.008 240)',
      '--secondary-foreground': 'oklch(0.96 0 0)',
      '--muted': 'oklch(0.34 0.008 240)',
      '--muted-foreground': 'oklch(0.72 0 0)',
      '--accent': 'oklch(0.78 0.14 85)',
      '--accent-foreground': 'oklch(0.24 0.008 240)',
      '--border': 'oklch(1 0 0 / 10%)',
      '--input': 'oklch(1 0 0 / 15%)',
      '--ring': 'oklch(0.78 0.14 85)',
    },
    swatches: { background: '#2e3036', foreground: '#f5f5f5', accent: '#e0b840' },
  },
  {
    id: 'mist',
    name: 'Mist',
    description: 'Светлый туман с акцентом индиго',
    isDark: false,
    cssVars: {
      '--background': 'oklch(0.97 0.004 250)',
      '--foreground': 'oklch(0.18 0.015 250)',
      '--card': 'oklch(0.99 0.002 250)',
      '--card-foreground': 'oklch(0.18 0.015 250)',
      '--popover': 'oklch(0.99 0.002 250)',
      '--popover-foreground': 'oklch(0.18 0.015 250)',
      '--primary': 'oklch(0.18 0.015 250)',
      '--primary-foreground': 'oklch(0.99 0.002 250)',
      '--secondary': 'oklch(0.94 0.004 250)',
      '--secondary-foreground': 'oklch(0.18 0.015 250)',
      '--muted': 'oklch(0.94 0.004 250)',
      '--muted-foreground': 'oklch(0.5 0.015 250)',
      '--accent': 'oklch(0.5 0.18 280)',
      '--accent-foreground': 'oklch(0.99 0.002 250)',
      '--border': 'oklch(0.9 0.004 250)',
      '--input': 'oklch(0.9 0.004 250)',
      '--ring': 'oklch(0.5 0.18 280)',
    },
    swatches: { background: '#f4f5f7', foreground: '#1a1f2e', accent: '#5b34d6' },
  },
];

export type FontPreset = {
  id: string;
  name: string;
  description: string;
  // CSS font-family value to set as --font-sans
  stack: string;
  // Tailwind next/font import info (loaded in layout)
  nextFont: 'inter' | 'manrope' | 'sora' | 'plus-jakarta';
};

export const FONT_PRESETS: FontPreset[] = [
  {
    id: 'inter',
    name: 'Inter',
    description: 'Нейтральный humanist sans-serif (как Apple SF Pro)',
    stack: 'var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
    nextFont: 'inter',
  },
  {
    id: 'manrope',
    name: 'Manrope',
    description: 'Современный geometric sans с мягкими формами',
    stack: 'var(--font-manrope), -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
    nextFont: 'manrope',
  },
  {
    id: 'sora',
    name: 'Sora',
    description: 'Технологичный geometric sans для акцентных ЖК',
    stack: 'var(--font-sora), -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
    nextFont: 'sora',
  },
  {
    id: 'plus-jakarta',
    name: 'Plus Jakarta Sans',
    description: 'Универсальный sans с тёплой геометрией',
    stack: 'var(--font-plus-jakarta), -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
    nextFont: 'plus-jakarta',
  },
];

export function getThemePreset(id: string): ThemePreset {
  return THEME_PRESETS.find((p) => p.id === id) ?? THEME_PRESETS[0];
}

export function getFontPreset(id: string): FontPreset {
  return FONT_PRESETS.find((p) => p.id === id) ?? FONT_PRESETS[0];
}

/**
 * Builds an inline CSS string with all CSS variables for a given preset.
 * Used for SSR injection on a specific ЖК page.
 */
export function buildThemeStyle(themeId: string, fontId: string): string {
  const theme = getThemePreset(themeId);
  const font = getFontPreset(fontId);
  const vars = Object.entries(theme.cssVars)
    .map(([k, v]) => `${k}: ${v};`)
    .join(' ');
  return `${vars} --font-sans: ${font.stack};`;
}

/**
 * Returns the className to apply on <html> for a given theme preset (dark/light mode).
 */
export function getThemeClass(themeId: string): string {
  const theme = getThemePreset(themeId);
  return theme.isDark ? 'dark' : '';
}
