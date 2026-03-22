"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

// Type Helper for checking admin
async function requireAdmin() {
    const session = await auth()
    if (!session || !session.user || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized: Admin only")
    }
    return session.user.id
}

async function auditTarifChange(tableCible: string, enregistrementId: string, action: string, avant: any, apres: any, userId: string) {
    await (prisma as any).configTarifsAudit.create({
        data: {
            tableCible,
            enregistrementId,
            action,
            avant: avant ? avant : undefined,
            apres: apres ? apres : undefined,
            modifieParId: userId
        }
    })
}

// -------------------------------------------------------------
// 1. CONFIGURATION TARIFAIRE (Grille Globale)
// -------------------------------------------------------------

export async function getConfigTarifs() {
    return await (prisma as any).configTarif.findMany({
        orderBy: { cle: "asc" }
    })
}

export async function updateConfigTarif(cle: string, valeur: number, dateEffet: Date, noteModification: string) {
    const adminId = await requireAdmin()

    if (cle === "bdq_ttc") {
        throw new Error("Ce tarif est verrouillé par la politique QAPRIL — le BDQ est et restera gratuit.")
    }

    const current = await (prisma as any).configTarif.findUnique({ where: { cle } })
    if (!current) throw new Error(`Clé tarifaire non trouvée : ${cle}`)
        
    if (!current.modifiable) {
        throw new Error("Ce tarif n'est pas modifiable.")
    }

    const updated = await (prisma as any).configTarif.update({
        where: { cle },
        data: {
            valeur,
            dateEffet,
            noteModification,
            valeurPrecedente: current.valeur,
            modifieParId: adminId,
            modifieAt: new Date()
        }
    })

    await auditTarifChange("config_tarifs", updated.id, "UPDATE", current, updated, adminId)

    return { success: true, tarif: updated }
}

// -------------------------------------------------------------
// 2. OFFRES ABONNEMENTS (PRO STARTER, etc.)
// -------------------------------------------------------------

export async function getOffresAbonnements() {
    return await (prisma as any).offreAbonnement.findMany({
        orderBy: { ordreAffichage: "asc" }
    })
}

export async function createOffreAbonnement(data: any) {
    const adminId = await requireAdmin()
    
    const offre = await (prisma as any).offreAbonnement.create({
        data: {
            ...data,
            modifieParId: adminId
        }
    })
    
    await auditTarifChange("offres_abonnements", offre.id, "INSERT", null, offre, adminId)
    return { success: true, offre }
}

export async function updateOffreAbonnement(offreId: string, data: any) {
    const adminId = await requireAdmin()
    
    const current = await (prisma as any).offreAbonnement.findUnique({ where: { id: offreId } })
    if (!current) throw new Error("Offre non trouvée")

    const updated = await (prisma as any).offreAbonnement.update({
        where: { id: offreId },
        data: {
            ...data,
            modifieParId: adminId,
            modifieAt: new Date()
        }
    })

    await auditTarifChange("offres_abonnements", offreId, "UPDATE", current, updated, adminId)
    return { success: true, offre: updated }
}

// -------------------------------------------------------------
// 3. CODES PROMO
// -------------------------------------------------------------

export async function getCodesPromo() {
    await requireAdmin()
    return await (prisma as any).codePromo.findMany({
        include: { offreCible: true },
        orderBy: { createdAt: "desc" }
    })
}

export async function createCodePromo(data: any) {
    const adminId = await requireAdmin()
    
    // Ensure code is upper case
    data.code = data.code.toUpperCase().trim()

    const code = await (prisma as any).codePromo.create({
        data: {
            ...data,
            createdParId: adminId
        }
    })

    await auditTarifChange("codes_promo", code.id, "INSERT", null, code, adminId)
    return { success: true, codePromo: code }
}

export async function toggleCodePromo(promoId: string, actif: boolean) {
    const adminId = await requireAdmin()
    const current = await (prisma as any).codePromo.findUnique({ where: { id: promoId } })
    
    const updated = await (prisma as any).codePromo.update({
        where: { id: promoId },
        data: { actif }
    })
    
    await auditTarifChange("codes_promo", promoId, "UPDATE", current, updated, adminId)
    return { success: true, codePromo: updated }
}

// -------------------------------------------------------------
// 4. TARIFS NEGOCIES (Specific User Overrides)
// -------------------------------------------------------------

export async function getTarifsNegocies() {
    await requireAdmin()
    return await (prisma as any).tarifNegocie.findMany({
        include: { user: true, offre: true },
        orderBy: { createdAt: "desc" }
    })
}

export async function createTarifNegocie(userId: string, targetType: string, prixNegocieTtc: number, note: string, data: any = {}) {
    const adminId = await requireAdmin()
    
    if (!note || note.trim().length === 0) {
        throw new Error("La note explicative est obligatoire pour un tarif négocié.")
    }

    const tarif = await (prisma as any).tarifNegocie.create({
        data: {
            userId,
            type: targetType,
            prixNegocieTtc,
            note,
            ...data, // offreId, dateDebut, dateFin, autoRenouveler
            createdParId: adminId
        }
    })

    await auditTarifChange("tarifs_negocie", tarif.id, "INSERT", null, tarif, adminId)
    return { success: true, tarifNegocie: tarif }
}

export async function deleteTarifNegocie(negId: string) {
    const adminId = await requireAdmin()
    
    const current = await (prisma as any).tarifNegocie.findUnique({ where: { id: negId } })
    if (!current) throw new Error("Tarif négocié non trouvé")

    await (prisma as any).tarifNegocie.delete({ where: { id: negId } })
    
    await auditTarifChange("tarifs_negocie", negId, "DELETE", current, null, adminId)
    return { success: true }
}

export async function getAuditTarifs() {
    await requireAdmin()
    return await (prisma as any).configTarifsAudit.findMany({
        orderBy: { createdAt: "desc" },
        include: { modifiePar: true }
    })
}
