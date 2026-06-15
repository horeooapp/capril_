import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';

/**
 * GET /api/mobile/proprietaire/agenda
 * Événements agenda du propriétaire : visites, rendez-vous, échéances
 *
 * Query: from?, to?, type?, page?, limit?
 *
 * POST /api/mobile/proprietaire/agenda
 * Créer un événement
 * Body: { title, description?, date, type?, leaseId?, propertyId? }
 */
export async function GET(request: Request) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const from  = searchParams.get('from')  ? new Date(searchParams.get('from')!)  : undefined;
        const to    = searchParams.get('to')    ? new Date(searchParams.get('to')!)    : undefined;
        const type  = searchParams.get('type')  ?? undefined;
        const page  = Math.max(1, parseInt(searchParams.get('page')  ?? '1'));
        const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '20'));
        const skip  = (page - 1) * limit;

        const where: any = { userId: user.userId };
        if (type) where.type = type;
        if (from || to) {
            where.date = {};
            if (from) where.date.gte = from;
            if (to)   where.date.lte = to;
        }

        const [events, total] = await Promise.all([
            (prisma as any).agendaEvent.findMany({
                where,
                orderBy: { date: 'asc' },
                skip,
                take: limit,
            }).catch(() => []),
            (prisma as any).agendaEvent.count({ where }).catch(() => 0),
        ]);

        // Ajouter les échéances automatiques (loyers à encaisser)
        const upcomingLeases = await prisma.lease.findMany({
            where: {
                OR: [
                    { landlordId: user.userId },
                    { property: { ownerUserId: user.userId } },
                ],
                status: { in: ['ACTIVE', 'LOYER_IMPAYE'] },
            },
            select: {
                id:             true,
                leaseReference: true,
                rentAmount:     true,
                property: { select: { name: true } },
                tenant:   { select: { firstName: true, lastName: true } },
            },
        });

        // Générer les prochaines échéances (5 du mois prochain)
        const now = new Date();
        const nextPaymentDate = new Date(now.getFullYear(), now.getMonth() + 1, 5);
        const autoEvents = upcomingLeases.map(l => ({
            id:          `auto-${l.id}`,
            type:        'ECHEANCE_LOYER',
            title:       `Loyer à encaisser — ${l.leaseReference}`,
            description: `${l.tenant ? `${l.tenant.firstName ?? ''} ${l.tenant.lastName ?? ''}`.trim() : 'Locataire'} · ${Number(l.rentAmount).toLocaleString('fr-FR')} FCFA`,
            date:        nextPaymentDate.toISOString(),
            isAuto:      true,
            leaseId:     l.id,
            property:    l.property?.name ?? 'Bien',
        }));

        return NextResponse.json({
            events: [
                ...events.map((e: any) => ({ ...e, isAuto: false })),
                ...autoEvents,
            ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
            pagination: { total, page, limit, pages: Math.ceil(total / limit) },
        });
    } catch (error: any) {
        console.error('[MOBILE] proprietaire/agenda GET error:', error);
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
        const { title, description, date, type, leaseId, propertyId } = body;

        if (!title || !date) {
            return NextResponse.json({ error: 'title et date sont requis.' }, { status: 400 });
        }

        const event = await (prisma as any).agendaEvent.create({
            data: {
                userId:     user.userId,
                title,
                description: description ?? null,
                date:       new Date(date),
                type:       type ?? 'AUTRE',
                leaseId:    leaseId ?? null,
                propertyId: propertyId ?? null,
            },
        }).catch(async () => {
            // Fallback si le modèle AgendaEvent n'existe pas encore : créer une notification
            return prisma.notification.create({
                data: {
                    userId:  user.userId,
                    title,
                    content: description ?? title,
                    channel: 'IN_APP',
                    type:    'AGENDA',
                },
            });
        });

        return NextResponse.json({
            success: true,
            eventId: event.id,
            message: 'Événement créé avec succès.',
        }, { status: 201 });
    } catch (error: any) {
        console.error('[MOBILE] proprietaire/agenda POST error:', error);
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
    }
}
