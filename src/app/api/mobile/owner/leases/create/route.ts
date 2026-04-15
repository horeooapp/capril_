import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { token, propertyId, tenantId, rentAmount, depositAmount, leaseType } = body;

        if (!token) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        // Vérification que le bien appartient au bailleur
        const property = await prisma.property.findUnique({ where: { id: propertyId } });
        if (!property || property.ownerUserId !== token) {
             return NextResponse.json({ error: "Propriété invalide ou non autorisée." }, { status: 403 });
        }

        const lease = await prisma.lease.create({
            data: {
                propertyId,
                tenantId,
                landlordId: token,
                leaseType: leaseType || 'RESIDENTIEL',
                startDate: new Date(),
                rentAmount: parseFloat(rentAmount),
                depositAmount: parseFloat(depositAmount),
                status: 'ACTIVE',
            }
        });

        // Génération automatique d'un premier reçu ou frais de dossier
        await prisma.receipt.create({
            data: {
                leaseId: lease.id,
                amount: parseFloat(rentAmount),
                status: 'UNPAID',
                type: 'LOVER_AVANCE',
                dueDate: new Date()
            }
        });

        return NextResponse.json({ success: true, lease });

    } catch (error: any) {
        console.error("Erreur API Création Bail Mobile:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
