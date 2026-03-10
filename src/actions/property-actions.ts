"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Role } from "@prisma/client"
import { generatePropertyCode, DEFAULT_CHECKLIST, PropertyValidationChecklist } from "@/lib/property-utils"

export type CreatePropertyInput = {
    propertyType: string // apartment|house|studio|villa|room|commercial
    leaseType: 'residential' | 'commercial'
    commune: string
    address: string
    areaSqm?: number
    rooms?: number
    bedrooms?: number
    amenities?: string[]
    mandateId?: string // Required for Level 4 (Agencies/Pro)
}

/**
 * Part 6.1: Property Registration
 */
export async function createProperty(input: CreatePropertyInput) {
    const session = await auth()
    
    if (!session || !session.user || !session.user.id) {
        throw new Error("Authentification requise.")
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { kycLevel: true, role: true }
    })

    if (!user) throw new Error("Utilisateur non trouvé.")

    // Level 2 required for individual landlords, Level 4 for Pros/Agencies
    const isPro = ['AGENCY', 'LANDLORD_PRO'].includes(session.user.role as any)
    if (isPro && user.kycLevel < 4) {
        throw new Error("Votre entité légale doit être vérifiée (Niveau 4) avant d'enregistrer des biens.")
    }
    if (!isPro && user.kycLevel < 2) {
        throw new Error("Votre identité doit être vérifiée (Niveau 2) avant d'enregistrer des biens.")
    }

    // Mandate enforcement for Pros/Agencies
    if (isPro && !input.mandateId) {
        throw new Error("Un mandat de gestion valide est requis pour enregistrer ce bien en tant que professionnel.")
    }

    try {
        // 1. Get sequence for this commune/city mapping
        const count = await prisma.property.count({
            where: { commune: input.commune }
        })

        const propertyCode = generatePropertyCode(input.leaseType, input.commune, count + 1)

        const property = await prisma.property.create({
            data: {
                ...input,
                propertyCode,
                ownerUserId: session.user.id,
                status: 'pending_verification',
                documents: DEFAULT_CHECKLIST as any
            }
        })

        // 2. Link mandate if provided
        if (input.mandateId) {
            await prisma.mandate.update({
                where: { id: input.mandateId },
                data: { propertyId: property.id }
            })
        }

        revalidatePath("/dashboard/properties")
        return { success: true, propertyId: property.id, propertyCode }

    } catch (error) {
        console.error("Erreur création bien:", error)
        return { error: "Erreur lors de l'enregistrement du bien." }
    }
}

/**
 * Part 6.2: ANAH Agent Validation
 * Triggers PNB (Digital Passport) initialization
 */
export async function validateProperty(
    propertyId: string, 
    checklist: PropertyValidationChecklist,
    action: 'approve' | 'reject'
) {
    const session = await auth()
    
    // Only ANAH Agents or Admins
    const authorizedRoles: Role[] = [Role.SUPER_ADMIN, Role.ADMIN, Role.ANAH_AGENT]
    if (!session || !session.user || !authorizedRoles.includes(session.user.role as any)) {
        throw new Error("Accès non autorisé : Droits ANAH requis.")
    }

    try {
        const isApproved = action === 'approve'

        await prisma.$transaction(async (tx) => {
            // 1. Update Property Status
            const property = await tx.property.update({
                where: { id: propertyId },
                data: {
                    status: isApproved ? 'active' : 'rejected',
                    verifiedAt: isApproved ? new Date() : null,
                    verifiedByUserId: session.user.id,
                    documents: checklist as any
                }
            })

            if (isApproved) {
                // 2. Initialize PNB (Passeport Numérique du Bien)
                await tx.passport.create({
                    data: {
                        propertyId: property.id,
                        content: {
                            initialState: "verified",
                            validationChecklist: checklist,
                            activationDate: new Date().toISOString(),
                            floorPlanVerified: checklist.titleDeedVerified,
                            structuralStatus: checklist.structuralIntegrity ? "Good" : "Issues"
                        }
                    }
                })
            }
        })

        revalidatePath("/admin/properties")
        revalidatePath(`/properties/${propertyId}`)
        
        return { success: true, message: isApproved ? "Bien validé et PNB initialisé." : "Bien rejeté." }

    } catch (error) {
        console.error("Erreur validation bien:", error)
        return { error: "Erreur lors de la validation du bien." }
    }
}
