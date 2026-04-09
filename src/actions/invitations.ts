"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

/**
 * M-INVITE-PROPRIO : Gestion des invitations de bail
 */

export async function sendInvitation(data: {
    propertyId?: string,
    invitantId: string,
    invitantType: 'PROPRIETAIRE' | 'AGENCE',
    locataireId: string,
    methodeDecouverte: string,
    loyerPropose: number,
    dateDebutProposee: Date,
    messageInvitant?: string
}) {
    try {
        let actualLandlordId = data.invitantId;
        
        if (data.propertyId) {
            const prop = await prisma.property.findUnique({
                where: { id: data.propertyId },
                select: { landlordId: true }
            });
            if (prop && prop.landlordId) {
                actualLandlordId = prop.landlordId;
            }
        }

        // 1. Créer le contrat (Lease) en attente de signature immédiatement
        let newLease = null;
        if (data.propertyId) {
            newLease = await prisma.lease.create({
                data: {
                    leaseReference: `BAIL-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
                    propertyId: data.propertyId,
                    landlordId: actualLandlordId,
                    tenantId: data.locataireId,
                    startDate: data.dateDebutProposee,
                    durationMonths: 12, // Valeur par défaut
                    rentAmount: Number(data.loyerPropose),
                    paymentDay: 5,
                    status: 'PENDING_SIGNATURE'
                }
            });
        }

        const invitation = await (prisma as any).invitationBail.create({
            data: {
                propertyId: data.propertyId,
                invitantId: data.invitantId,
                invitantType: data.invitantType,
                locataireId: data.locataireId,
                methodeDecouverte: data.methodeDecouverte,
                loyerPropose: data.loyerPropose,
                dateDebutProposee: data.dateDebutProposee,
                messageInvitant: data.messageInvitant,
                statut: 'ENVOYEE',
                leaseId: newLease ? newLease.id : null,
                expireAt: new Date(Date.now() + 72 * 60 * 60 * 1000) // 72 heures
            }
        })

        // Incrémenter le compteur sur le profil public (utilise updateMany pour éviter de crasher si le profil n'existe pas encore)
        await (prisma as any).locataireProfilPublic.updateMany({
            where: { userId: data.locataireId },
            data: { nbInvitationsRecues: { increment: 1 } }
        })

        // Déclencher SMS/WhatsApp via service tiers avec interception d'erreur
        try {
            const { NotificationService } = await import("@/lib/notification-service")
            const invitant = await prisma.user.findUnique({ where: { id: data.invitantId }, select: { firstName: true, lastName: true } })
            
            await NotificationService.envoyerNotification(data.locataireId, "INVITATION_BAIL_RECUE", {
                payload: {
                    smsText: `[QAPRIL] ${(invitant?.firstName ? invitant.firstName + " " : "") + (invitant?.lastName || "") || 'Un bailleur'} vous invite pour un bien. Répondez sur : https://qapril.ci/locataire/invitations`,
                    parameters: [(invitant?.firstName ? invitant.firstName + " " : "") + (invitant?.lastName || "") || 'Un bailleur']
                }
            })
        } catch (notifErr) {
            console.error("Non-fatal: L'envoi de la notification SMS a échoué, mais l'invitation est enregistrée.", notifErr)
        }

        return invitation
    } catch (error) {
        console.error("Error sending invitation:", error)
        throw new Error("Erreur lors de l'envoi de l'invitation")
    }
}

export async function respondToInvitation(invitationId: string, response: 'ACCEPTEE' | 'REFUSEE') {
    try {
        const invitation = await (prisma as any).invitationBail.findUnique({
            where: { id: invitationId },
            include: { property: true }
        })

        if (!invitation) throw new Error("Invitation non trouvée")
        if (invitation.statut !== 'ENVOYEE') throw new Error("Cette invitation n'est plus active")

        const updateData: any = {
            statut: response,
            reponduAt: new Date()
        }

        if (response === 'ACCEPTEE') {
            if (!invitation.leaseId) {
                // Créer le bail (Lease) si non pré-généré
                let actualLandlordId = invitation.invitantId;
                if (invitation.propertyId) {
                    const prop = await prisma.property.findUnique({ where: { id: invitation.propertyId }, select: { landlordId: true }});
                    if (prop?.landlordId) actualLandlordId = prop.landlordId;
                }

                const newLease = await prisma.lease.create({
                    data: {
                        leaseReference: `BAIL-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
                        propertyId: invitation.propertyId!,
                        landlordId: actualLandlordId,
                        tenantId: invitation.locataireId,
                        startDate: invitation.dateDebutProposee!,
                        durationMonths: 12,
                        rentAmount: Number(invitation.loyerPropose),
                        paymentDay: 5,
                        status: 'PENDING_SIGNATURE'
                    }
                })
                updateData.leaseId = newLease.id
            }
        } else {
            // Incrémenter les refus sur le profil public
            await (prisma as any).locataireProfilPublic.updateMany({
                where: { userId: invitation.locataireId },
                data: { nbInvitationsRefusees: { increment: 1 } }
            })
        }

        const updated = await (prisma as any).invitationBail.update({
            where: { id: invitationId },
            data: updateData
        })

        revalidatePath("/locataire/invitations")
        return updated
    } catch (error) {
        console.error("Error responding to invitation:", error)
        throw new Error("Erreur lors de la réponse à l'invitation")
    }
}

export async function getLocataireInvitations(userId: string) {
    try {
        const invitations = await (prisma as any).invitationBail.findMany({
            where: { locataireId: userId },
            include: {
                property: true,
                invitant: {
                    select: { firstName: true, lastName: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })
        return invitations
    } catch (error) {
        console.error("Error fetching invitations:", error)
        throw new Error("Erreur lors de la récupération des invitations")
    }
}
