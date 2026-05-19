"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { logAction } from "./audit"

export async function getPendingCandidatures() {
    const session = await auth()
    if (!session?.user?.id) return []

    try {
        const fullUser = await prisma.user.findUnique({ 
            where: { id: session.user.id }, 
            select: { capaciteActive: true, role: true } 
        })
        const activeRole = fullUser?.capaciteActive || (session.user as any)?.chosenRole || fullUser?.role

        let logementCondition: any = {}
        if (['LANDLORD', 'LANDLORD_PRO', 'PROPRIETAIRE'].includes(activeRole)) {
            logementCondition = { ownerUserId: session.user.id }
        } else {
            logementCondition = {
                OR: [
                    { ownerUserId: session.user.id },
                    { managedByUserId: session.user.id }
                ]
            }
        }

        const candidatures = await prisma.candidature.findMany({
            where: {
                statut: "SOUMISE",
                logement: logementCondition
            },
            include: {
                logement: true,
                candidat: {
                    include: {
                        locataireProfile: true,
                        reliabilityScores: true
                    }
                }
            },
            orderBy: { scoreQapril: 'desc' }
        })
        return candidatures
    } catch {
        return []
    }
}

export async function getAcceptedCandidatures() {
    const session = await auth()
    if (!session?.user?.id) return []

    try {
        const fullUser = await prisma.user.findUnique({ 
            where: { id: session.user.id }, 
            select: { capaciteActive: true, role: true } 
        })
        const activeRole = fullUser?.capaciteActive || (session.user as any)?.chosenRole || fullUser?.role

        let logementCondition: any = {}
        if (['LANDLORD', 'LANDLORD_PRO', 'PROPRIETAIRE'].includes(activeRole)) {
            logementCondition = { ownerUserId: session.user.id }
        } else {
            logementCondition = {
                OR: [
                    { ownerUserId: session.user.id },
                    { managedByUserId: session.user.id }
                ]
            }
        }

        const candidatures = await prisma.candidature.findMany({
            where: {
                statut: "ACCEPTE",
                logement: logementCondition
            },
            include: {
                logement: true,
                candidat: {
                    include: {
                        locataireProfile: true,
                        reliabilityScores: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })
        return candidatures
    } catch {
        return []
    }
}

export async function processCandidature(candidatureId: string, action: "ACCEPTE" | "REJETE") {
    const session = await auth()
    if (!session?.user?.id) return { error: "Non autorisé" }

    try {
        await prisma.candidature.update({
            where: { id: candidatureId },
            data: { statut: action }
        })

        await logAction({
            action: `CANDIDATURE_${action}`,
            module: "MATCHING",
            entityId: candidatureId
        })

        revalidatePath("/dashboard/matching")
        return { success: true }
    } catch (e) {
        return { error: "Erreur lors du traitement de la candidature." }
    }
}
