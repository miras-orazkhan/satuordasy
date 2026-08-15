import { promises as fs } from 'node:fs';
import path from 'node:path';

// Serve files stored in /tmp/uploads (Vercel fallback when R2 is not configured).
// On Vercel serverless, /tmp is the only writable directory.
// Note: /tmp is NOT persistent across cold starts — files will be lost when the
// serverless function spins down. For production use, configure R2 (see storage.ts).

function getUploadDir(): string {
  return process.env.VERCEL ? '/tmp/uploads' : path.join(process.cwd(), 'public', 'uploads');
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;
  const joined = pathSegments.join('/');
  if (joined.includes('..') || path.isAbsolute(joined)) {
    return new Response('Forbidden', { status: 403 });
  }

  const uploadDir = getUploadDir();
  const filepath = path.join(uploadDir, joined);
  const realUpload = await fs.realpath(uploadDir).catch(() => uploadDir);
  const realFile = await fs.realpath(filepath).catch(() => null);
  if (!realFile || !realFile.startsWith(realUpload)) {
    return new Response('Not Found', { status: 404 });
  }

  try {
    const buf = await fs.readFile(filepath);
    const ext = path.extname(filepath).toLowerCase();
    const types: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.pdf': 'application/pdf',
    };
    const contentType = types[ext] ?? 'application/octet-stream';

    return new Response(buf, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new Response('Not Found', { status: 404 });
  }
}
