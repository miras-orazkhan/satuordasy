import { promises as fs } from 'node:fs';
import path from 'node:path';

const PROJECT_ROOT = process.env.PROJECT_ROOT || '/home/z/my-project';
const UPLOAD_DIR = path.join(PROJECT_ROOT, 'public', 'uploads');

// Serve uploaded files from a known absolute path, independent of process.cwd()
// (works in standalone build where cwd is .next/standalone)
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;
  // Sanitize path — reject any .. traversal
  const joined = pathSegments.join('/');
  if (joined.includes('..') || path.isAbsolute(joined)) {
    return new Response('Forbidden', { status: 403 });
  }

  const filepath = path.join(UPLOAD_DIR, joined);
  // Final realpath check
  const realUpload = await fs.realpath(UPLOAD_DIR).catch(() => UPLOAD_DIR);
  const realFile = await fs.realpath(filepath).catch(() => null);
  if (!realFile || !realFile.startsWith(realUpload)) {
    return new Response('Not Found', { status: 404 });
  }

  try {
    const buf = await fs.readFile(filepath);
    // Determine content type from extension
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
