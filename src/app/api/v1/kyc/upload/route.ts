import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import { parseTD1, parseTD3, generateIdentityHash, MRZResult } from '@/lib/kyc';

/**
 * Part 5: Identity Management (KYC)
 * POST /api/v1/kyc/upload
 * Handles identity document upload and initial processing.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const docType = formData.get('docType') as string; // CNI_CI, PASS_CI, SELFIE, RCCM, NIF...
    const entityId = formData.get('entityId') as string; // Optional for corporate docs
    const mrzLine1 = formData.get('mrzLine1') as string;
    const mrzLine2 = formData.get('mrzLine2') as string;
    const mrzLine3 = formData.get('mrzLine3') as string; // For TD1

    if (!file || !docType) {
      return NextResponse.json({ error: 'Fichier et type de document requis' }, { status: 400 });
    }

    // 1. Storage simulation
    const scanS3Key = `kyc/${session.user.id}/${uuidv4()}-${file.name}`;

    // 2. MRZ/Doc Validation (Part 5.2)
    let mrzResult: MRZResult | null = null;
    let docNumberHash: string = uuidv4(); 

    const isCorporateDoc = ['RCCM', 'NIF'].includes(docType);

    if (docType === 'SELFIE' || isCorporateDoc) {
        // No MRZ for these types
        const docNumber = isCorporateDoc ? (formData.get('docNumber') as string) : `SELFIE-${session.user.id}`;
        if (isCorporateDoc && !docNumber) {
            return NextResponse.json({ error: 'Numéro de document requis pour RCCM/NIF' }, { status: 400 });
        }
        
        mrzResult = { 
            isValid: true, 
            data: { 
                documentType: docType, 
                documentNumber: docNumber || uuidv4(), 
                issuer: 'USER', 
                fullName: session.user.name || undefined, 
                birthDate: '', 
                nationality: '', 
                expiryDate: '' 
            } 
        };
    } else {
        if (mrzLine3) {
            mrzResult = parseTD1(mrzLine1, mrzLine2, mrzLine3);
        } else if (mrzLine1 && mrzLine2) {
            mrzResult = parseTD3(mrzLine1, mrzLine2);
        } else {
            return NextResponse.json({ error: 'Données MRZ incomplètes' }, { status: 400 });
        }
    }

    if (!mrzResult || !mrzResult.isValid || !mrzResult.data) {
        return NextResponse.json({ error: `MRZ Invalide: ${mrzResult?.error || 'Erreur inconnue'}` }, { status: 400 });
    }

    const mrz = mrzResult.data;

    // 3. Identity Deduplication (Part 5.4 - only for individual ID documents)
    const isIdentityDoc = ['CNI_CI', 'PASS_CI', 'PASS_INT'].includes(docType);
    if (isIdentityDoc) {
        docNumberHash = await generateIdentityHash(mrz.documentNumber, mrz.fullName || "", mrz.birthDate);

        // Check deduplication
        const existingDoc = await prisma.identityDocument.findUnique({
            where: { docNumberHash }
        });

        if (existingDoc && existingDoc.userId !== session.user.id) {
            return NextResponse.json({ error: 'Ce document d\'identité est déjà utilisé par un autre compte.' }, { status: 409 });
        }
    } else {
        // For selfies or corporate docs, unique hash per upload
        docNumberHash = await generateIdentityHash(mrz.documentNumber, session.user.id, new Date().toISOString());
    }

    // 4. Create or Update IdentityDocument entry
    const doc = await prisma.identityDocument.upsert({
        where: { docNumberHash },
        update: {
            status: 'pending',
            scanS3Key,
            legalEntityId: entityId || undefined,
            mrzRawData: !mrzLine1 ? null : `${mrzLine1}\n${mrzLine2}${mrzLine3 ? '\n' + mrzLine3 : ''}`,
            fullName: mrz.fullName,
            birthDate: mrz.birthDate && mrz.birthDate !== '' ? new Date(mrz.birthDate.replace(/(\d{2})(\d{2})(\d{2})/, '$1-$2-$3')) : null,
            nationality: mrz.nationality,
            expiryDate: mrz.expiryDate && mrz.expiryDate !== '' ? new Date(mrz.expiryDate.replace(/(\d{2})(\d{2})(\d{2})/, '$1-$2-$3')) : null,
        },
        create: {
            userId: session.user.id,
            legalEntityId: entityId || undefined,
            docType,
            docNumber: mrz.documentNumber,
            docNumberHash,
            scanS3Key,
            status: 'pending',
            mrzRawData: !mrzLine1 ? null : `${mrzLine1}\n${mrzLine2}${mrzLine3 ? '\n' + mrzLine3 : ''}`,
            fullName: mrz.fullName,
            birthDate: mrz.birthDate && mrz.birthDate !== '' ? new Date(mrz.birthDate.replace(/(\d{2})(\d{2})(\d{2})/, '$1-$2-$3')) : null,
            nationality: mrz.nationality,
            expiryDate: mrz.expiryDate && mrz.expiryDate !== '' ? new Date(mrz.expiryDate.replace(/(\d{2})(\d{2})(\d{2})/, '$1-$2-$3')) : null,
        }
    });

    // 5. Upgrade User KYC Level
    const currentKycLevel = session.user.kycLevel || 1;
    let nextLevel = currentKycLevel;

    if (isIdentityDoc) nextLevel = Math.max(nextLevel, 2);
    if (docType === 'SELFIE' && currentKycLevel >= 2) nextLevel = Math.max(nextLevel, 3);
    if (isCorporateDoc && currentKycLevel >= 3) nextLevel = Math.max(nextLevel, 4);

    await prisma.user.update({
        where: { id: session.user.id },
        data: { 
            kycStatus: 'under_review', 
            kycLevel: nextLevel,
            fullName: mrz.fullName && isIdentityDoc ? mrz.fullName : undefined
        } 
    });

    return NextResponse.json({
      success: true,
      documentId: doc.id,
      status: 'under_review',
      kycLevel: nextLevel,
      message: 'Document validé et en attente de vérification manuelle.'
    });

  } catch (error) {
    console.error('[KYC UPLOAD ERROR]', error);
    return NextResponse.json({ error: 'Erreur lors du traitement du document' }, { status: 500 });
  }
}
