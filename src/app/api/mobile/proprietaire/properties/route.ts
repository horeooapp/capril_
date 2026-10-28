import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';

/**
 * GET  /api/mobile/proprietaire/properties
 * Liste les propriétés du propriétaire (déjà existant — enrichi avec POST)
 *
 * POST /api/mobile/proprietaire/properties
 * Créer une nouvelle propriété
 * Body: { name, address, commune, propertyType, leaseType, declaredRentFcfa?, superficieM2?, typeStructure? }
 */
export async function GET(request: Request) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') ?? undefined;

        const where: any = {
            OR: [{ ownerUserId: user.userId }, { landlordId: user.userId }],
            ...(status ? { status } : {}),
        };

        const properties = await prisma.property.findMany({
            where,
            include: {
                images: { where: { isMain: true }, take: 1 },
                leases: {
                    where: { status: { in: ['ACTIVE', 'LOYER_IMPAYE', 'ACTIVE_DECLARATIF'] } },
                    include: { tenant: { select: { firstName: true, lastName: true } } },
                    take: 1,
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        const formatted = properties.map(p => {
            const activeLease = p.leases[0] ?? null;
            return {
                id:               p.id,
                propertyCode:     p.propertyCode,
                name:             p.name ?? 'Bien sans nom',
                address:          p.address ?? '',
                commune:          p.commune ?? '',
                propertyType:     p.propertyType,
                typeStructure:    p.typeStructure,
                leaseType:        p.leaseType,
                status:           p.status,
                declaredRentFcfa: Number(p.declaredRentFcfa ?? 0),
                superficieM2:     p.superficieM2 ? Number(p.superficieM2) : null,
                imageUrl:         p.images[0]?.s3Key ?? null,
                occupancyStatus:  activeLease ? 'Occupé' : 'Vacant',
                tenantName:       activeLease?.tenant
                                    ? `${activeLease.tenant.firstName ?? ''} ${activeLease.tenant.lastName ?? ''}`.trim()
                                    : null,
                currentRent:      activeLease ? Number(activeLease.rentAmount ?? 0) : 0,
            };
        });

        return NextResponse.json({ properties: formatted, currency: 'XOF' });
    } catch (error: any) {
        console.error('[MOBILE] proprietaire/properties GET error:', error);
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
        const { name, address, commune, propertyType, leaseType, declaredRentFcfa, superficieM2, typeStructure, parentPropertyId, unitLabel } = body;

        if (!address || !commune) {
            return NextResponse.json({ error: 'address et commune sont obligatoires.' }, { status: 400 });
        }

        // Génération du code propriété
        const count = await prisma.property.count({ where: { commune } });
        const communeCode = commune.substring(0, 3).toUpperCase();
        const typePrefix = leaseType === 'commercial' ? 'COM' : 'RES';
        const propertyCode = `${typePrefix}-${communeCode}-${String(count + 1).padStart(4, '0')}`;

        const property = await prisma.property.create({
            data: {
                propertyCode:     parentPropertyId && unitLabel ? `${propertyCode}-${unitLabel.replace(/\s/g, '').toUpperCase()}` : propertyCode,
                ownerUserId:      user.userId,
                name:             name ?? address,
                address,
                commune,
                city:             commune,
                propertyType:     propertyType ?? 'APARTMENT',
                typeStructure:    typeStructure ?? 'INDEPENDANT',
                leaseType:        leaseType ?? 'residential',
                declaredRentFcfa: declaredRentFcfa ? Number(declaredRentFcfa) : 0,
                superficieM2:     superficieM2 ? Number(superficieM2) : undefined,
                parentPropertyId: parentPropertyId ?? null,
                unitLabel:        unitLabel ?? null,
                status:           'active',
            },
        });

        return NextResponse.json({
            success:      true,
            message:      'Bien créé avec succès.',
            propertyId:   property.id,
            propertyCode: property.propertyCode,
        }, { status: 201 });
    } catch (error: any) {
        console.error('[MOBILE] proprietaire/properties POST error:', error);
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
    }
}
