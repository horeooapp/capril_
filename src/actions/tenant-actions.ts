"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"

export async function getTenantDashboard() {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== Role.TENANT) {
        throw new Error("Accès refusé. Réservé aux locataires.")
    }

    const userId = session.user.id

    try {
        // 1. Récupérer le Locataire
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, lastName: true, firstName: true, email: true, phone: true }
        })

        if (!user) throw new Error("Utilisateur introuvable")

        // 2. Trouver le bail actif (Dédicacé au locataire)
        const activeLease = await prisma.lease.findFirst({
            where: {
                tenantId: userId,
                status: { in: ["ACTIVE", "EN_RETARD", "PENDING_SIGNATURE", "EXPIRING"] }
            },
            include: {
                property: true,
                landlord: { select: { lastName: true, firstName: true, phone: true } },
                receipts: {
                    orderBy: { createdAt: "desc" },
                    take: 5
                },
                arrears: {
                    where: { status: "UNPAID" }
                }
            }
        })

        if (!activeLease) {
            return { success: true, hasLease: false, user }
        }

        // 3. Calculer les statistiques du loyer
        const totalArrears = activeLease.arrears.reduce((sum, arr) => sum + arr.amount, 0)
        let leaseStatus = activeLease.status
        if (totalArrears > 0) {
            leaseStatus = "EN_RETARD"
        }

        // 4. Utilitaires (Factures OCR CIE/SODECI)
        const utilities = await prisma.factureUtility.findMany({
            where: { leaseId: activeLease.id, statut: { in: ["EN_COURS", "EN_RETARD"] } },
            orderBy: { dateLimitePaiement: "asc" }
        })

        // 5. Score Locatif (Passeport)
        const locataireProfile = await prisma.locataireProfile.findUnique({
            where: { userId }
        })

        return {
            success: true,
            hasLease: true,
            user,
            lease: {
                ...activeLease,
                computedStatus: leaseStatus,
                totalArrears
            },
            utilities,
            score: locataireProfile?.scoreICL || 750
        }

    } catch (error: any) {
        console.error("Tenant Dashboard Error:", error)
        return { success: false, error: error.message }
    }
}
