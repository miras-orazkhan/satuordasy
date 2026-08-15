import { promises as fs } from 'node:fs';
import path from 'node:path';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

/**
 * GET /api/uploads/[...path]
 *
 * Serves files from /tmp/uploads (Vercel fallback when R2 is not configured).
 *
 * IMPORTANT: Vercel /tmp is NOT persistent across cold starts. If a user uploaded
 * a file via /api/upload when R2 was not yet configured, the file went to /tmp,
 * but after a cold start it's gone — yet the URL /api/uploads/<filename> is
 * stored in the DB. This route falls back to R2 (if configured) to recover
 * those files when they're missing from /tmp.
 *
 * Why this matters: when you switch from /tmp mode to R2 mode mid-project,
 * old /api/uploads/* URLs would 404. With this fallback, we try R2 first
 * (key = uploads/<filename>) and only then /tmp.
 */

function getUploadDir(): string {
  return process.env.VERCEL ? '/tmp/uploads' : path.join(process.cwd(), 'public', 'uploads');
}

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

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;
  const joined = pathSegments.join('/');
  if (joined.includes('..') || path.isAbsolute(joined)) {
    return new Response('Forbidden', { status: 403 });
  }

  const ext = path.extname(joined).toLowerCase();
  const contentType = CONTENT_TYPES[ext] ?? 'application/octet-stream';
  const cacheControl = 'public, max-age=31536000, immutable';

  // 1. Try R2 first (if configured) — this recovers old /api/uploads/* URLs
  //    that were stored before R2 was enabled, but the file was later uploaded
  //    to R2 (or was always in R2).
  if (isR2Configured()) {
    try {
      const r2Key = `uploads/${joined}`;
      const result = await getR2Client().send(
        new GetObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME!,
          Key: r2Key,
        })
      );
      if (result.Body) {
        // @ts-expect-error: Node stream vs web stream typing
        const body: ReadableStream<Uint8Array> = result.Body;
        return new Response(body as unknown as BodyInit, {
          headers: {
            'Content-Type': result.ContentType || contentType,
            'Cache-Control': result.CacheControl || cacheControl,
            'Content-Length': result.ContentLength?.toString() ?? '',
          },
        });
      }
    } catch {
      // Not in R2, fall through to /tmp
    }
  }

  // 2. Try local /tmp (Vercel) or ./public/uploads (dev)
  const uploadDir = getUploadDir();
  const filepath = path.join(uploadDir, joined);
  const realUpload = await fs.realpath(uploadDir).catch(() => uploadDir);
  const realFile = await fs.realpath(filepath).catch(() => null);
  if (realFile && realFile.startsWith(realUpload)) {
    try {
      const buf = await fs.readFile(filepath);
      return new Response(buf, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': cacheControl,
        },
      });
    } catch {
      // fall through
    }
  }

  return new Response('Not Found', { status: 404 });
}
