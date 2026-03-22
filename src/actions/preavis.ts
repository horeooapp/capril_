"use server"

import { prisma } from "@/lib/prisma"
import crypto from "node:crypto"
import { revalidatePath } from "next/cache"

/**
 * M-LOC-PREAVIS : Préavis numérique certifié (M7)
 */

export async function createPreavisLocataire(userId: string, bailId: string, data: {
    dateDepartPrevue: Date,
    motif?: string
}) {
    // Vérification du délai légal minimum (1 mois / 30 jours)
    const minDate = new Date()
    minDate.setDate(minDate.getDate() + 30)

    if (data.dateDepartPrevue < minDate) {
        throw new Error(`Le délai légal minimum est de 30 jours. Date de départ possible minimum : ${minDate.toLocaleDateString()}`)
    }

    // Référence unique
    const ref = `PREV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`
    
    // Hash SHA-256 d'intégrité
    const rawContent = `${userId}-${bailId}-${data.dateDepartPrevue.toISOString()}-${ref}`
    const hash = crypto.createHash('sha256').update(rawContent).digest('hex')

    const preavis = await (prisma as any).preavisBail.create({
        data: {
            locataireId: userId,
            bailId,
            dateDepartPrevue: data.dateDepartPrevue,
            motif: data.motif,
            refPreavis: ref,
            hashSha256: hash,
            statut: "EMIS"
        }
    })

    // Update lease status potentially or trigger notifications
    // await prisma.lease.update({ where: { id: bailId }, data: { status: 'DEMANDE_RESILIATION' } })

    revalidatePath("/locataire/contrat")
    return preavis
}

export async function getPreavisLease(bailId: string) {
    return await (prisma as any).preavisBail.findMany({
        where: { bailId },
        orderBy: { createdAt: 'desc' }
    })
}

export async function accuseReceptionPreavis(preavisId: string) {
    const updated = await (prisma as any).preavisBail.update({
        where: { id: preavisId },
        data: {
            statut: "ACCUSE",
            proprioAccuseAt: new Date()
        }
    })
    revalidatePath("/locataire/contrat")
    return updated
}

export async function planifieEdlSortie(preavisId: string, dateEdl: Date) {
     return await (prisma as any).preavisBail.update({
        where: { id: preavisId },
        data: {
            statut: "ETAT_LIEUX_PLANIFIE",
            etatLieuxPrevu: dateEdl
        }
    })
}
