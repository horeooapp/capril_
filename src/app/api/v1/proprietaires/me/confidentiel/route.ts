import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/jwt';

/**
 * PATCH /api/v1/proprietaires/me/confidentiel
 * Toggle landlord confidentiality and generate BAI-NNN if missing.
 */
export async function PATCH(req: Request) {
  try {
    const user = await getAuthUser(req);
    // Allow landlords and diaspora to manage confidentiality
    if (!user || (!['LANDLORD', 'LANDLORD_PRO', 'AGENCY', 'DIASPORA', 'TENANT'].includes(user.role as string) && (user as any).profileType !== 'DIASPORA')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { isConfidential } = body;

    if (typeof isConfidential !== 'boolean') {
      return NextResponse.json({ error: 'La propriété isConfidential est requise (true/false).' }, { status: 400 });
    }

    const userWallet = await prisma.userWalletConfig.findUnique({
      where: { userId: user.id }
    });

    let nextLandlordCode = userWallet?.landlordCode;
    
    // Auto-generate if it doesn't exist
    if (isConfidential && (!nextLandlordCode || nextLandlordCode === 'BAI-XXX')) {
      const randomInt = Math.floor(1000 + Math.random() * 9000);
      nextLandlordCode = `BAI-${randomInt}`;
    }

    const updatedUserWallet = await prisma.userWalletConfig.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        isConfidential,
        landlordCode: nextLandlordCode
      },
      update: {
        isConfidential,
        landlordCode: nextLandlordCode
      }
    });

    return NextResponse.json({ 
        success: true, 
        isConfidential: updatedUserWallet.isConfidential,
        landlordCode: updatedUserWallet?.landlordCode,
        message: isConfidential 
          ? `Mode confidentiel activé. Votre alias est ${updatedUserWallet?.landlordCode}.` 
          : "Le mode confidentiel est désactivé. Vos gestionnaires verront votre véritable identité."
    });

  } catch (error: any) {
    console.error('[API PROPRIO] Patch Confidential Error:', error);
    return NextResponse.json({ error: 'Erreur technique lors de la mise à jour.' }, { status: 500 });
  }
}
