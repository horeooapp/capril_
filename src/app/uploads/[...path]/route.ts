import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { UPLOADS_DIR } from '@/lib/storage';
import { auth } from '@/auth';

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

    // Documents sensibles (KYC, identité, quittances, justificatifs) : accès sécurisé et restreint
    const sensitiveFolders = ['kyc', 'identity', 'receipts', 'justificatifs'];
    const isSensitive = sensitiveFolders.includes(pathSegments[0]);

    if (isSensitive) {
      const session = await auth();
      let userId = session?.user?.id;
      let role = String((session?.user as any)?.role || '').toUpperCase();

      if (!userId) {
        const { authenticateMobileRequest } = await import('@/lib/mobile-auth');
        const mobileUser = await authenticateMobileRequest(req);
        if (mobileUser) {
          userId = mobileUser.userId;
          role = String(mobileUser.role || '').toUpperCase();
        }
      }

      if (!userId) {
        return new NextResponse('Unauthorized', { status: 401 });
      }

      let isStaff = ['ADMIN', 'SUPER_ADMIN', 'ANAH_AGENT', 'CDC_AGENT'].includes(role);
      if (!isStaff && userId) {
        const { prisma } = await import('@/lib/prisma');
        const dbUser = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
        isStaff = ['ADMIN', 'SUPER_ADMIN', 'ANAH_AGENT', 'CDC_AGENT'].includes(String(dbUser?.role || '').toUpperCase());
      }

      const isOwner = (pathSegments.length > 1 && pathSegments[1] === userId) || isStaff;

      // Pour les pièces d'identité et KYC : uniquement le titulaire du compte ou le personnel habilité
      if ((pathSegments[0] === 'kyc' || pathSegments[0] === 'identity') && !isOwner) {
        return new NextResponse('Forbidden', { status: 403 });
      }
    }

    // Protection Path Traversal
    const safeSubPath = path.join(...pathSegments);
    const fullPath = path.resolve(UPLOADS_DIR, safeSubPath);

    if (!fullPath.startsWith(path.resolve(UPLOADS_DIR))) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const fileBuffer = await fs.readFile(fullPath);
    let outputBuffer: Buffer = fileBuffer;
    try {
      const { decryptFileBuffer } = await import('@/lib/encryption');
      outputBuffer = await decryptFileBuffer(fileBuffer);
    } catch (decErr) {
      console.warn('[UPLOADS] Erreur déchiffrement buffer:', decErr);
    }

    const ext = path.extname(fullPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    return new NextResponse(outputBuffer as any, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': isSensitive ? 'private, no-store' : 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
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
