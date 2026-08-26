export type PageOptions = { title: string; description?: string; body: string; head?: string; bodyClass?: string; style?: string };

export function escapeHtml(value: unknown): string {
  return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

export function escapeAttribute(value: unknown): string { return escapeHtml(value).replaceAll('`', '&#096;'); }

export function safeUrl(value: unknown): string {
  const url = String(value ?? '').trim();
  if (!url) return '';
  if (url.startsWith('/') || url.startsWith('#')) return escapeAttribute(url);
  try { return ['http:', 'https:'].includes(new URL(url).protocol) ? escapeAttribute(url) : ''; } catch { return ''; }
}

export function page({ title, description = '', body, head = '', bodyClass = '', style = '' }: PageOptions): string {
  return `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title>${description ? `<meta name="description" content="${escapeAttribute(description)}">` : ''}<link rel="stylesheet" href="/assets/app.css"><link rel="stylesheet" href="/assets/admin.css"><link rel="stylesheet" href="/assets/editor.css"><script src="/assets/htmx.min.js" defer></script>${style ? `<style>:root{${style}}</style>` : ''}${head}</head><body class="${escapeAttribute(bodyClass)}">${body}<div id="toast" aria-live="polite" aria-atomic="true"></div></body></html>`;
}

export function fragmentMessage(kind: 'success' | 'error', message: string): string {
  return `<div class="notice notice--${kind}" role="${kind === 'error' ? 'alert' : 'status'}">${escapeHtml(message)}</div>`;
}
