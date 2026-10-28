import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';

/**
 * GET /api/mobile/proprietaire/properties/[id]
 * Détail d'une propriété avec son bail actif et ses images
 *
 * PATCH /api/mobile/proprietaire/properties/[id]
 * Mise à jour d'une propriété
 * Body: { name?, address?, commune?, declaredRentFcfa?, status? }
 *
 * DELETE /api/mobile/proprietaire/properties/[id]
 * Archivage (soft delete) de la propriété
 */

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
        }

        const { id } = await params;

        const property = await prisma.property.findFirst({
            where: {
                id,
                OR: [
                    { ownerUserId: user.userId },
                    { landlordId: user.userId },
                ],
            },
            include: {
                images: true,
                leases: {
                    where: { status: { in: ['ACTIVE', 'LOYER_IMPAYE', 'ACTIVE_DECLARATIF'] } },
                    include: {
                        tenant: { select: { id: true, firstName: true, lastName: true, phone: true } },
                        receipts: { orderBy: { periodMonth: 'desc' }, take: 3 },
                    },
                    take: 1,
                },
                units: {
                    select: {
                        id: true, name: true, unitLabel: true, status: true,
                        leases: { where: { status: 'ACTIVE' }, take: 1, select: { rentAmount: true } },
                    },
                },
                annonces: {
                    where: { status: 'ACTIVE' },
                    select: { id: true, title: true, price: true, status: true },
                    take: 1,
                },
            },
        });

        if (!property) {
            return NextResponse.json({ error: 'Propriété introuvable ou accès refusé.' }, { status: 404 });
        }

        const activeLease = property.leases[0] ?? null;

        return NextResponse.json({
            id:               property.id,
            propertyCode:     property.propertyCode,
            name:             property.name ?? 'Bien sans nom',
            address:          property.address ?? '',
            commune:          property.commune ?? '',
            city:             property.city ?? '',
            propertyType:     property.propertyType,
            typeStructure:    property.typeStructure,
            leaseType:        property.leaseType,
            status:           property.status,
            declaredRentFcfa: Number(property.declaredRentFcfa ?? 0),
            superficieM2:     property.superficieM2 ? Number(property.superficieM2) : null,
            verifiedAt:       property.verifiedAt?.toISOString() ?? null,
            images: property.images.map(img => ({
                id:     img.id,
                url:    img.s3Key,
                isMain: img.isMain,
            })),
            activeLease: activeLease ? {
                id:             activeLease.id,
                leaseReference: activeLease.leaseReference,
                status:         activeLease.status,
                rentAmount:     Number(activeLease.rentAmount),
                startDate:      activeLease.startDate?.toISOString() ?? null,
                tenant: activeLease.tenant ? {
                    id:        activeLease.tenant.id,
                    firstName: activeLease.tenant.firstName,
                    lastName:  activeLease.tenant.lastName,
                    phone:     activeLease.tenant.phone,
                } : null,
            } : null,
            units: property.units.map(u => ({
                id:         u.id,
                name:       u.name,
                unitLabel:  u.unitLabel,
                status:     u.status,
                rentAmount: u.leases[0] ? Number(u.leases[0].rentAmount) : 0,
            })),
            activeAnnonce: property.annonces[0] ?? null,
            currency: 'XOF',
        });
    } catch (error: any) {
        console.error('[MOBILE] proprietaire/properties/[id] GET error:', error);
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
        }

        const { id } = await params;

        const property = await prisma.property.findFirst({
            where: { id, OR: [{ ownerUserId: user.userId }, { landlordId: user.userId }] },
        });
        if (!property) {
            return NextResponse.json({ error: 'Propriété introuvable ou accès refusé.' }, { status: 404 });
        }

        const body = await request.json();
        const allowed = ['name', 'address', 'commune', 'city', 'declaredRentFcfa', 'superficieM2'];
        const updateData: any = {};
        for (const key of allowed) {
            if (body[key] !== undefined) {
                updateData[key] = ['declaredRentFcfa', 'superficieM2'].includes(key) ? Number(body[key]) : body[key];
            }
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: 'Aucun champ modifiable fourni.' }, { status: 400 });
        }

        const updated = await prisma.property.update({ where: { id }, data: updateData });

        return NextResponse.json({ success: true, propertyId: updated.id });
    } catch (error: any) {
        console.error('[MOBILE] proprietaire/properties/[id] PATCH error:', error);
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
        }

        const { id } = await params;

        const property = await prisma.property.findFirst({
            where: { id, OR: [{ ownerUserId: user.userId }, { landlordId: user.userId }] },
            include: { leases: { where: { status: 'ACTIVE' }, take: 1 } },
        });
        if (!property) {
            return NextResponse.json({ error: 'Propriété introuvable ou accès refusé.' }, { status: 404 });
        }

        if (property.leases.length > 0) {
            return NextResponse.json(
                { error: 'Impossible d\'archiver un bien avec un bail actif. Résilier le bail d\'abord.' },
                { status: 409 }
            );
        }

        await prisma.property.update({ where: { id }, data: { status: 'archived' } });

        return NextResponse.json({ success: true, message: 'Bien archivé avec succès.' });
    } catch (error: any) {
        console.error('[MOBILE] proprietaire/properties/[id] DELETE error:', error);
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
    }
}
