import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';

/**
 * GET /api/mobile/proprietaire/edl
 * États des lieux (EDL) pour les biens du propriétaire
 *
 * Query: leaseId?, type? (ENTREE|SORTIE), status?, page?, limit?
 *
 * POST /api/mobile/proprietaire/edl
 * Initier un état des lieux
 * Body: { leaseId, type, scheduledDate?, notes? }
 */
export async function GET(request: Request) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const leaseId = searchParams.get('leaseId') ?? undefined;
        const type    = searchParams.get('type')    ?? undefined;
        const status  = searchParams.get('status')  ?? undefined;
        const page    = Math.max(1, parseInt(searchParams.get('page')  ?? '1'));
        const limit   = Math.min(50, parseInt(searchParams.get('limit') ?? '20'));
        const skip    = (page - 1) * limit;

        const landlordWhere: any = {
            OR: [
                { landlordId: user.userId },
                { property: { ownerUserId: user.userId } },
            ],
        };
        if (leaseId) landlordWhere.id = leaseId;

        const where: any = { lease: landlordWhere };
        if (type)   where.type   = type;
        if (status) where.statut = status;

        const [edls, total] = await Promise.all([
            prisma.edl.findMany({
                where,
                include: {
                    lease: {
                        select: {
                            leaseReference: true,
                            property: { select: { name: true, address: true, commune: true } },
                            tenant:   { select: { firstName: true, lastName: true, phone: true } },
                        },
                    },
                    inspecteur: {
                        select: { firstName: true, lastName: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.edl.count({ where }),
        ]);

        const formatted = edls.map(e => ({
            id:           e.id,
            type:         e.type,
            statut:       e.statut,
            createdAt:    e.createdAt?.toISOString() ?? null,
            signedAt:     (e as any).signedAt?.toISOString() ?? null,
            pdfUrl:       e.pdfUrl ?? null,
            property:     e.lease?.property?.name ?? e.lease?.property?.address ?? 'Bien',
            commune:      e.lease?.property?.commune ?? '',
            tenant:       e.lease?.tenant
                            ? `${e.lease.tenant.firstName ?? ''} ${e.lease.tenant.lastName ?? ''}`.trim()
                            : 'Locataire',
            tenantPhone:  e.lease?.tenant?.phone ?? null,
            leaseRef:     e.lease?.leaseReference ?? '',
            inspecteur:   e.inspecteur
                            ? `${e.inspecteur.firstName ?? ''} ${e.inspecteur.lastName ?? ''}`.trim()
                            : null,
            notes:        (e as any).notes ?? null,
        }));

        return NextResponse.json({
            edls: formatted,
            pagination: { total, page, limit, pages: Math.ceil(total / limit) },
            summary: {
                entrees: formatted.filter(e => e.type === 'ENTREE').length,
                sorties: formatted.filter(e => e.type === 'SORTIE').length,
                signes:  formatted.filter(e => e.statut === 'SIGNE').length,
                pending: formatted.filter(e => e.statut === 'INITIE').length,
            },
        });
    } catch (error: any) {
        console.error('[MOBILE] proprietaire/edl GET error:', error);
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
        const { leaseId, type, scheduledDate, notes } = body;

        if (!leaseId || !type || !['ENTREE', 'SORTIE'].includes(type)) {
            return NextResponse.json(
                { error: 'leaseId et type (ENTREE|SORTIE) sont requis.' },
                { status: 400 }
            );
        }

        const lease = await prisma.lease.findFirst({
            where: {
                id: leaseId,
                OR: [
                    { landlordId: user.userId },
                    { property: { ownerUserId: user.userId } },
                ],
            },
        });
        if (!lease) {
            return NextResponse.json({ error: 'Bail introuvable ou accès refusé.' }, { status: 404 });
        }

        const edl = await prisma.edl.create({
            data: {
                leaseId,
                type:   type as any,
                statut: 'INITIE',
                notes:  notes ?? null,
            } as any,
        });

        return NextResponse.json({
            success:  true,
            edlId:    edl.id,
            message:  `État des lieux ${type === 'ENTREE' ? "d'entrée" : 'de sortie'} initié.`,
        }, { status: 201 });
    } catch (error: any) {
        console.error('[MOBILE] proprietaire/edl POST error:', error);
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
    }
}
