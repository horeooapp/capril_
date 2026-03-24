import { NextResponse } from 'next/server';
import { ReminderService } from '@/lib/reminder-service';

/**
 * DAILY REMINDERS CRON - ADD-09 & DLP-001
 * Triggers automated rent reminders and overdue notices daily.
 */
export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    const vercelCron = request.headers.get('x-vercel-cron');

    // Security check (CRON_SECRET should be defined in .env)
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && !vercelCron) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        await ReminderService.processDailyReminders();
        
        return NextResponse.json({ 
            success: true, 
            message: 'Daily reminders processed successfully' 
        });
    } catch (error: any) {
        console.error("[Cron Reminders] Error:", error);
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
}
