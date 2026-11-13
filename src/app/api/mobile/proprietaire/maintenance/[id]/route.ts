import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';

/**
 * PATCH /api/mobile/proprietaire/maintenance/[id]
 * S-10 : Mise à jour du statut d'un signalement par le bailleur ou l'agence gestionnaire
 * Statuts possibles : 'EN_ATTENTE' | 'PLANIFIE' | 'PRIS_EN_CHARGE' | 'RESOLU' | 'REJETE'
 */
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: ticketId } = await params;
        const user = await authenticateMobileRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
        }

        const body = await request.json().catch(() => ({}));
        const { statut, commentaireProprio, dateIntervention, dateResolution, prestataireId } = body;

        const ticket = await prisma.ticketMaintenance.findUnique({
            where: { id: ticketId },
            include: {
                logement: true,
                lease: true,
            }
        });

        if (!ticket) {
            return NextResponse.json({ error: 'Ticket introuvable.' }, { status: 404 });
        }

        // Vérification des droits : propriétaire ou gestionnaire du logement
        const isAuthorized =
            ticket.logement?.ownerUserId === user.userId ||
            ticket.logement?.managedByUserId === user.userId ||
            ticket.lease?.landlordId === user.userId ||
            user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';

        if (!isAuthorized) {
            return NextResponse.json({ error: "Vous n'êtes pas autorisé à modifier ce signalement." }, { status: 403 });
        }

        // Normalisation du statut
        let newStatut = statut;
        if (statut === 'RÉSOLU' || statut === 'RESOLU') newStatut = 'RESOLU';
        else if (statut === 'PRIS_EN_CHARGE' || statut === 'EN_COURS') newStatut = 'PRIS_EN_CHARGE';
        else if (statut === 'PLANIFIE') newStatut = 'PLANIFIE';
        else if (statut === 'RECU' || statut === 'EN_ATTENTE') newStatut = 'EN_ATTENTE';

        const updateData: any = {};
        if (newStatut) {
            updateData.statut = newStatut;
            if (newStatut === 'PRIS_EN_CHARGE') {
                updateData.datePriseEnCharge = new Date();
                updateData.proprioVuAt = updateData.proprioVuAt || new Date();
            }
            if (newStatut === 'RESOLU') {
                updateData.closedAt = new Date();
            }
        }
        if (commentaireProprio !== undefined) updateData.commentaireProprio = commentaireProprio;
        if (prestataireId !== undefined) updateData.prestataireId = prestataireId;
        if (dateIntervention) updateData.dateIntervention = new Date(dateIntervention);

        const updated = await prisma.ticketMaintenance.update({
            where: { id: ticketId },
            data: updateData,
            include: {
                locataire: { select: { firstName: true, lastName: true, phone: true } },
                logement: { select: { name: true, address: true, commune: true } }
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Signalement mis à jour avec succès.',
            ticket: updated,
        });

    } catch (error: any) {
        console.error('[MOBILE API] proprietaire/maintenance/[id] PATCH error:', error);
        return NextResponse.json({ error: 'Erreur lors de la mise à jour du signalement.' }, { status: 500 });
    }
}

