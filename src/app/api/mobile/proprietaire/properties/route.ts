import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';

export async function GET(request: Request) {
    try {
        const user = await authenticateMobileRequest(request);
        
        if (!user) {
            return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
        }

        const properties = await prisma.property.findMany({
            where: { landlordId: user.userId },
            include: {
                leases: {
                    where: { status: 'ACTIVE' }
                }
            }
        });

        // Transformer pour l'application mobile
        const formattedProperties = properties.map(prop => {
            const isActive = prop.leases && prop.leases.length > 0;
            return {
                id: prop.id,
                name: prop.name || 'Bien sans nom',
                address: prop.address || 'Adresse non renseignée',
                status: isActive ? 'Occupé' : 'Vacant',
                rent: isActive ? prop.leases[0].rentAmount : 0
            };
        });

        return NextResponse.json({
            properties: formattedProperties,
            currency: 'FCFA'
        });

    } catch (error: any) {
        console.error("[MOBILE API] proprietaire/properties error:", error);
        return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
    }
}
