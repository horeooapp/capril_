"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { logAction } from "./audit"
import { revalidatePath } from "next/cache"

export async function getIclProfile() {
    const session = await auth()
    if (!session?.user?.id) return null

    try {
        let profile = await prisma.locataireProfile.findUnique({
            where: { userId: session.user.id },
            include: { user: true }
        })

        if (!profile) {
            profile = await prisma.locataireProfile.create({
                data: {
                    userId: session.user.id,
                    scoreActuel: 50,
                    scoreBadge: "C"
                },
                include: { user: true }
            });
        }
        return profile;
    } catch {
        return null;
    }
}

export async function computeIclScore() {
    const session = await auth()
    if (!session?.user?.id) return { error: "Non autorisé" }

    try {
        // Obtenir toutes les quittances du locataire connect  
        // Note: Dans un environnement reel, on regarderait userId via Lease
        const leases = await prisma.lease.findMany({
            where: { tenantId: session.user.id },
            include: { receipts: true }
        });

        let totalReceipts = 0;
        let onTimeReceipts = 0;
        let delayedReceipts = 0;

        for (const lease of leases) {
            for (const receipt of lease.receipts) {
                totalReceipts++;
                if (receipt.status === "PAID" || receipt.status === "paid") {
                    onTimeReceipts++;
                } else if (receipt.status !== "DRAFT" && receipt.status !== "PENDING" && receipt.status !== "pending") {
                    delayedReceipts++;
                }
            }
        }

        // Calcul du score (Base 50 pour un nouveau)
        let newScore = 50;
        if (totalReceipts > 0) {
            const taux = (onTimeReceipts / totalReceipts);
            newScore = Math.floor(taux * 100);
            
            // Penalités
            newScore -= (delayedReceipts * 5);
        }

        newScore = Math.max(0, Math.min(100, newScore));
        
        let newBadge = "D";
        if (newScore >= 90) newBadge = "A+";
        else if (newScore >= 80) newBadge = "A";
        else if (newScore >= 60) newBadge = "B";
        else if (newScore >= 40) newBadge = "C";

        const profile = await prisma.locataireProfile.upsert({
            where: { userId: session.user.id },
            update: {
                scoreActuel: newScore,
                scoreBadge: newBadge,
                scoreCalculeAt: new Date(),
                tauxPaiement12m: totalReceipts > 0 ? (onTimeReceipts / totalReceipts) * 100 : 0
            },
            create: {
                userId: session.user.id,
                scoreActuel: newScore,
                scoreBadge: newBadge,
                scoreCalculeAt: new Date()
            }
        });

        await logAction({
            action: "COMPUTE_ICL",
            module: "TRUST_VAULT",
            entityId: session.user.id
        });

        revalidatePath("/dashboard/icl")
        return { success: true, newScore, newBadge }
    } catch (e) {
        console.error(e)
        return { error: "Erreur serveur lors du calcul ICL." }
    }
}
