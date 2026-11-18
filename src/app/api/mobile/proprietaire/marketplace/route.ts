import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';

/**
 * GET /api/mobile/proprietaire/marketplace
 * Liste les annonces actives du propriétaire
 *
 * POST /api/mobile/proprietaire/marketplace
 * Créer une nouvelle annonce de mise en location
 * Body: { propertyId, title, description, price, contactPhone?, availableFrom?, photos? }
 */
export async function GET(request: Request) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') ?? undefined;
        const page   = Math.max(1, parseInt(searchParams.get('page')  ?? '1'));
        const limit  = Math.min(30, parseInt(searchParams.get('limit') ?? '10'));
        const skip   = (page - 1) * limit;

        const where: any = {
            logement: {
                OR: [
                    { ownerUserId: user.userId },
                    { landlordId: user.userId },
                ],
            },
        };
        if (status) {
            const mappedStatut = status === 'ACTIVE' ? 'PUBLIEE' : status === 'CLOSED' ? 'RETIREE' : status === 'SUSPENDED' ? 'SUSPENDUE' : status;
            where.statut = mappedStatut;
        }

        const [annonces, total] = await Promise.all([
            prisma.annonce.findMany({
                where,
                include: {
                    logement: {
                        select: {
                            id:           true,
                            name:         true,
                            address:      true,
                            commune:      true,
                            propertyCode: true,
                            propertyType: true,
                            superficieM2: true,
                            images:       { where: { isMain: true }, take: 1, select: { s3Key: true } },
                        },
                    },
                },
                orderBy: { publieeAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.annonce.count({ where }),
        ]);

        const formatted = annonces.map(a => ({
            id:            a.id,
            title:         a.titre,
            description:   a.description ?? null,
            price:         Number(a.loyerDemande ?? 0),
            status:        a.statut === 'PUBLIEE' ? 'ACTIVE' : a.statut === 'LOUEE' ? 'CLOSED' : a.statut,
            createdAt:     a.publieeAt?.toISOString() ?? null,
            contactPhone:  null,
            availableFrom: a.disponibleLe?.toISOString() ?? null,
            viewCount:     a.nbVisites ?? 0,
            property: {
                id:           a.logement?.id,
                name:         a.logement?.name,
                address:      a.logement?.address,
                commune:      a.logement?.commune,
                propertyCode: a.logement?.propertyCode,
                propertyType: a.logement?.propertyType,
                superficieM2: a.logement?.superficieM2 ? Number(a.logement.superficieM2) : null,
                imageUrl:     a.logement?.images?.[0]?.s3Key ?? null,
            },
            currency: 'XOF',
        }));

        return NextResponse.json({
            annonces: formatted,
            pagination: { total, page, limit, pages: Math.ceil(total / limit) },
            summary: {
                actives:   formatted.filter(a => a.status === 'ACTIVE').length,
                suspendues: formatted.filter(a => a.status === 'SUSPENDED').length,
                closes:    formatted.filter(a => a.status === 'CLOSED').length,
            },
        });
    } catch (error: any) {
        console.error('[MOBILE] proprietaire/marketplace GET error:', error);
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
        const { propertyId, title, description, price, contactPhone, availableFrom } = body;

        if (!propertyId || !title || !price) {
            return NextResponse.json(
                { error: 'propertyId, title et price sont requis.' },
                { status: 400 }
            );
        }

        // Vérifier propriété du bien
        const property = await prisma.property.findFirst({
            where: {
                id: propertyId,
                OR: [
                    { ownerUserId: user.userId },
                    { landlordId: user.userId },
                ],
            },
        });
        if (!property) {
            return NextResponse.json({ error: 'Bien introuvable ou accès refusé.' }, { status: 404 });
        }

        // Désactiver les annonces précédentes du même bien
        await prisma.annonce.updateMany({
            where: { logementId: propertyId, statut: 'PUBLIEE' },
            data:  { statut: 'RETIREE', archiveeAt: new Date() },
        });

        const annonce = await prisma.annonce.create({
            data: {
                logementId:   propertyId,
                publieParId:  user.userId,
                publieParRole: 'BAILLEUR',
                titre:        title,
                loyerDemande: Number(price),
                statut:       'PUBLIEE',
                publieeAt:    new Date(),
                description:  description ?? '',
                disponibleLe: availableFrom ? new Date(availableFrom) : null,
            },
        });

        return NextResponse.json({
            success:   true,
            annonceId: annonce.id,
            message:   'Annonce publiée avec succès.',
        }, { status: 201 });
    } catch (error: any) {
        console.error('[MOBILE] proprietaire/marketplace POST error:', error);
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
    }
}
