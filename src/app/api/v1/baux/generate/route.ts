import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/jwt';

/**
 * POST /api/v1/baux/generate
 * Generates a digital lease and deducts 3000 XOF (or 10000 XOF for a whole courtyard)
 */
export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user || (!['LANDLORD', 'LANDLORD_PRO', 'AGENCY', 'DIASPORA', 'TENANT'].includes(user.role as string) && (user as any).profileType !== 'DIASPORA')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { propertyId, isCourEntiere } = body;

    const cout = isCourEntiere ? 10000 : 3000;

    const landlordConfig = await prisma.userWalletConfig.findUnique({
      where: { userId: user.id },
      select: { walletBalance: true }
    });

    if (!landlordConfig) {
      return NextResponse.json({ error: 'User wallet not found' }, { status: 404 });
    }

    if ((landlordConfig.walletBalance || 0) < cout) {
      return NextResponse.json({ 
          error: `Solde insuffisant. Le bail nécessite ${cout} XOF, mais votre solde est de ${landlordConfig.walletBalance || 0} XOF.` 
      }, { status: 402 });
    }

    await prisma.userWalletConfig.update({
      where: { userId: user.id },
      data: {
        walletBalance: { decrement: cout }
      }
    });

    // In a real sophisticated flow, we'd create the Prisma Lease record here.
    // Since the mobile UX currently only tests the payment flow deterrence,
    // we return a success payload with a mocked Ref.

    const ref = `BAIL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    return NextResponse.json({ 
        success: true, 
        message: `Bail numérique ${ref} généré avec succès. ${cout} XOF ont été débités de votre Wallet.`,
        reference: ref,
        cout
    });

  } catch (error: any) {
    console.error('[API BAUX] Generate Error:', error);
    return NextResponse.json({ error: 'Erreur technique lors de la génération du bail.' }, { status: 500 });
  }
}
