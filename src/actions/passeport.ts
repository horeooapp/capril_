"use server"

import { prisma } from "@/lib/prisma"
import crypto from "node:crypto"
import { calculateUserScore } from "@/lib/scoring"
import { revalidatePath } from "next/cache"

/**
 * M-LOC-PASSPORT : Passeport Locataire (M8)
 */

export async function generatePasseportLocatif(userId: string) {
    // 1. Recalculer le score actuel
    const scoreData = await calculateUserScore(userId)

    // 2. Récupérer l'historique complet des baux
    const historyBails = await (prisma as any).lease.findMany({
        where: { tenantId: userId },
        include: { 
            property: true,
            receipts: { take: 12, orderBy: { periodMonth: 'desc' } }
        }
    })

    // 3. Calculer les statistiques globales
    const totalBails = historyBails.length
    const bailsClos = historyBails.filter((b: any) => b.status === "TERMINATED").length
    const bailsActifs = historyBails.filter((b: any) => ["ACTIVE", "ACTIVE_DECLARATIF"].includes(b.status)).length

    const snap = historyBails.map((b: any) => ({
        bailRef: b.leaseReference,
        propriete: b.property.name || b.property.propertyCode,
        commune: b.property.commune,
        debut: b.startDate,
        fin: b.endDate,
        statut: b.status,
        loyer: b.rentAmount
    }))

    // 4. Génération de la référence unique
    const ref = `PASS-${new Date().getFullYear()}-${userId.substring(0, 5).toUpperCase()}`
    
    // Hash d'intégrité
    const rawContent = `${ref}-${userId}-${scoreData.score}-${JSON.stringify(snap)}`
    const hash = crypto.createHash('sha256').update(rawContent).digest('hex')

    // 5. Enregistrement
    const passeport = await (prisma as any).passeportLocatif.create({
        data: {
            locataireId: userId,
            refPasseport: ref,
            scoreGlobal: scoreData.score,
            tauxPaiementGlobal: scoreData.tauxPaiement12m,
            nbBailsInclus: totalBails,
            periodeCouverteDebut: historyBails.length > 0 ? historyBails[0].startDate : new Date(),
            periodeCouverteFin: new Date(),
            snapshotBails: snap,
            hashSha256: hash,
            expireAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)) // Valable 1 an
        }
    })

    // Mettre à jour la date de génération sur le profil
    await (prisma as any).locataireProfile.update({
        where: { userId },
        data: { 
            passeportGenereAt: new Date(),
            nbBailsActifs: bailsActifs,
            nbBailsClos: bailsClos
        }
    })

    revalidatePath("/locataire/passeport")
    return passeport
}

export async function getPasseportsLocataire(userId: string) {
    return await (prisma as any).passeportLocatif.findMany({
        where: { locataireId: userId },
        orderBy: { createdAt: 'desc' }
    })
}

export async function incrementPassportConsultation(passportId: string) {
    return await (prisma as any).passeportLocatif.update({
        where: { id: passportId },
        data: { nbConsultations: { increment: 1 } }
    })
}
