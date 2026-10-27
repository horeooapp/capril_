import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { UPLOADS_DIR } from '@/lib/storage';

export const dynamic = 'force-dynamic';

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.mp4': 'video/mp4',
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const pathSegments = resolvedParams.path || [];

    if (!pathSegments.length) {
      return new NextResponse('Not Found', { status: 404 });
    }

    // Protection Path Traversal
    const safeSubPath = path.join(...pathSegments);
    const fullPath = path.resolve(UPLOADS_DIR, safeSubPath);

    if (!fullPath.startsWith(path.resolve(UPLOADS_DIR))) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const fileBuffer = await fs.readFile(fullPath);
    const ext = path.extname(fullPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return new NextResponse('File Not Found', { status: 404 });
    }
    console.error('[UPLOADS GET ERROR]:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
