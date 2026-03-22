"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { BienRole } from "@prisma/client"
import { sendSMS } from "@/lib/sms"
import { logAction } from "./audit"

/**
 * M-ROLES : Inviter un gestionnaire ou un agent terrain sur un bien
 */
export async function inviteManager(propertyId: string, phone: string, role: BienRole, note?: string) {
    const session = await auth()
    if (!session || !session.user || session.user.role !== "LANDLORD") {
        return { success: false, error: "Non autorisé. Seul le propriétaire peut inviter." }
    }

    try {
        // Vérifier si le propriétaire détient bien le bien
        const property = await prisma.property.findUnique({
            where: { id: propertyId, ownerUserId: session.user.id }
        })

        if (!property) return { success: false, error: "Bien introuvable ou non autorisé." }

        // Chercher l'utilisateur par son téléphone
        let invitee = await prisma.user.findUnique({ where: { phone } })
        let inviteeId = ""

        if (!invitee) {
            // Créer un utilisateur "fantôme" (TENANT par défaut) qui devra s'inscrire
            invitee = await prisma.user.create({
                data: {
                    phone,
                    role: "TENANT", 
                    status: "invited"
                }
            })
        }
        inviteeId = invitee.id;

        // Créer l'accès
        const access = await prisma.propertyAccess.upsert({
            where: {
                propertyId_userId: { propertyId, userId: inviteeId }
            },
            create: {
                propertyId,
                userId: inviteeId,
                role,
                statut: "ACTIF",
                invitedById: session.user.id,
                note
            },
            update: {
                role,
                statut: "ACTIF",
                invitedById: session.user.id,
                invitedAt: new Date(),
                note
            }
        })

        // Envoi du SMS
        const ownerName = session.user.fullName || "Un propriétaire"
        const smsMsg = `${ownerName} vous invite à gérer ses biens sur QAPRIL. Téléchargez l'app et connectez-vous avec ce numéro pour accepter l'invitation.`
        await sendSMS(phone, smsMsg).catch(console.error)

        await logAction({
            action: "INVITE_MANAGER",
            module: "M_ROLES",
            entityId: access.id,
            newValues: { role, phone }
        })

        revalidatePath(`/dashboard/properties/${propertyId}`)
        return { success: true, message: "Invitation envoyée avec succès." }

    } catch (error) {
        console.error("[M-ROLES] Invite Error:", error)
        return { success: false, error: "Erreur lors de l'invitation." }
    }
}

/**
 * M-ROLES : Le gestionnaire accepte l'invitation
 */
export async function acceptManagerRole(accessId: string) {
    const session = await auth()
    if (!session || !session.user) return { success: false, error: "Non autorisé" }

    try {
        const access = await prisma.propertyAccess.findUnique({
            where: { id: accessId }
        })

        if (!access || access.userId !== session.user.id) {
            return { success: false, error: "Invitation invalide." }
        }

        await prisma.propertyAccess.update({
            where: { id: accessId },
            data: { acceptedAt: new Date(), statut: "ACTIF" }
        })

        revalidatePath("/dashboard")
        return { success: true }
    } catch (error) {
        console.error("[M-ROLES] Accept Error:", error)
        return { success: false, error: "Erreur serveur." }
    }
}

/**
 * M-ROLES : Lister les biens assignés à un gestionnaire
 */
export async function getAssignedProperties() {
    const session = await auth()
    if (!session || !session.user) return []

    try {
        const accesses = await prisma.propertyAccess.findMany({
            where: {
                userId: session.user.id,
                statut: "ACTIF",
                acceptedAt: { not: null }
            },
            include: {
                property: {
                    include: { owner: true }
                }
            }
        })
        return accesses.map(a => ({ ...a.property, roleAssignee: a.role }))
    } catch (error) {
        console.error("[M-ROLES] Get Assigned:", error)
        return []
    }
}

/**
 * M-ROLES : Révoquer un accès
 */
export async function revokeManagerRole(accessId: string) {
    const session = await auth()
    if (!session || !session.user || session.user.role !== "LANDLORD") return { success: false, error: "Non autorisé." }

    try {
        const access = await prisma.propertyAccess.findUnique({
            where: { id: accessId },
            include: { property: true }
        })

        if (!access || access.property.ownerUserId !== session.user.id) {
            return { success: false, error: "Accès refusé." }
        }

        await prisma.propertyAccess.update({
            where: { id: accessId },
            data: { statut: "REVOQUE", revokedAt: new Date() }
        })

        await logAction({
            action: "REVOKE_MANAGER",
            module: "M_ROLES",
            entityId: accessId
        })

        revalidatePath(`/dashboard/properties/${access.propertyId}`)
        return { success: true }
    } catch (error) {
        return { success: false, error: "Erreur serveur." }
    }
}
