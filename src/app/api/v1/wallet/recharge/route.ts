import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { generateDeepLink, Operator } from '@/lib/wallet/deeplinks';
import { cinetpay } from '@/lib/cinetpay';

/**
 * POST /api/v1/wallet/recharge
 * Initiates a wallet recharge.
 * Supports: 
 * - DEEP_LINK (Wave, Orange, MTN)
 * - CINETPAY (Card, MM, etc.)
 */
export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, operator, method } = await req.json();

    if (!amount || amount < 100) {
      return NextResponse.json({ error: 'Montant invalide (min 100 XOF)' }, { status: 400 });
    }

    const transactionId = `WAL-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

    // Mode Deep Link (Wave, Orange, etc.)
    if (method === 'DEEP_LINK' && operator) {
      const url = await generateDeepLink(operator as Operator, amount, transactionId);
      
      // Enregistrer l'intention dans WalletRechargeLink pour le tracking
      const link = await prisma.walletRechargeLink.create({
        data: {
          userId: user.id,
          declencheur: 'MANUEL',
          operateur: operator as any,
          montantSuggere: amount,
          soldeAuMoment: 0, // Will be updated in real usage or ignored
          nbBailsActifs: 0,
          urlGeneree: url,
          canalEnvoi: 'APP',
          expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
      });

      return NextResponse.json({ 
        success: true, 
        type: 'DEEP_LINK',
        url,
        linkId: link.id
      });
    }

    // Mode CinetPay (Par défaut pour Carte ou SI pas de deep link possible)
    const payment = await cinetpay.initializePayment({
      transaction_id: transactionId,
      amount,
      currency: "XOF",
      description: `Rechargement Wallet QAPRIL - ${user.email}`,
      customer_name: (user.firstName ? user.firstName + " " : "") + (user.lastName || "") || "Client",
      customer_surname: "QAPRIL",
      customer_email: user.email || "",
      customer_phone_number: (user as any).phone || "00000000",
      notify_url: `${process.env.NEXTAUTH_URL}/api/v1/wallet/callback`,
      return_url: `${process.env.NEXTAUTH_URL}/dashboard/owner?recharge=success`,
      channels: "ALL"
    });

    if (!payment.success) {
      return NextResponse.json({ error: payment.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      type: 'CINETPAY',
      url: payment.payment_url,
      transactionId
    });

  } catch (error: any) {
    console.error('[WALLET_RECHARGE] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
