import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMobileToken } from '@/lib/mobile-auth';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { token, propertyId, tenantId, rentAmount, depositAmount, leaseType } = body;

        if (!token) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const payload = await verifyMobileToken(token);
        if (!payload) {
            return NextResponse.json({ error: "Non autorisé. Jeton invalide ou expiré." }, { status: 401 });
        }

        const userId = payload.userId;

        // Vérification que le bien appartient au bailleur
        const property = await prisma.property.findUnique({ where: { id: propertyId } });
        if (!property || property.ownerUserId !== userId) {
             return NextResponse.json({ error: "Propriété invalide ou non autorisée." }, { status: 403 });
        }

        const leaseCount = await prisma.lease.count({ where: { landlordId: userId } });

        const lease = await prisma.lease.create({
            data: {
                propertyId,
                tenantId: tenantId || null,
                landlordId: userId,
                leaseReference: `MOB-BAIL-${Date.now()}`,
                durationMonths: 12,
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
                totalAmount: parseFloat(rentAmount),
                rentAmount: parseFloat(rentAmount),
                periodMonth: new Date().toISOString().substring(0, 7),
                paymentMethod: 'CASH',
                receiptRef: `B-REC-${Date.now()}`,
                status: 'pending',
                declarative: true
            }
        });



        return NextResponse.json({ success: true, lease });

    } catch (error: any) {
        console.error("Erreur API Création Bail Mobile:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
