"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { logAction } from "./audit"
import crypto from "node:crypto"
import { ProfilInterm } from "@prisma/client"

export async function createMandatGestion(data: {
    proprietaireId: string,
    intermediaireId: string,
    profil: ProfilInterm,
    biensConcernes: string[],
    dateFin?: Date,
    permissions?: any
}) {
    const defaultPermissions = {
        enregistrer_paiements: true,
        modifier_loyers: false,
        generer_rapports: data.profil === "NOTAIRE" || data.profil === "HUISSIER",
        acces_revenus_globaux: false
    }

    const mandat = await (prisma as any).mandatGestion.create({
        data: {
            proprietaireId: data.proprietaireId,
            intermediaireId: data.intermediaireId,
            profil: data.profil,
            biensConcernes: JSON.stringify(data.biensConcernes),
            dateFin: data.dateFin,
            permissions: data.permissions || defaultPermissions,
            statut: "EN_ATTENTE"
        }
    })

    return mandat
}

export async function getMandatGestion(mandatId: string) {
    const session = await auth()
    if (!session || !session.user) return null

    const mandat = await (prisma as any).mandatGestion.findUnique({
        where: { id: mandatId },
        include: { proprietaire: true, intermediaire: true }
    })

    if (!mandat) return null

    // Check permissions
    if (session.user.id !== mandat.proprietaireId && session.user.id !== mandat.intermediaireId && session.user.role !== "ADMIN") {
        return null
    }

    return mandat
}

export async function acceptMandatGestion(mandatId: string) {
    const session = await auth()
    if (!session || !session.user) return { success: false, error: "Non autorisé" }

    const mandat = await prisma.mandatGestion.findUnique({
        where: { id: mandatId }
    })

    if (!mandat || mandat.intermediaireId !== session.user.id) {
        return { success: false, error: "Mandat invalide." }
    }

    const hashString = `${mandat.id}-${mandat.proprietaireId}-${mandat.intermediaireId}-${Date.now()}`
    const hashSha256 = crypto.createHash("sha256").update(hashString).digest("hex")

    await (prisma as any).mandatGestion.update({
        where: { id: mandatId },
        data: {
            statut: "ACCEPTE",
            signatureInterm: new Date(),
            hashSha256
        }
    })

    // Define accesses
    const biensIds = JSON.parse(mandat.biensConcernes || "[]") as string[]
    for (const bienId of biensIds) {
        await (prisma as any).propertyAccess.updateMany({
            where: { propertyId: bienId, userId: session.user.id, mandatId: mandat.id },
            data: { statut: "ACTIF", acceptedAt: new Date() }
        })
    }

    await logAction({
        action: "ACCEPT_MANDAT_GESTION",
        module: "M_MANDAT",
        entityId: mandatId,
        newValues: { hashSha256 }
    })

    revalidatePath("/dashboard")
    return { success: true }
}

export async function refuseMandatGestion(mandatId: string) {
    const session = await auth()
    if (!session || !session.user) return { success: false, error: "Non autorisé" }

    const mandat = await prisma.mandatGestion.findUnique({
        where: { id: mandatId }
    })

    if (!mandat || mandat.intermediaireId !== session.user.id) {
        return { success: false, error: "Mandat invalide." }
    }

    await (prisma as any).mandatGestion.update({
        where: { id: mandatId },
        data: { statut: "REFUSE" }
    })

    await (prisma as any).propertyAccess.updateMany({
        where: { userId: session.user.id, mandatId: mandat.id },
        data: { statut: "REVOQUE" }
    })

    revalidatePath("/dashboard")
    return { success: true }
}

export async function revokeMandatGestion(mandatId: string) {
    const session = await auth()
    if (!session || !session.user) return { success: false, error: "Non autorisé" }

    const mandat = await prisma.mandatGestion.findUnique({
        where: { id: mandatId }
    })

    if (!mandat || mandat.proprietaireId !== session.user.id) {
        return { success: false, error: "Mandat invalide." }
    }

    await (prisma as any).mandatGestion.update({
        where: { id: mandatId },
        data: { statut: "REVOQUE" }
    })

    await (prisma as any).propertyAccess.updateMany({
        where: { userId: mandat.intermediaireId, mandatId: mandat.id },
        data: { statut: "REVOQUE", revokedAt: new Date() }
    })

    revalidatePath("/dashboard")
    return { success: true }
}
