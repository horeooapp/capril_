import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/jwt';
import { writeAuditLog } from '@/lib/audit';
import * as crypto from 'crypto';

function encryptDocNumber(value: string): string {
    const rawKey = process.env.DOCUMENT_ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET || 'fallback_key_replace_in_prod';
    const key = crypto.createHash('sha256').update(rawKey).digest();
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted.toString('base64')}`;
}

/**
 * PATCH /api/v1/proprietaires/me/profile
 * Met à jour les informations du propriétaire et élève le niveau KYC
 */
export async function PATCH(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user || !['LANDLORD', 'LANDLORD_PRO', 'AGENCY', 'DIASPORA', 'TENANT'].includes(user.role as string)) {
      return NextResponse.json({ error: 'Non autorisé ou rôle incorrect' }, { status: 401 });
    }

    const { firstName, lastName, birthDate, birthPlace, neighborhood, phone, avatarUrl, docType, docNumber } = await req.json();

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { kycLevel: true }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }

    let newKycLevel = dbUser.kycLevel;
    const hasAllRequired = firstName && lastName && birthDate && birthPlace && neighborhood && phone && docType && docNumber;

    if (hasAllRequired && newKycLevel < 2) {
      newKycLevel = 2;
    }

    const fullName = `${firstName?.trim() || ''} ${lastName?.trim() || ''}`.trim() || undefined;

    const updated = await prisma.$transaction(async (tx) => {
      const u = await tx.user.update({
        where: { id: user.id },
        data: {
          firstName,
          lastName,
          fullName,
          birthDate: birthDate ? new Date(birthDate) : null,
          birthPlace,
          neighborhood,
          phone,
          ...(avatarUrl && { avatarUrl }),
          kycLevel: newKycLevel
        }
      });

      if (docType && docNumber) {
        const existingDoc = await tx.identityDocument.findFirst({
            where: { userId: user.id }
        });

        if (existingDoc) {
            await tx.identityDocument.update({
                where: { id: existingDoc.id },
                data: {
                    docType,
                    docNumber,
                    docNumberEnc: encryptDocNumber(docNumber),
                    docNumberHash: `${user.id}_${docType}_${docNumber}`,
                    fullName,
                    birthDate: birthDate ? new Date(birthDate) : null
                }
            });
        } else {
            await tx.identityDocument.create({
                data: {
                    userId: user.id,
                    docType,
                    docNumber,
                    docNumberEnc: encryptDocNumber(docNumber),
                    docNumberHash: `${user.id}_${docType}_${docNumber}`,
                    status: 'pending',
                    fullName,
                    birthDate: birthDate ? new Date(birthDate) : null
                }
            });
        }
      }

      return u;
    });

    try {
      if (newKycLevel > dbUser.kycLevel) {
        await writeAuditLog({
          userId: user.id,
          action: "PROFILE_UPDATED",
          module: "USER_KYC",
          entityId: user.id,
          newValues: { kycLevel: newKycLevel }
        });
      }
    } catch (e) {
      console.warn("Audit Log Error:", e);
    }

    return NextResponse.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      kycLevel: newKycLevel,
      user: {
        fullName: (updated.firstName ? updated.firstName + " " : "") + (updated.lastName || ""),
        phone: updated.phone
      }
    });
  } catch (error: any) {
    console.error('[API KYC PROFILE] Update Error:', error);
    return NextResponse.json({ error: error.message || 'Erreur interne' }, { status: 500 });
  }
}
