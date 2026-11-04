"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { logAction } from "./audit"
import { notifyMatchingTenantsForProperty } from "./locataire-profil-public"

export async function getMarketplaceAnnonces() {
    const session = await auth()
    if (!session?.user?.id) return []

    try {
        const data = await prisma.annonce.findMany({
            where: { agenceId: session.user.id },
            include: { logement: true },
            orderBy: { publieeAt: 'desc' }
        })
        return data.map((a: any) => {
            const directImgs = a.logement?.images?.map((i: any) => i.s3Key) || []
            const parentImgs = a.logement?.parentProperty?.images?.map((i: any) => i.s3Key) || []
            const combined = [...(a.photosUrls || []), ...directImgs, ...parentImgs].filter(Boolean)
            return {
                ...a,
                photosUrls: combined.length > 0 ? combined : (a.photosUrls || [])
            }
        })
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

        // Déclencher les alertes automatiques pour les locataires correspondants
        try {
            const ann = await prisma.annonce.findUnique({
                where: { id: annonceId },
                include: { logement: true }
            });
            if (ann && ann.logement) {
                notifyMatchingTenantsForProperty({
                    id: ann.logement.id,
                    name: ann.titre || ann.logement.name,
                    commune: ann.logement.commune,
                    city: ann.logement.city,
                    neighborhood: (ann.logement as any).neighborhood,
                    rentAmount: Number(ann.loyerDemande)
                }).catch(() => {});
            }
        } catch {}

        revalidatePath("/dashboard/marketplace")
        revalidatePath("/mon-espace-locataire/marketplace")
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
            include: { 
                annonces: true, 
                leases: true,
                images: true,
                parentProperty: {
                    include: { images: true }
                }
            }
        })

        if (!property) return { error: "Propriété introuvable" }

        if (isOnline) {
            const directImages = property.images?.map((img: any) => img.s3Key) || []
            const parentImages = property.parentProperty?.images?.map((img: any) => img.s3Key) || []
            const propertyPhotos = [...directImages, ...parentImages].filter(Boolean)

            const existingAnnonce = property.annonces?.[0]
            if (existingAnnonce) {
                await prisma.annonce.update({
                    where: { id: existingAnnonce.id },
                    data: { 
                        statut: "ACTIVE", 
                        publieeAt: new Date(),
                        ...(propertyPhotos.length > 0 && (!existingAnnonce.photosUrls || existingAnnonce.photosUrls.length === 0) 
                            ? { photosUrls: propertyPhotos } 
                            : {})
                    }
                })
            } else {
                await prisma.annonce.create({
                    data: {
                        logementId: property.id,
                        agenceId: session.user.id,
                        titre: property.name || `Logement ${property.propertyType || ''} à ${property.commune || 'Abidjan'}`.trim(),
                        description: `Superbe logement idéalement situé à ${property.commune || 'Abidjan'} avec ${property.rooms || 2} pièces.`,
                        loyerDemande: property.declaredRentFcfa || (property.leases?.[0]?.rentAmount ? Number(property.leases[0].rentAmount) : 150000),
                        photosUrls: propertyPhotos,
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

        if (isOnline) {
            const loyerFinal = property.declaredRentFcfa || (property.leases?.[0]?.rentAmount ? Number(property.leases[0].rentAmount) : 150000);
            notifyMatchingTenantsForProperty({
                id: property.id,
                name: property.name,
                commune: property.commune,
                city: property.city,
                neighborhood: (property as any).neighborhood,
                rentAmount: Number(loyerFinal)
            }).catch(() => {});
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

export async function getPublicMarketplaceAnnonces(filters?: { 
    commune?: string, 
    minPrice?: number, 
    maxPrice?: number,
    sortBy?: 'price_asc' | 'price_desc' | 'recent'
}) {
    try {
        const whereClause: any = {
            statut: { in: ["ACTIVE", "LOUE"] }
        }

        if (filters?.commune && filters.commune !== "Toutes" && filters.commune !== "Toutes les localisations") {
            whereClause.logement = { 
                OR: [
                    { commune: { contains: filters.commune, mode: 'insensitive' } },
                    { city: { contains: filters.commune, mode: 'insensitive' } },
                    { address: { contains: filters.commune, mode: 'insensitive' } }
                ]
            }
        }

        if (filters?.minPrice || filters?.maxPrice) {
            whereClause.loyerDemande = {}
            if (filters.minPrice) whereClause.loyerDemande.gte = filters.minPrice
            if (filters.maxPrice) whereClause.loyerDemande.lte = filters.maxPrice
        }

        let orderByClause: any = { publieeAt: 'desc' }
        if (filters?.sortBy === 'price_asc') {
            orderByClause = { loyerDemande: 'asc' }
        } else if (filters?.sortBy === 'price_desc') {
            orderByClause = { loyerDemande: 'desc' }
        }

        const data = await prisma.annonce.findMany({
            where: whereClause,
            include: { 
                logement: {
                    include: {
                        images: true,
                        parentProperty: {
                            include: { images: true }
                        },
                        leases: {
                            where: {
                                status: { in: ['ACTIVE', 'PENDING_SIGNATURE', 'PENDING_CONFIRMATION'] }
                            },
                            select: { status: true }
                        }
                    }
                },
                agence: {
                    select: { firstName: true, lastName: true, phone: true, email: true }
                }
            },
            orderBy: orderByClause
        })

        return data.map((a: any) => {
            const directImgs = a.logement?.images?.map((i: any) => i.s3Key) || []
            const parentImgs = a.logement?.parentProperty?.images?.map((i: any) => i.s3Key) || []
            const combined = [...(a.photosUrls || []), ...directImgs, ...parentImgs].filter(Boolean)
            return {
                ...a,
                photosUrls: combined.length > 0 ? combined : (a.photosUrls || [])
            }
        })
    } catch (e) {
        console.error("Error getPublicMarketplaceAnnonces:", e)
        return []
    }
}
