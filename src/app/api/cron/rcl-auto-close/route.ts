import { NextResponse } from 'next/server';
import { RclService } from '@/lib/rcl-service';

/**
 * RCL AUTO-CLOSE CRON (REG-2026-001)
 * Triggers automated resolution of tenant reclamations over 144h old.
 */
export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    const vercelCron = request.headers.get('x-vercel-cron');

    // Security check (CRON_SECRET should be defined in .env)
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && !vercelCron) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const count = await RclService.processAutoClosures();
        
        return NextResponse.json({ 
            success: true, 
            message: `RCL auto-closure processed. ${count} tickets handled.` 
        });
    } catch (error: any) {
        console.error("[Cron RCL] Error:", error);
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
}
