"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { BienRole, ProfilInterm } from "@prisma/client"
import { sendSMS } from "@/lib/sms"
import { logAction } from "./audit"
import { createMandatGestion } from "./mandates-gestion"
import { checkGuardrails } from "./guardrails"

/**
 * M-ROLES : Inviter un gestionnaire ou un agent terrain sur un bien
 */
export async function inviteManager(propertyId: string, phone: string, role: BienRole, profil?: ProfilInterm, note?: string) {
    const session = await auth()
    if (!session || !session.user || session.user.role !== "LANDLORD") {
        return { success: false, error: "Non autorisé. Seul le propriétaire peut inviter." }
    }

    try {
        // M-GARDE-FOUS : Vérification des seuils
        if (profil) {
            const guard = await checkGuardrails(phone, profil);
            if (!guard.success) {
                return { success: false, error: guard.error };
            }
        }

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

        // M-MANDAT : Créer le projet de mandat si c'est un intermédiaire
        let mandatId = null;
        if (role === "INTERMEDIAIRE" && profil) {
            const mandat = await createMandatGestion({
                proprietaireId: session.user.id,
                intermediaireId: inviteeId,
                profil: profil,
                biensConcernes: [propertyId]
            });
            mandatId = mandat.id;
        }

        // Créer l'accès
        const access = await (prisma as any).propertyAccess.upsert({
            where: {
                propertyId_userId: { propertyId, userId: inviteeId }
            },
            create: {
                propertyId,
                userId: inviteeId,
                role,
                profil,
                statut: "EN_ATTENTE", // Require mandate acceptance
                invitedById: session.user.id,
                mandatId,
                note
            },
            update: {
                role,
                profil,
                statut: "EN_ATTENTE",
                invitedById: session.user.id,
                invitedAt: new Date(),
                mandatId,
                note
            }
        })

        // Envoi du SMS
        const ownerName = session.user.fullName || "Un propriétaire"
        const smsMsg = `${ownerName} vous confie la gestion de ses biens sur QAPRIL. Connectez-vous avec ce numéro pour signer le mandat et accepter.`
        await sendSMS(phone, smsMsg).catch(console.error)

        await logAction({
            action: "INVITE_MANAGER",
            module: "M_ROLES",
            entityId: access.id,
            newValues: { role, profil, phone, mandatId }
        })

        revalidatePath(`/dashboard/properties/${propertyId}`)
        return { success: true, message: "Invitation et projet de mandat envoyés." }

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
        const access = await (prisma as any).propertyAccess.findUnique({
            where: { id: accessId }
        })

        if (!access || access.userId !== session.user.id) {
            return { success: false, error: "Invitation invalide." }
        }

        await (prisma as any).propertyAccess.update({
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
        const accesses = await (prisma as any).propertyAccess.findMany({
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
        return accesses.map((a: any) => ({ ...a.property, roleAssignee: a.role }))
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
        const access = await (prisma as any).propertyAccess.findUnique({
            where: { id: accessId },
            include: { property: true }
        })

        if (!access || access.property.ownerUserId !== session.user.id) {
            return { success: false, error: "Accès refusé." }
        }

        await (prisma as any).propertyAccess.update({
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
