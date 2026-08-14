/**
 * File upload helper.
 * In dev/sandbox: stores files locally under /public/uploads/.
 * In production: would be replaced by R2/S3 adapter (same interface — upload(file) -> url).
 */
import path from 'node:path';
import fs from 'node:fs/promises';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

export type UploadedFile = {
  url: string; // public URL, e.g. /uploads/abc-123.jpg
  filename: string;
  size: number;
};

export async function saveFile(file: File): Promise<UploadedFile> {
  // Ensure dir exists
  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  const buf = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name).toLowerCase().slice(0, 8) || '.bin';
  // Whitelist extensions
  const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.pdf', '.gif'];
  const safeExt = allowed.includes(ext) ? ext : '.bin';

  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const filename = `${id}${safeExt}`;
  const filepath = path.join(UPLOAD_DIR, filename);
  await fs.writeFile(filepath, buf);

  return {
    url: `/uploads/${filename}`,
    filename: file.name,
    size: file.size,
  };
}

export async function deleteFile(url: string): Promise<void> {
  if (!url.startsWith('/uploads/')) return;
  const filepath = path.join(UPLOAD_DIR, path.basename(url));
  try {
    await fs.unlink(filepath);
  } catch {
    // ignore — file may not exist
  }
}
