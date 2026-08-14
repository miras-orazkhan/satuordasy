/**
 * File upload helper.
 *
 * Production (Vercel): uses Cloudflare R2 via S3-compatible API.
 *   Required env vars for R2:
 *     R2_ACCOUNT_ID
 *     R2_ACCESS_KEY_ID
 *     R2_SECRET_ACCESS_KEY
 *     R2_BUCKET_NAME
 *
 *   Optional (for direct CDN serving):
 *     R2_PUBLIC_URL  (e.g. https://cdn.satuordasy.com or https://pub-xxx.r2.dev)
 *     If set, uploaded file URLs are absolute URLs to R2.dev/custom domain.
 *     If NOT set, file URLs point to /api/r2/<key> — a Next.js route handler
 *     that streams objects from R2 via S3 API. This works without enabling
 *     public access on the bucket, but adds latency (Vercel → R2 → browser).
 *
 * Fallback (no R2 configured): writes to /tmp/uploads (Vercel) or
 * ./public/uploads (local dev). Vercel /tmp is NOT persistent.
 */
import path from 'node:path';
import fs from 'node:fs/promises';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

export type UploadedFile = {
  url: string; // public URL, e.g. https://cdn.satuordasy.com/uploads/abc-123.jpg or /api/r2/uploads/abc-123.jpg
  filename: string;
  size: number;
};

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.pdf', '.gif'];

const CONTENT_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.bin': 'application/octet-stream',
};

function isR2Configured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET_NAME
  );
}

function getR2Client(): S3Client {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

function sanitizeExtension(name: string): string {
  const ext = path.extname(name).toLowerCase().slice(0, 8) || '.bin';
  return ALLOWED_EXTENSIONS.includes(ext) ? ext : '.bin';
}

function generateKey(name: string): string {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return `uploads/${id}${sanitizeExtension(name)}`;
}

/**
 * Returns the public URL for an R2 object.
 * - If R2_PUBLIC_URL is set, returns `${R2_PUBLIC_URL}/${key}` (direct CDN access)
 * - Otherwise returns `/api/r2/${key}` (proxied via Next.js route handler)
 */
function buildR2Url(key: string): string {
  if (process.env.R2_PUBLIC_URL) {
    const baseUrl = process.env.R2_PUBLIC_URL.replace(/\/+$/, '');
    return `${baseUrl}/${key}`;
  }
  return `/api/r2/${key}`;
}

async function uploadToR2(file: File, key: string): Promise<string> {
  const buf = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(key);

  await getR2Client().send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: buf,
      ContentType: CONTENT_TYPES[ext] ?? 'application/octet-stream',
      CacheControl: 'public, max-age=31536000, immutable',
    })
  );

  // Return public URL — either direct CDN (if R2_PUBLIC_URL is set)
  // or proxied via /api/r2/<key> (works without public access on bucket)
  return buildR2Url(key);
}

async function uploadToLocal(file: File): Promise<{ url: string; key: string }> {
  // Vercel: only /tmp is writable. Local dev: use ./public/uploads.
  const uploadDir = process.env.VERCEL ? '/tmp/uploads' : path.join(process.cwd(), 'public', 'uploads');
  await fs.mkdir(uploadDir, { recursive: true });

  const key = generateKey(file.name);
  const filename = path.basename(key);
  const buf = Buffer.from(await file.arrayBuffer());
  const filepath = path.join(uploadDir, filename);
  await fs.writeFile(filepath, buf);

  // On Vercel, /tmp is not web-accessible; we serve via /api/uploads/[...path]
  // On local dev, /public/uploads/ is served directly by Next.js.
  const url = process.env.VERCEL ? `/api/uploads/${filename}` : `/uploads/${filename}`;
  return { url, key };
}

export async function saveFile(file: File): Promise<UploadedFile> {
  if (isR2Configured()) {
    const key = generateKey(file.name);
    const url = await uploadToR2(file, key);
    return {
      url,
      filename: file.name,
      size: file.size,
    };
  }

  // Fallback: local /tmp or ./public/uploads
  const { url } = await uploadToLocal(file);
  return {
    url,
    filename: file.name,
    size: file.size,
  };
}

export async function deleteFile(url: string): Promise<void> {
  // R2 delete — direct CDN URL (R2_PUBLIC_URL was set)
  const r2PublicUrl = process.env.R2_PUBLIC_URL;
  if (r2PublicUrl && url.startsWith(r2PublicUrl)) {
    const key = url.slice(r2PublicUrl.length).replace(/^\/+/, '');
    try {
      await getR2Client().send(
        new DeleteObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME!,
          Key: key,
        })
      );
    } catch {
      // ignore — file may not exist
    }
    return;
  }

  // R2 delete — proxied URL (/api/r2/uploads/xxx.png)
  if (url.startsWith('/api/r2/')) {
    const key = url.slice('/api/r2/'.length);
    try {
      await getR2Client().send(
        new DeleteObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME!,
          Key: key,
        })
      );
    } catch {
      // ignore
    }
    return;
  }

  // Local delete (dev only)
  if (url.startsWith('/uploads/') || url.startsWith('/api/uploads/')) {
    const filename = path.basename(url);
    const uploadDir = process.env.VERCEL ? '/tmp/uploads' : path.join(process.cwd(), 'public', 'uploads');
    const filepath = path.join(uploadDir, filename);
    try {
      await fs.unlink(filepath);
    } catch {
      // ignore
    }
  }
}
