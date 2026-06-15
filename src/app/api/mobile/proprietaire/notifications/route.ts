import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';

/**
 * GET /api/mobile/proprietaire/notifications
 * Liste les notifications du propriétaire
 *
 * Query: unreadOnly?, page?, limit?
 *
 * PATCH /api/mobile/proprietaire/notifications/[id]/read — marquer comme lu
 *       → implémenté directement via POST body { markAllRead: true }
 *
 * POST /api/mobile/proprietaire/notifications
 * Body: { markAllRead: true } → marque toutes les notifs comme lues
 */
export async function GET(request: Request) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const unreadOnly = searchParams.get('unreadOnly') === 'true';
        const page       = Math.max(1, parseInt(searchParams.get('page')  ?? '1'));
        const limit      = Math.min(50, parseInt(searchParams.get('limit') ?? '20'));
        const skip       = (page - 1) * limit;

        const where: any = { userId: user.userId };
        if (unreadOnly) where.readAt = null;

        const [notifications, total, unreadCount] = await Promise.all([
            prisma.notification.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                select: {
                    id:        true,
                    title:     true,
                    content:   true,
                    channel:   true,
                    readAt:    true,
                    createdAt: true,
                    type:      true,
                    payload:   true,
                },
            }),
            prisma.notification.count({ where }),
            prisma.notification.count({ where: { userId: user.userId, readAt: null } }),
        ]);

        return NextResponse.json({
            notifications: notifications.map(n => ({
                id:        n.id,
                title:     n.title,
                content:   n.content,
                channel:   n.channel,
                type:      n.type,
                isRead:    !!n.readAt,
                readAt:    n.readAt?.toISOString() ?? null,
                createdAt: n.createdAt?.toISOString() ?? null,
                payload:   n.payload,
            })),
            unreadCount,
            pagination: { total, page, limit, pages: Math.ceil(total / limit) },
        });
    } catch (error: any) {
        console.error('[MOBILE] proprietaire/notifications GET error:', error);
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
        }

        const body = await request.json();

        if (body.markAllRead) {
            await prisma.notification.updateMany({
                where: { userId: user.userId, readAt: null },
                data:  { readAt: new Date() },
            });
            return NextResponse.json({ success: true, message: 'Toutes les notifications marquées comme lues.' });
        }

        if (body.notificationId) {
            await prisma.notification.update({
                where: { id: body.notificationId },
                data:  { readAt: new Date() },
            });
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Action non reconnue.' }, { status: 400 });
    } catch (error: any) {
        console.error('[MOBILE] proprietaire/notifications POST error:', error);
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
    }
}
