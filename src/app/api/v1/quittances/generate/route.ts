import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/jwt';
import crypto from 'crypto';

/**
 * POST /api/v1/quittances/generate
 * Generates an SHA-256 Quittance and deducts 90 FCFA from the landlord's wallet.
 */
export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    // Allowing INTERMEDIAIRE (ACT-05) to generate quittance if they have rights?
    // Let's keep it open to landlords, diaspora, and agents.
    if (!user || (!['LANDLORD', 'LANDLORD_PRO', 'AGENCY', 'DIASPORA', 'TENANT'].includes(user.role as string) && (user as any).profileType !== 'DIASPORA' && user.role !== 'NON_CERTIFIED_AGENT')) {
      return NextResponse.json({ error: 'Unauthorized to emit quittances.' }, { status: 401 });
    }

    const { unitId } = await req.json().catch(() => ({}));
    const cout = 90;

    // The landlord's wallet is deducted even if the agent is the one clicking emitting.
    // In our simplified mock, we assume the connected user is paying (the landlord or agent).
    const payerConfig = await prisma.userWalletConfig.findUnique({
      where: { userId: user.id },
      select: { walletBalance: true }
    });

    if (!payerConfig) {
      return NextResponse.json({ error: 'User wallet not found' }, { status: 404 });
    }

    if ((payerConfig.walletBalance || 0) < cout) {
      return NextResponse.json({ 
          error: `Solde Wallet insuffisant. Émettre une quittance coûte ${cout} FCFA.` 
      }, { status: 402 });
    }

    // Deduct from wallet
    await prisma.userWalletConfig.update({
      where: { userId: user.id },
      data: {
        walletBalance: { decrement: cout }
      }
    });

    const sha256_hash = crypto.createHash('sha256').update(`${unitId}-${Date.now()}`).digest('hex');
    const ref = `Q-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    return NextResponse.json({ 
        success: true, 
        message: `Quittance certifiée générée avec succès (${cout}F débités). L'empreinte SHA-256 est ${sha256_hash.substring(0,8)}...`,
        reference: ref,
        hash: sha256_hash,
        cout
    });

  } catch (error: any) {
    console.error('[API QUITTANCES] Generate Error:', error);
    return NextResponse.json({ error: 'Erreur technique lors de la génération de la quittance.' }, { status: 500 });
  }
}
