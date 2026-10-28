import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { WalletService } from '@/lib/wallet/transactions';

/**
 * GET /api/v1/wallet/stats
 * Returns wallet balance, history, and usage projections.
 */
export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { 
        walletConfig: { select: { walletBalance: true, walletSeuilAlerte: true } },
        activePlanTier: true,
        role: true,
        _count: {
           select: { leasesAsLandlord: { where: { status: 'ACTIVE' } } }
        }
      }
    });

    if (!fullUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const history = await WalletService.getHistory(user.id, 10);
    
    // Projections QAPRIL (Standard 75 XOF/quittance pour particuliers, 10% estimation pour pros)
    const nbBails = fullUser._count.leasesAsLandlord;
    const isPro = fullUser.role === 'LANDLORD_PRO' || fullUser.role === 'AGENCY';
    
    // Estimation conso mensuelle : 
    // Pour les particuliers : nb bails * 75 XOF
    // Pour les pros : nb bails * (Loyer Moyen estimé à 150k * 10%)
    const consoMensuelle = isPro ? (nbBails * 15000) : (nbBails * 75);
    const decouvertMax = isPro ? -5000 : -1500;

    return NextResponse.json({
      solde: ((fullUser?.walletConfig?.walletBalance || 0) || 0) || 0,
      devise: 'XOF',
      role: fullUser.role,
      seuilAlerte: fullUser?.walletConfig?.walletSeuilAlerte || 500,
      decouvertMax,
      historique: history,
      stats: {
         nbBails,
         consoMensuelle,
         autonomieMois: (((fullUser?.walletConfig?.walletBalance || 0) || 0) || 0) > 0 ? Math.floor((((fullUser?.walletConfig?.walletBalance || 0) || 0) || 0) / (consoMensuelle || 1)) : (isPro ? 0 : 12)
      }
    });

  } catch (error: any) {
    console.error('[WALLET_STATS] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
