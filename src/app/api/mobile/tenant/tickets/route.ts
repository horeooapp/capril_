import { prisma } from '@/lib/prisma';
import { verifyMobileToken } from '@/lib/mobile-auth';
import { MaintenanceService } from '@/lib/maintenance-service';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { action, token, title, description, priority, category, photoBase64 } = body;

        if (!token) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const payload = await verifyMobileToken(token);
        if (!payload) {
            return NextResponse.json({ error: "Non autorisé. Jeton invalide ou expiré." }, { status: 401 });
        }

        const userId = payload.userId;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                leasesAsTenant: {
                    where: { status: { in: ["ACTIVE", "ACTIVE_DECLARATIF", "LOYER_IMPAYE", "MISE_EN_DEMEURE", "DEMANDE_RESILIATION"] } },
                    include: { property: true }
                }
            }
        });

        if (!user || user.leasesAsTenant.length === 0) {
            return NextResponse.json({ error: "Aucun bail actif trouvé pour déclarer un incident." }, { status: 404 });
        }

        const activeLease = user.leasesAsTenant[0];

        if (action === 'CREATE_TICKET') {
            const ticket = await MaintenanceService.creerTicket({
                leaseId: activeLease.id,
                locataireId: user.id,
                categorie: (category as any) || 'MAI_AU',
                description: title ? `${title} - ${description}` : description,
                urgence: priority || 'NORMALE',
                photoUrl: photoBase64
            });

            return NextResponse.json({ success: true, ticket });
        }

        if (action === 'LIST_TICKETS') {
            const tickets = await prisma.ticketMaintenance.findMany({
                where: { locataireId: user.id },
                orderBy: { createdAt: 'desc' }
            });
            return NextResponse.json({ success: true, tickets });
        }

        return NextResponse.json({ error: "Action non valide" }, { status: 400 });

    } catch (error: any) {
        console.error("Erreur API Tickets Mobile:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
