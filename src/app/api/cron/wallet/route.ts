import { NextResponse } from 'next/server';
import { processWalletTriggers } from '@/lib/wallet/triggers';

/**
 * Route exécutée par un Cron (ex: Vercel Cron) tous les jours.
 * Déclenche les rappels de rechargement wallet contextuels.
 */
export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    const vercelCron = request.headers.get('x-vercel-cron');

    // Sécurisation
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && !vercelCron) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        await processWalletTriggers();
        return NextResponse.json({ 
            success: true, 
            message: 'Wallet triggers processed successfully' 
        });
    } catch (error: any) {
        console.error("[Cron Wallet] Error:", error);
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
}
