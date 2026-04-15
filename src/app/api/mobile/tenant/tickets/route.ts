import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { action, token, title, description, priority, category } = body;

        if (!token) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: token },
            include: {
                leasesAsTenant: {
                    where: { status: { in: ["ACTIVE", "LOYER_IMPAYE"] } },
                    include: { property: true }
                }
            }
        });

        if (!user || user.leasesAsTenant.length === 0) {
            return NextResponse.json({ error: "Aucun bail actif trouvé" }, { status: 404 });
        }

        const activeLease = user.leasesAsTenant[0];

        if (action === 'CREATE_TICKET') {
            const ticket = await prisma.ticketMaintenance.create({
                data: {
                    ticketRef: `TKT-${Date.now()}`,
                    description: title ? `${title} - ${description}` : description,
                    urgence: priority === 'CRITIQUE' ? 'URGENTE' : 'NORMALE',
                    categorie: 'MAI_AU',
                    statut: 'EN_ATTENTE',
                    locataireId: user.id,
                    logementId: activeLease.propertyId,
                    leaseId: activeLease.id
                }
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
