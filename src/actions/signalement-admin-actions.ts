"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

async function requireAdmin() {
    const session = await auth()
    const activeRole = session ? (session.user as any).chosenRole || session.user?.role : null;
    if (activeRole !== "ADMIN" && activeRole !== "SUPER_ADMIN") {
        throw new Error("Unauthorized: Admin only")
    }
    return session.user.id
}

export async function getSignalements() {
    await requireAdmin()
    return await prisma.signalementLocataire.findMany({
        include: {
            locataire: {
                select: { id: true, firstName: true, lastName: true, phone: true }
            },
            bail: {
                select: { property: { select: { id: true, name: true, propertyCode: true } } }
            }
        },
        orderBy: { createdAt: "desc" }
    })
}

export async function resolveSignalement(id: string, resolutionDetails: string) {
    const adminId = await requireAdmin()

    const signalement = await prisma.signalementLocataire.findUnique({
        where: { id }
    })
    
    if (!signalement) throw new Error("Signalement introuvable")

    const updated = await prisma.signalementLocataire.update({
        where: { id },
        data: {
            statut: "RESOLU",
            noteResolution: resolutionDetails,
            resoluAt: new Date()
        }
    })

    // Log the resolution action
    await prisma.auditLog.create({
        data: {
            module: "SIGNALEMENT",
            action: "RESOLVE",
            entityId: id,
            userId: adminId,
            ipAddress: "N/A",
            newValues: { resolutionDetails }
        }
    })

    return { success: true, signalement: updated }
}
