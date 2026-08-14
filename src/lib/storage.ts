/**
 * File upload helper.
 *
 * Production (Vercel): uses Cloudflare R2 via S3-compatible API.
 *   Required env vars:
 *     R2_ACCOUNT_ID
 *     R2_ACCESS_KEY_ID
 *     R2_SECRET_ACCESS_KEY
 *     R2_BUCKET_NAME
 *     R2_PUBLIC_URL  (e.g. https://cdn.satuordasy.com or https://pub-xxx.r2.dev)
 *
 * Fallback (no R2 configured): writes to /tmp/uploads (only writable dir on Vercel
 * serverless). Note: /tmp is NOT persistent — files are lost on cold start.
 * Suitable for local dev only.
 */
import path from 'node:path';
import fs from 'node:fs/promises';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

export type UploadedFile = {
  url: string; // public URL, e.g. https://cdn.satuordasy.com/uploads/abc-123.jpg
  filename: string;
  size: number;
};

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.pdf', '.gif'];

function isR2Configured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET_NAME &&
      process.env.R2_PUBLIC_URL
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

async function uploadToR2(file: File, key: string): Promise<string> {
  const buf = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(key);
  const contentType: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.bin': 'application/octet-stream',
  };

  await getR2Client().send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: buf,
      ContentType: contentType[ext] ?? 'application/octet-stream',
      CacheControl: 'public, max-age=31536000, immutable',
    })
  );

  // Return public URL
  const baseUrl = process.env.R2_PUBLIC_URL!.replace(/\/+$/, '');
  return `${baseUrl}/${key}`;
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
  // R2 delete
  if (isR2Configured() && process.env.R2_PUBLIC_URL && url.startsWith(process.env.R2_PUBLIC_URL)) {
    const key = url.slice(process.env.R2_PUBLIC_URL.length).replace(/^\/+/, '');
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
