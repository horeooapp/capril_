"use server"

import { prisma } from "@/lib/prisma"
import crypto from "node:crypto"
import { revalidatePath } from "next/cache"

/**
 * M-LOC-CAUTION : Certification de caution (M6)
 */

export async function certifyCautionSaisie(bailId: string, data: {
    montantFcfa: number,
    dateVersement: Date,
    modeVersement: string,
    destination: any,
    conditionsRestit?: string
}) {
    // Génération de la référence unique
    const ref = `CAU-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`
    
    // Contenu pour le hash SHA-256 (Propriété engageante)
    const rawContent = `${bailId}-${data.montantFcfa}-${data.dateVersement.toISOString()}-${data.destination}`
    const hash = crypto.createHash('sha256').update(rawContent).digest('hex')

    const caution = await (prisma as any).cautionBail.create({
        data: {
            bailId,
            montantFcfa: data.montantFcfa,
            dateVersement: data.dateVersement,
            modeVersement: data.modeVersement,
            destination: data.destination,
            conditionsRestit: data.conditionsRestit,
            certificatRef: ref,
            hashSha256: hash
        }
    })

    revalidatePath("/locataire/contrat")
    return caution
}

export async function confirmCautionLocataire(cautionId: string) {
    const updated = await (prisma as any).cautionBail.update({
        where: { id: cautionId },
        data: {
            confirmeLocataire: true,
            confirmeAt: new Date()
        }
    })
    revalidatePath("/locataire/contrat")
    return updated
}

export async function getCautionBail(bailId: string) {
    return await (prisma as any).cautionBail.findUnique({
        where: { bailId }
    })
}

/**
 * Restitution de caution
 */
export async function closeCautionRestitution(cautionId: string, data: {
    montantRestitue: number,
    dateRestitution: Date,
    motifRetenue?: string
}) {
    const updated = await (prisma as any).cautionBail.update({
        where: { id: cautionId },
        data: {
            restituee: true,
            montantRestitue: data.montantRestitue,
            dateRestitution: data.dateRestitution,
            motifRetenue: data.motifRetenue
        }
    })
    revalidatePath("/locataire/contrat")
    return updated
}
