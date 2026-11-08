import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) {
            return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
        }

        const { id: propertyId } = await params;

        const property = await prisma.property.findUnique({
            where: { id: propertyId },
            include: {
                capturesPosition: {
                    orderBy: { createdAt: 'desc' },
                    take: 5
                }
            }
        });

        if (!property) {
            return NextResponse.json({ error: "Bien introuvable." }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            position: {
                lat: property.gpsLatitude,
                lng: property.gpsLongitude,
                precisionM: property.precisionM,
                statut: property.statutPosition,
                w3w: property.w3w,
                codeLocalisation: property.codeLocalisation,
                positionGeleeAt: property.positionGeleeAt,
                isBienVerifie: property.isBienVerifie,
            },
            capturesRecentes: property.capturesPosition
        });
    } catch (error: any) {
        console.error("[GEO POSITION GET] Error:", error);
        return NextResponse.json({ error: "Erreur lors de la récupération de la position." }, { status: 500 });
    }
}

