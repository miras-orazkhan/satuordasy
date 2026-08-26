export function cleanText(value: FormDataEntryValue | null, maxLength: number): string { return String(value ?? '').trim().slice(0, maxLength); }

export function sanitizeEmbedCode(value: string): string {
  const code = value.trim();
  if (!code) return '<p class="empty">Форма временно недоступна.</p>';
  if (!/bitrix24\.(ru|kz)|b24\.io/i.test(code)) return '<p class="empty">Некорректная конфигурация CRM-формы.</p>';
  return code;
}
