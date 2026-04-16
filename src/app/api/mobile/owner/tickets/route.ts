import { prisma } from '@/lib/prisma';
import { verifyMobileToken } from '@/lib/mobile-auth';
import { MaintenanceService } from '@/lib/maintenance-service';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { token, action, ticketId, newStatus, technicianId, cost, techData, comment } = body;

        if (!token) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const payload = await verifyMobileToken(token);
        if (!payload) {
            return NextResponse.json({ error: "Non autorisé. Jeton invalide ou expiré." }, { status: 401 });
        }

        const userId = payload.userId;

        // Action read tickets
        if (action === 'GET_TICKETS') {
            const properties = await prisma.property.findMany({ where: { ownerUserId: userId }, select: { id: true }});
            const propertyIds = properties.map(p => p.id);

            const tickets = await prisma.ticketMaintenance.findMany({
                where: { logementId: { in: propertyIds } },
                include: {
                    locataire: { select: { firstName: true, lastName: true, phone: true } },
                    logement: { select: { address: true, commune: true } },
                    prestataire: true
                },
                orderBy: { createdAt: 'desc' }
            });

            return NextResponse.json({ success: true, tickets });
        }

        // --- GESTION DES PRESTATAIRES ---
        if (action === 'GET_PRESTATAIRES') {
            const prestataires = await prisma.prestataire.findMany({
                orderBy: { nom: 'asc' }
            });
            return NextResponse.json({ success: true, prestataires });
        }

        if (action === 'ADD_PRESTATAIRE') {
            if (!techData?.nom || !techData?.telephone) return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
            const p = await prisma.prestataire.create({
                data: {
                    nom: techData.nom,
                    specialite: techData.specialite || 'Général',
                    telephone: techData.telephone,
                }
            });
            return NextResponse.json({ success: true, prestataire: p });
        }

        // Action update ticket
        if (action === 'UPDATE_TICKET') {
            if (!ticketId) return NextResponse.json({ error: "Ticket ID manquant" }, { status: 400 });

            let updated;

            // Utilisation du Service pour les changements de statut (déclenche les notifications)
            if (newStatus === 'PRIS_EN_CHARGE') {
                updated = await MaintenanceService.prendreEnCharge(ticketId, comment);
            } else if (newStatus === 'RESOLU') {
                const finalCost = cost ? parseFloat(cost) : undefined;
                updated = await MaintenanceService.resoudreTicket(ticketId, comment, finalCost);
            }

            // Mises à jour granulaires additionnelles (technicien, coût)
            const extraData: any = {};
            if (technicianId) {
                extraData.prestataireId = technicianId;
                extraData.dateIntervention = new Date();
                // Si on assigne un technicien mais que le statut ne change pas, on s'assure que le ticket reste cohérent
            }
            if (cost !== undefined) {
                extraData.coutFinal = parseFloat(cost);
            }

            if (Object.keys(extraData).length > 0) {
                updated = await prisma.ticketMaintenance.update({
                    where: { id: ticketId },
                    data: extraData
                });
            }

            if (!updated) {
                 // Si aucun changement de statut spécial, on fait un update simple
                 const simpleUpdate: any = {};
                 if (newStatus) simpleUpdate.statut = newStatus;
                 updated = await prisma.ticketMaintenance.update({
                    where: { id: ticketId },
                    data: simpleUpdate
                });
            }

            return NextResponse.json({ success: true, ticket: updated });
        }

        return NextResponse.json({ error: "Action non reconnue" }, { status: 400 });

    } catch (error: any) {
        console.error("Erreur API Owner Tickets:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
