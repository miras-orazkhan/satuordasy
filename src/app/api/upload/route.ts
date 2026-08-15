import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { saveFile } from '@/lib/storage';

/**
 * POST /api/upload
 * Accepts multipart/form-data with a single `file` field.
 * Returns { url, filename, size }.
 *
 * Files are stored in:
 *   - Cloudflare R2 (if R2_* env vars are set) — production
 *   - /tmp/uploads on Vercel (if no R2) — preview only, NOT persistent
 *   - ./public/uploads in local dev
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Only admins can upload (managers have no access to content editing)
  if (session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Limit to 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 413 });
    }

    const result = await saveFile(file);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: 'Failed to save file: ' + (e instanceof Error ? e.message : 'unknown') },
      { status: 500 }
    );
  }
}

// GET returns 405 Method Not Allowed — endpoint only accepts POST
export async function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}
