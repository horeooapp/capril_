import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

/**
 * GET /api/v1/wallet/deeplink/[id]/tracker
 * Records the click and redirects the user to the provider's URL.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const link = await prisma.walletRechargeLink.findUnique({
      where: { id }
    });

    if (!link) {
      return NextResponse.json({ error: 'Lien introuvable ou expiré' }, { status: 404 });
    }

    // Mise à jour des stats de clic
    await prisma.walletRechargeLink.update({
      where: { id },
      data: {
        clique: true,
        cliqueAt: new Date(),
        clicsCompteur: { increment: 1 }
      }
    });

    // Redirection vers l'URL générée (Wave, Orange, CinetPay...)
    redirect(link.urlGeneree);

  } catch (error: any) {
    if (error.message === 'NEXT_REDIRECT') throw error; // Handle redirect properly in Next.js
    console.error('[WALLET_TRACKER] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
