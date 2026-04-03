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
        _count: {
           select: { leasesAsLandlord: { where: { status: 'ACTIVE' } } }
        }
      }
    });

    if (!fullUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const history = await WalletService.getHistory(user.id, 10);
    
    // Projections QAPRIL (Standard 75 FCFA/quittance)
    const nbBails = fullUser._count.leasesAsLandlord;
    const consoMensuelle = nbBails * 75;

    return NextResponse.json({
      solde: ((fullUser?.walletConfig?.walletBalance || 0) || 0) || 0,
      devise: 'FCFA',
      seuilAlerte: fullUser?.walletConfig?.walletSeuilAlerte || 500,
      decouvertMax: -1500,
      historique: history,
      stats: {
         nbBails,
         consoMensuelle,
         autonomieMois: (((fullUser?.walletConfig?.walletBalance || 0) || 0) || 0) > 0 ? Math.floor((((fullUser?.walletConfig?.walletBalance || 0) || 0) || 0) / (consoMensuelle || 1)) : 0
      }
    });

  } catch (error: any) {
    console.error('[WALLET_STATS] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
