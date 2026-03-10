import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { generatePropertyCode } from '@/lib/property';

/**
 * Handle BigInt serialization
 */
const serializeProperty = (p: any) => ({
    ...p,
    declaredRentFcfa: p.declaredRentFcfa.toString()
});

/**
 * Part 5: Property Registry API
 * GET /api/v1/properties - List owner properties
 * POST /api/v1/properties - Register new property
 */
export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const properties = await prisma.property.findMany({
            where: { ownerUserId: session.user.id },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(properties.map(serializeProperty));
    } catch (error) {
        console.error('[PROPERTIES GET ERROR]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const data = await req.json();
        const { category, addressLine1, commune, declaredRentFcfa } = data;

        if (!category || !addressLine1 || !commune || !declaredRentFcfa) {
            return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 });
        }

        const propertyCode = await generatePropertyCode(category);

        const property = await prisma.property.create({
            data: {
                propertyCode,
                leaseType: category.toLowerCase() as any,
                ownerUserId: session.user.id,
                address: addressLine1,
                commune,
                declaredRentFcfa: declaredRentFcfa,
                propertyType: data.propertyType,
                rooms: data.totalRooms ? parseInt(data.totalRooms) : null,
                areaSqm: data.usefulAreaSqm ? parseFloat(data.usefulAreaSqm) : null,
                status: 'active'
            }
        });

        return NextResponse.json(serializeProperty(property));
    } catch (error) {
        console.error('[PROPERTIES POST ERROR]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
