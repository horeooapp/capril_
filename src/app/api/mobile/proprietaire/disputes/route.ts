import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';

/**
 * GET /api/mobile/proprietaire/disputes
 * Liste les litiges ouverts pour les biens du propriétaire
 *
 * POST /api/mobile/proprietaire/disputes
 * Ouvrir un nouveau litige
 * Body: { leaseId, subject, description, type? }
 */
export async function GET(request: Request) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status  = searchParams.get('status') ?? undefined;
        const leaseId = searchParams.get('leaseId') ?? undefined;

        const landlordWhere: any = {
            OR: [
                { landlordId: user.userId },
                { property: { ownerUserId: user.userId } },
            ],
        };
        if (leaseId) landlordWhere.id = leaseId;

        // Litiges (DossierLitige)
        const litiges = await (prisma as any).dossierLitige.findMany({
            where: {
                lease: landlordWhere,
                ...(status ? { statut: status } : {}),
            },
            include: {
                lease: {
                    select: {
                        leaseReference: true,
                        property: { select: { name: true, address: true } },
                        tenant:   { select: { firstName: true, lastName: true, phone: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        }).catch(() => []);

        // Réclamations locataires
        const reclamations = await prisma.reclamationLocataire.findMany({
            where: {
                lease: landlordWhere,
                ...(status ? { statut: status } : {}),
            },
            include: {
                lease: {
                    select: {
                        leaseReference: true,
                        property: { select: { name: true, address: true } },
                    },
                },
                tenant: { select: { firstName: true, lastName: true, phone: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        const disputes = [
            ...litiges.map((l: any) => ({
                id:        l.id,
                source:    'LITIGE',
                statut:    l.statut,
                subject:   l.motif ?? l.subject ?? 'Litige',
                createdAt: l.createdAt?.toISOString() ?? null,
                property:  l.lease?.property?.name ?? l.lease?.property?.address ?? 'Bien',
                tenant:    l.lease?.tenant
                             ? `${l.lease.tenant.firstName ?? ''} ${l.lease.tenant.lastName ?? ''}`.trim()
                             : 'Locataire',
                leaseRef:  l.lease?.leaseReference,
            })),
            ...reclamations.map(r => ({
                id:        r.id,
                source:    'RECLAMATION',
                statut:    r.statut,
                subject:   r.objet ?? 'Réclamation',
                description: r.description,
                createdAt: r.createdAt?.toISOString() ?? null,
                property:  r.lease?.property?.name ?? r.lease?.property?.address ?? 'Bien',
                tenant:    r.tenant
                             ? `${r.tenant.firstName ?? ''} ${r.tenant.lastName ?? ''}`.trim()
                             : 'Locataire',
                leaseRef:  r.lease?.leaseReference,
            })),
        ].sort((a, b) => {
            const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return db - da;
        });

        return NextResponse.json({
            disputes,
            summary: {
                total:    disputes.length,
                ouverts:  disputes.filter(d => ['OUVERT', 'GENERE', 'EN_COURS', 'MEDIATION_EN_COURS'].includes(d.statut)).length,
                resolus:  disputes.filter(d => ['RESOLU', 'CLOS', 'CLASSE'].includes(d.statut)).length,
            },
        });
    } catch (error: any) {
        console.error('[MOBILE] proprietaire/disputes GET error:', error);
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
        const { leaseId, subject, description } = body;

        if (!leaseId || !subject) {
            return NextResponse.json({ error: 'leaseId et subject sont requis.' }, { status: 400 });
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

        // Création d'une réclamation propriétaire
        const reclamation = await prisma.reclamationLocataire.create({
            data: {
                leaseId,
                tenantId: lease.tenantId ?? user.userId,
                objet:    subject,
                description: description ?? subject,
                statut:   'OUVERT',
            },
        });

        return NextResponse.json({
            success:     true,
            message:     'Litige ouvert avec succès.',
            disputeId:   reclamation.id,
        }, { status: 201 });
    } catch (error: any) {
        console.error('[MOBILE] proprietaire/disputes POST error:', error);
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
    }
}
