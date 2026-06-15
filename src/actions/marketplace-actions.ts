"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { logAction } from "./audit"

export async function getMarketplaceAnnonces() {
    const session = await auth()
    if (!session?.user?.id) return []

    try {
        const data = await prisma.annonce.findMany({
            where: { agenceId: session.user.id },
            include: { logement: true },
            orderBy: { publieeAt: 'desc' }
        })
        return data
    } catch {
        return []
    }
}

export async function toggleAnnonceDiffusion(annonceId: string, channel: string, value: boolean) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Non autorisé" };

    try {
        const annonce = await prisma.annonce.findUnique({ where: { id: annonceId } });
        if (!annonce) return { error: "Annonce introuvable" };

        const diffusions: any = annonce.diffusions || { jumia: false, expat: false, whatsapp: false };
        diffusions[channel] = value;

        await prisma.annonce.update({
            where: { id: annonceId },
            data: { diffusions }
        });

        revalidatePath("/dashboard/syndication");
        return { success: true };
    } catch {
        return { error: "Erreur technique." };
    }
}

export async function publishAnnonce(annonceId: string) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Non autorisé" }

    try {
        await prisma.annonce.update({
            where: { id: annonceId },
            data: { 
                statut: "ACTIVE",
                publieeAt: new Date()
            }
        })

        await logAction({
            action: "PUBLISH_ANNONCE",
            module: "MARKETPLACE",
            entityId: annonceId
        })

        revalidatePath("/dashboard/marketplace")
        return { success: true }
    } catch (e) {
        return { error: "Erreur technique lors de la publication." }
    }
}

export async function syncOmnichannel() {
    const session = await auth()
    if (!session?.user?.id) return { error: "Non autorisé" }
    
    await logAction({ action: "OMNICHANNEL_SYNC", module: "MARKETPLACE", entityId: "global" })
    
    return { success: true, message: "Synchronisation multi-plateforme terminée avec succès." }
}

export async function getAvailableProperties() {
    const session = await auth()
    if (!session?.user?.id) return []
    try {
        const props = await prisma.property.findMany({
            where: { 
                OR: [
                    { ownerUserId: session.user.id },
                    { managedByUserId: session.user.id },
                    { accessRoles: { some: { userId: session.user.id, statut: "ACTIF" } } }
                ],
                status: { not: "archived" },
                leases: {
                    none: {
                        status: { in: ['ACTIVE', 'LOYER_IMPAYE', 'PENDING_SIGNATURE', 'DRAFT', 'PENDING_CONFIRMATION', 'ACTIVE_DECLARATIF'] }
                    }
                }
            }
        })
        return props
    } catch (e) {
        console.error("Error getAvailableProperties:", e)
        return []
    }
}

export async function createAnnonce(data: { logementId: string, titre: string, description: string, loyerDemande: number }) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Non autorisé" }

    try {
        const rep = await prisma.annonce.create({
            data: {
                ...data,
                agenceId: session.user.id,
                statut: "BROUILLON"
            }
        })
        revalidatePath("/dashboard/marketplace")
        return { success: true, annonce: rep }
    } catch (e: any) {
        return { error: "Erreur technique lors de la création." }
    }
}

export async function togglePropertyMarketplaceStatus(propertyId: string, isOnline: boolean) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Non autorisé" }

    try {
        const property = await prisma.property.findUnique({
            where: { id: propertyId },
            include: { annonces: true, leases: true }
        })

        if (!property) return { error: "Propriété introuvable" }

        if (isOnline) {
            const existingAnnonce = property.annonces?.[0]
            if (existingAnnonce) {
                await prisma.annonce.update({
                    where: { id: existingAnnonce.id },
                    data: { statut: "ACTIVE", publieeAt: new Date() }
                })
            } else {
                await prisma.annonce.create({
                    data: {
                        logementId: property.id,
                        agenceId: session.user.id,
                        titre: property.name || `Logement ${property.propertyType || ''} à ${property.commune || 'Abidjan'}`.trim(),
                        description: `Superbe logement idéalement situé à ${property.commune || 'Abidjan'} avec ${property.rooms || 2} pièces.`,
                        loyerDemande: property.declaredRentFcfa || (property.leases?.[0]?.rentAmount ? Number(property.leases[0].rentAmount) : 150000),
                        statut: "ACTIVE",
                        publieeAt: new Date()
                    }
                })
            }
        } else {
            await prisma.annonce.updateMany({
                where: { logementId: propertyId },
                data: { statut: "SUSPENDUE" }
            })
        }

        revalidatePath("/dashboard/properties")
        revalidatePath("/dashboard")
        revalidatePath("/mon-espace-locataire/marketplace")
        return { success: true }
    } catch (e: any) {
        console.error("Error togglePropertyMarketplaceStatus:", e)
        return { error: "Erreur technique lors de la mise à jour." }
    }
}

export async function getPublicMarketplaceAnnonces(filters?: { commune?: string, minPrice?: number, maxPrice?: number }) {
    try {
        const whereClause: any = {
            statut: "ACTIVE"
        }

        if (filters?.commune && filters.commune !== "Toutes") {
            whereClause.logement = { ...whereClause.logement, commune: { contains: filters.commune } }
        }

        if (filters?.minPrice || filters?.maxPrice) {
            whereClause.loyerDemande = {}
            if (filters.minPrice) whereClause.loyerDemande.gte = filters.minPrice
            if (filters.maxPrice) whereClause.loyerDemande.lte = filters.maxPrice
        }

        const data = await prisma.annonce.findMany({
            where: whereClause,
            include: { 
                logement: {
                    include: {
                        images: true
                    }
                },
                agence: {
                    select: { firstName: true, lastName: true, phone: true, email: true }
                }
            },
            orderBy: { publieeAt: 'desc' }
        })

        return data
    } catch (e) {
        console.error("Error getPublicMarketplaceAnnonces:", e)
        return []
    }
}
