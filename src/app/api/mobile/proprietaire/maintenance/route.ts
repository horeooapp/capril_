import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';

/**
 * GET /api/mobile/proprietaire/maintenance
 * Liste les tickets de maintenance pour les biens du propriétaire
 *
 * Query: status?, propertyId?, page?, limit?
 *
 * PATCH /api/mobile/proprietaire/maintenance/[id]  — voir [id]/route.ts
 *
 * POST /api/mobile/proprietaire/maintenance
 * Créer un ticket (signalement propriétaire, ex: travaux planifiés)
 */
export async function GET(request: Request) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status     = searchParams.get('status') ?? undefined;
        const propertyId = searchParams.get('propertyId') ?? undefined;
        const page       = Math.max(1, parseInt(searchParams.get('page')  ?? '1'));
        const limit      = Math.min(50, parseInt(searchParams.get('limit') ?? '20'));
        const skip       = (page - 1) * limit;

        const where: any = {
            logement: {
                OR: [
                    { ownerUserId: user.userId },
                    { landlordId: user.userId },
                ],
            },
        };
        if (status)     where.statut     = status;
        if (propertyId) where.logementId = propertyId;

        const [tickets, total] = await Promise.all([
            prisma.ticketMaintenance.findMany({
                where,
                include: {
                    locataire:   { select: { firstName: true, lastName: true, phone: true } },
                    logement:    { select: { name: true, address: true, commune: true } },
                    prestataire: { select: { firstName: true, lastName: true, phone: true } },
                },
                orderBy: { dateSignalement: 'desc' },
                skip,
                take: limit,
            }),
            prisma.ticketMaintenance.count({ where }),
        ]);

        const formatted = tickets.map(t => ({
            id:            t.id,
            ticketRef:     t.ticketRef,
            statut:        t.statut,
            urgence:       t.urgence,
            categorie:     t.categorie,
            description:   t.description,
            dateSignalement: t.dateSignalement?.toISOString() ?? null,
            datePriseEnCharge: t.datePriseEnCharge?.toISOString() ?? null,
            dateResolution: (t as any).dateResolution?.toISOString() ?? null,
            bien:          t.logement ? `${t.logement.name ?? t.logement.address} — ${t.logement.commune}` : 'Bien',
            locataire:     t.locataire
                             ? `${t.locataire.firstName ?? ''} ${t.locataire.lastName ?? ''}`.trim()
                             : 'Locataire',
            prestataire:   t.prestataire
                             ? `${t.prestataire.firstName ?? ''} ${t.prestataire.lastName ?? ''}`.trim()
                             : null,
        }));

        return NextResponse.json({
            tickets: formatted,
            pagination: { total, page, limit, pages: Math.ceil(total / limit) },
            summary: {
                enAttente:     formatted.filter(t => t.statut === 'EN_ATTENTE').length,
                enCours:       formatted.filter(t => t.statut === 'PRIS_EN_CHARGE').length,
                resolus:       formatted.filter(t => t.statut === 'RÉSOLU').length,
            },
        });
    } catch (error: any) {
        console.error('[MOBILE] proprietaire/maintenance GET error:', error);
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
        const { logementId, description, categorie, urgence } = body;

        if (!logementId || !description) {
            return NextResponse.json(
                { error: 'logementId et description sont requis.' },
                { status: 400 }
            );
        }

        // Vérifier propriété du bien
        const property = await prisma.property.findFirst({
            where: {
                id: logementId,
                OR: [{ ownerUserId: user.userId }, { landlordId: user.userId }],
            },
        });
        if (!property) {
            return NextResponse.json({ error: 'Bien introuvable ou accès refusé.' }, { status: 404 });
        }

        const seq   = await prisma.ticketMaintenance.count();
        const ticket = await prisma.ticketMaintenance.create({
            data: {
                ticketRef:       `TKT-${String(seq + 1).padStart(6, '0')}`,
                logementId,
                locataireId:     user.userId,
                categorie:       categorie ?? 'MAI_AU',
                urgence:         urgence ?? 'NORMAL',
                description,
                statut:          'EN_ATTENTE',
                dateSignalement: new Date(),
            },
        });

        return NextResponse.json({
            success:   true,
            ticketId:  ticket.id,
            ticketRef: ticket.ticketRef,
            message:   'Ticket de maintenance créé avec succès.',
        }, { status: 201 });
    } catch (error: any) {
        console.error('[MOBILE] proprietaire/maintenance POST error:', error);
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
    }
}
