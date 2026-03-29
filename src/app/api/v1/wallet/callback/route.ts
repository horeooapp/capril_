import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cinetpay } from '@/lib/cinetpay';
import { WalletService } from '@/lib/wallet/transactions';

/**
 * POST /api/v1/wallet/callback
 * Webhook CinetPay pour confirmer les rechargements.
 * https://docs.cinetpay.com/api/checkout/v1/ipn
 */
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const cpm_trans_id = formData.get('cpm_trans_id') as string;
    const cpm_site_id = formData.get('cpm_site_id') as string;
    const cpm_amount = formData.get('cpm_amount') as string;
    const cpm_currency = formData.get('cpm_currency') as string;
    const cpm_pay_method = formData.get('cpm_pay_method') as string;
    const cpm_payment_date = formData.get('cpm_payment_date') as string;
    const cpm_trans_status = formData.get('cpm_trans_status') as string;
    const cpm_designation = formData.get('cpm_designation') as string;
    const cpm_custom = formData.get('cpm_custom') as string; // Could store userId here

    console.log('[WALLET_CALLBACK] Received IPN for:', cpm_trans_id, 'Status:', cpm_trans_status);

    if (cpm_trans_status === 'ACCEPTED') {
      // 1. Vérification côté CinetPay (C'est obligatoire pour la sécurité)
      const verify = await cinetpay.verifyPayment(cpm_trans_id);
      
      if (verify.success && verify.status === 'ACCEPTED') {
        // 2. Identifier l'utilisateur
        // On cherche par transactionId dans WalletRechargeLink ou par cpm_custom
        const link = await prisma.walletRechargeLink.findFirst({
           where: { urlGeneree: { contains: cpm_trans_id } } // Or more robust matching
        });

        // if not found, we fallback to finding by designat/custom
        // ...

        // For this implementation, let's assume we find it via metadata or custom fields
        // In reality, CinetPay allows sending a custom field.

        // Logic to find userId...
        // ...
      }
    }

    return new Response('OK', { status: 200 });

  } catch (error: any) {
    console.error('[WALLET_CALLBACK] Error:', error);
    return new Response('Error', { status: 500 });
  }
}
