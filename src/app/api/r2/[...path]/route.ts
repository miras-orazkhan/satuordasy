import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import path from 'node:path';

/**
 * GET /api/r2/[...path]
 *
 * Streams an object from Cloudflare R2 to the browser.
 * This is a fallback when R2.dev subdomain or custom domain is NOT enabled
 * on the bucket — Vercel reads the object via S3 API (signed credentials)
 * and serves it publicly.
 *
 * For production with high traffic, enable R2.dev subdomain or a custom
 * domain (cdn.satuordasy.com) and set R2_PUBLIC_URL accordingly — that bypasses
 * this proxy entirely and serves directly from Cloudflare's edge.
 */

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;

function isR2Configured() {
  return Boolean(
    R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_BUCKET_NAME
  );
}

function getR2Client(): S3Client {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID!,
      secretAccessKey: R2_SECRET_ACCESS_KEY!,
    },
  });
}

const CONTENT_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
};

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  if (!isR2Configured()) {
    return new Response('R2 not configured', { status: 500 });
  }

  const { path: pathSegments } = await params;
  const key = pathSegments.join('/');
  // Path traversal check
  if (key.includes('..') || path.isAbsolute(key)) {
    return new Response('Forbidden', { status: 403 });
  }

  try {
    const result = await getR2Client().send(
      new GetObjectCommand({
        Bucket: R2_BUCKET_NAME!,
        Key: key,
      })
    );

    if (!result.Body) {
      return new Response('Not Found', { status: 404 });
    }

    // Determine content type from extension
    const ext = path.extname(key).toLowerCase();
    const contentType = result.ContentType || CONTENT_TYPES[ext] || 'application/octet-stream';

    // @ts-expect-error: result.Body is a ReadableStream in browser, Node stream on server
    const body: ReadableStream<Uint8Array> = result.Body;

    // Forward cache control from R2 if present, otherwise set our own
    const cacheControl =
      result.CacheControl || 'public, max-age=31536000, immutable';

    return new Response(body as unknown as BodyInit, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': cacheControl,
        'Content-Length': result.ContentLength?.toString() ?? '',
      },
    });
  } catch (e: any) {
    if (e?.$metadata?.httpStatusCode === 404 || e?.name === 'NoSuchKey') {
      return new Response('Not Found', { status: 404 });
    }
    console.error('R2 proxy error:', e?.message);
    return new Response('Internal Server Error', { status: 500 });
  }
}
