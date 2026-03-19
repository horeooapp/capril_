"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

/**
 * QAPRIL - Module M-FRAUDE-KYC
 * Gestion de la sécurité et du score de confiance.
 */

export async function calculateFraudScore(userId: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                identityDocuments: true,
                leasesAsTenant: {
                    include: { arrears: true }
                }
            }
        })

        if (!user) return { success: false, error: "Utilisateur non trouvé." }

        let score = 0
        const flags: string[] = []

        // 1. Vérification des documents
        const verifiedDocs = user.identityDocuments.filter(d => d.status === "verified")
        if (verifiedDocs.length === 0) {
            score += 30
            flags.push("NO_VERIFIED_DOCS")
        }

        // 2. Historique des impayés (M-SCORE-CERT)
        const totalArrears = user.leasesAsTenant.reduce((acc, l) => acc + l.arrears.length, 0)
        if (totalArrears > 0) {
            score += totalArrears * 10
            flags.push(`ARREARS_DETECTED_${totalArrears}`)
        }

        // 3. Multi-comptes / Fingerprint (Placeholder)
        if (user.deviceFingerprint && user.deviceFingerprint === "KNOWN_FRAUD_DEVICE") {
            score += 100
            flags.push("FRAUD_DEVICE_DETECTED")
        }

        await prisma.user.update({
            where: { id: userId },
            data: {
                fraudScore: Math.min(score, 100), // Capé à 100
                fraudFlags: flags
            }
        })

        return { success: true, score, flags }
    } catch (error) {
        console.error("FRAUD_CALC_ERROR:", error)
        return { success: false }
    }
}

export async function addToBlacklist(data: {
    userId?: string
    documentHash?: string
    motif: string
    adminId: string
}) {
    try {
        const entry = await prisma.fraudBlacklist.create({
            data: {
                userId: data.userId,
                documentHash: data.documentHash,
                motif: data.motif,
                ajouteParId: data.adminId
            }
        })

        // En cas de doc hash, on peut invalider l'utilisateur
        if (data.documentHash) {
            await prisma.user.updateMany({
                where: { 
                    identityDocuments: {
                        some: { docNumberHash: data.documentHash }
                    }
                },
                data: { status: "suspended", fraudScore: 100 }
            })
        }

        revalidatePath("/admin/security")
        return { success: true, entryId: entry.id }
    } catch (error) {
        return { success: false, error: "Erreur lors de l'ajout en blacklist." }
    }
}
