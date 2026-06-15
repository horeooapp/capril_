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
            property: {
                OR: [
                    { ownerUserId: user.userId },
                    { landlordId: user.userId },
                ],
            },
        };
        if (status) where.status = status;

        const [annonces, total] = await Promise.all([
            prisma.annonce.findMany({
                where,
                include: {
                    property: {
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
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.annonce.count({ where }),
        ]);

        const formatted = annonces.map(a => ({
            id:            a.id,
            title:         a.title,
            description:   (a as any).description ?? null,
            price:         Number(a.price ?? 0),
            status:        a.status,
            createdAt:     (a as any).createdAt?.toISOString() ?? null,
            contactPhone:  (a as any).contactPhone ?? null,
            availableFrom: (a as any).availableFrom?.toISOString() ?? null,
            viewCount:     (a as any).viewCount ?? 0,
            property: {
                id:           a.property?.id,
                name:         a.property?.name,
                address:      a.property?.address,
                commune:      a.property?.commune,
                propertyCode: a.property?.propertyCode,
                propertyType: a.property?.propertyType,
                superficieM2: a.property?.superficieM2 ? Number(a.property.superficieM2) : null,
                imageUrl:     a.property?.images?.[0]?.s3Key ?? null,
            },
            currency: 'FCFA',
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
            where: { propertyId, status: 'ACTIVE' },
            data:  { status: 'CLOSED' },
        });

        const annonce = await prisma.annonce.create({
            data: {
                propertyId,
                title,
                price:        Number(price),
                status:       'ACTIVE',
                description:  description ?? null,
                contactPhone: contactPhone ?? null,
                availableFrom: availableFrom ? new Date(availableFrom) : null,
            } as any,
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
