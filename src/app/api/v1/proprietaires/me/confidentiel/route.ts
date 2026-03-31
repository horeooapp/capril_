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
    if (!user || (user.role !== 'LANDLORD' && user.profileType !== 'DIASPORA')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { isConfidential } = body;

    if (typeof isConfidential !== 'boolean') {
      return NextResponse.json({ error: 'La propriété isConfidential est requise (true/false).' }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let nextLandlordCode = dbUser.landlordCode;
    
    // Auto-generate if it doesn't exist
    if (isConfidential && (!nextLandlordCode || nextLandlordCode === 'BAI-XXX')) {
      const randomInt = Math.floor(1000 + Math.random() * 9000);
      nextLandlordCode = `BAI-${randomInt}`;
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isConfidential,
        landlordCode: nextLandlordCode
      }
    });

    return NextResponse.json({ 
        success: true, 
        isConfidential: updatedUser.isConfidential,
        landlordCode: updatedUser.landlordCode,
        message: isConfidential 
          ? `Mode confidentiel activé. Votre alias est ${updatedUser.landlordCode}.` 
          : "Le mode confidentiel est désactivé. Vos gestionnaires verront votre véritable identité."
    });

  } catch (error: any) {
    console.error('[API PROPRIO] Patch Confidential Error:', error);
    return NextResponse.json({ error: 'Erreur technique lors de la mise à jour.' }, { status: 500 });
  }
}
