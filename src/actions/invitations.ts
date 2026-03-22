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
                expireAt: new Date(Date.now() + 72 * 60 * 60 * 1000) // 72 heures
            }
        })

        // Incrémenter le compteur sur le profil public
        await (prisma as any).locataireProfilPublic.update({
            where: { userId: data.locataireId },
            data: { nbInvitationsRecues: { increment: 1 } }
        })

        // TODO: Déclencher SMS/WhatsApp via service tiers

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
            // Créer le bail (Lease)
            const newLease = await prisma.lease.create({
                data: {
                    leaseReference: `BAIL-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
                    propertyId: invitation.propertyId!,
                    landlordId: invitation.invitantId, // Si agence, le landlordId doit être géré différemment (PROPRIETAIRE du bien)
                    tenantId: invitation.locataireId,
                    startDate: invitation.dateDebutProposee!,
                    durationMonths: 12,
                    rentAmount: Number(invitation.loyerPropose),
                    paymentDay: 5,
                    status: 'PENDING_SIGNATURE'
                }
            })
            updateData.leaseId = newLease.id
        } else {
            // Incrémenter les refus sur le profil public
            await (prisma as any).locataireProfilPublic.update({
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
                    select: { fullName: true }
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
