import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { token, action, ticketId } = body;

        if (!token) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        // Action read
        if (action === 'GET_TICKETS') {
            const properties = await prisma.property.findMany({ where: { ownerUserId: token }, select: { id: true }});
            const propertyIds = properties.map(p => p.id);

            const tickets = await prisma.ticketMaintenance.findMany({
                where: { propertyId: { in: propertyIds } },
                include: {
                    user: { select: { firstName: true, lastName: true } },
                    property: { select: { address: true, commune: true } }
                },
                orderBy: { createdAt: 'desc' }
            });

            return NextResponse.json({ success: true, tickets });
        }

        // Action update
        if (action === 'ACCEPT_TICKET' || action === 'REJECT_TICKET') {
            if (!ticketId) return NextResponse.json({ error: "Ticket ID manquant" }, { status: 400 });

            const newStatus = action === 'ACCEPT_TICKET' ? 'PRIS_EN_CHARGE' : 'CONTESTE';

            const updated = await prisma.ticketMaintenance.update({
                where: { id: ticketId },
                data: { status: newStatus }
            });

            return NextResponse.json({ success: true, ticket: updated });
        }

        return NextResponse.json({ error: "Action non reconnue" }, { status: 400 });

    } catch (error: any) {
        console.error("Erreur API Owner Tickets:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
