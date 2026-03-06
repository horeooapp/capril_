"use server"

import { LeaseStatus } from "@prisma/client"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { validateLeaseFinancials } from "@/lib/validation"
import { logAction } from "./audit"
import { enforceAgentActive } from "@/lib/agents"
import { createEscrow } from "./escrow"
import { createNotification } from "./notifications"

export async function createLease(data: {
    propertyId: string,
    tenantEmail: string,
    tenantName: string,
    startDate: Date,
    rentAmount: number,
    charges?: number,
    deposit?: number,
    advancePayment?: number,
    agencyFee?: number
}) {
    const session = await auth()

    // @ts-ignore
    const userId = session?.user?.id

    if (!userId) {
        throw new Error("Unauthorized")
    }

    // Enforce QAPRIL Regularization for Agents
    await enforceAgentActive()

    // 1. Financial Validation (QAPRIL Regulation)
    const validation = validateLeaseFinancials({
        rentAmount: data.rentAmount,
        deposit: data.deposit,
        advancePayment: data.advancePayment,
        agencyFee: data.agencyFee
    })

    if (!validation.isValid) {
        throw new Error(`Règlementation QAPRIL: ${validation.errors.join(" ")}`)
    }

    // Verify property ownership or management
    const property = await prisma.property.findUnique({
        where: { id: data.propertyId }
    })

    if (!property || (property.ownerId !== userId && property.managerId !== userId)) {
        throw new Error("Unauthorized to manage this property")
    }

    // Find or create tenant user account placeholder
    let tenant = await prisma.user.findUnique({
        where: { email: data.tenantEmail }
    })

    if (!tenant) {
        tenant = await prisma.user.create({
            data: {
                email: data.tenantEmail,
                name: data.tenantName,
                role: "TENANT"
            }
        })
    }

    // Create the lease
    const lease = await prisma.lease.create({
        // @ts-ignore
        data: {
            propertyId: data.propertyId,
            tenantId: tenant.id,
            startDate: data.startDate,
            rentAmount: data.rentAmount,
            charges: data.charges || 0,
            deposit: data.deposit,
            advancePayment: data.advancePayment || 0,
            agencyFee: data.agencyFee || 0,
            status: "ACTIVE"
        }
    })

    // Create Digital Escrow if deposit exists
    if (data.deposit && data.deposit > 0) {
        await createEscrow(lease.id, data.deposit)
    }

    // 2. Audit Logging
    await logAction({
        action: "CREATE_LEASE",
        entityType: "LEASE",
        entityId: lease.id,
        details: {
            rentAmount: data.rentAmount,
            tenantEmail: data.tenantEmail
        }
    })

    return lease
}

export async function getLeaseById(id: string) {
    const session = await auth()
    if (!session?.user) throw new Error("Unauthorized")

    return await prisma.lease.findUnique({
        where: { id },
        // @ts-ignore
        include: {
            property: true,
            tenant: true,
            escrow: true,
            insurance: { include: { claims: true } },
            cdcDeposit: true,
            mediation: { include: { messages: true } },
            procedurePhases: { orderBy: { createdAt: 'asc' } },
            repaymentPlans: { orderBy: { createdAt: 'desc' }, take: 1 }
        }
    })
}

export async function getLeasesByProperty(propertyId: string) {
    return await prisma.lease.findMany({
        where: { propertyId },
        include: {
            tenant: { select: { name: true, email: true, phone: true } },
            receipts: {
                orderBy: { paymentDate: 'desc' },
                take: 5 // get recent receipts
            }
        }
    })
}

export async function registerLease(formData: FormData) {
    const session = await auth()
    if (!session || !session.user || !session.user.id) {
        return { error: "Non autorisé" }
    }
    
    const landlordId = session.user.id

    try {
        // --- 1. Extraction: Identification des parties ---
        const tenantType = formData.get("tenantType") as any
        const tenantName = formData.get("tenantName") as string
        const tenantEmail = formData.get("tenantEmail") as string
        const tenantCni = formData.get("tenantCni") as string
        const tenantPhone = formData.get("tenantPhone") as string
        const tenantNationality = formData.get("tenantNationality") as string
        const tenantProfession = formData.get("tenantProfession") as string

        // Find or create tenant
        let tenant = await prisma.user.findUnique({ where: { email: tenantEmail } })
        if (!tenant) {
            tenant = await prisma.user.create({
                data: {
                    email: tenantEmail,
                    name: tenantName,
                    userType: tenantType || "PERSON",
                    cniNumber: tenantCni,
                    phone: tenantPhone,
                    nationality: tenantNationality,
                    profession: tenantProfession,
                    role: "TENANT"
                }
            })
        } else {
             await prisma.user.update({
                 where: { id: tenant.id },
                 data: {
                     cniNumber: tenant.cniNumber || tenantCni,
                     nationality: tenant.nationality || tenantNationality,
                     profession: tenant.profession || tenantProfession,
                     userType: tenantType || tenant.userType
                 }
             })
        }

        // --- 2. Extraction: Désignation du logement ---
        const existingPropertyId = formData.get("propertyId") as string
        let propertyId = existingPropertyId

        if (!existingPropertyId || existingPropertyId === "NEW") {
            const propType = formData.get("propertyType") as string
            const propAddress = formData.get("propertyAddress") as string
            const propCity = formData.get("propertyCity") as string
            const propCommune = formData.get("propertyCommune") as string
            const propLot = formData.get("propertyLot") as string
            const propRooms = parseInt(formData.get("propertyRooms") as string || "1")
            
            const newProp = await prisma.property.create({
                data: {
                    type: propType || "APARTMENT",
                    address: propAddress,
                    city: propCity,
                    neighborhood: propCommune,
                    lotNumber: propLot,
                    ownerId: landlordId,
                }
            })
            propertyId = newProp.id
        }

        // --- 3. Extraction: Durée du bail ---
        const startDate = new Date(formData.get("startDate") as string)
        const rawEndDate = formData.get("endDate") as string
        const endDate = rawEndDate ? new Date(rawEndDate) : null
        const renewalMode = formData.get("renewalMode") as string

        // --- 4. Extraction: Loyer, Caution et Avances ---
        const rentAmount = parseFloat(formData.get("rentAmount") as string)
        const paymentDueDate = parseInt(formData.get("paymentDueDate") as string || "5")
        
        const deposit = parseFloat(formData.get("deposit") as string || "0")
        const advancePayment = parseFloat(formData.get("advancePayment") as string || "0")
        const agencyFee = parseFloat(formData.get("agencyFee") as string || "0")
        const charges = parseFloat(formData.get("charges") as string || "0")

        // === VÉRIFICATION STRATÉGIQUE DES PLAFONDS LÉGAUX ===
        let legalPlafonningMet = true;
        if (deposit > rentAmount * 2) legalPlafonningMet = false;
        if (advancePayment > rentAmount * 2) legalPlafonningMet = false;
        if (agencyFee > rentAmount * 1) legalPlafonningMet = false;

        // Validation bloquante optionnelle
        // if (!legalPlafonningMet) {
        //     return { error: `Plafonds légaux dépassés. (Caution max: 2 mois, Avance max: 2 mois, Agence max: 1 mois).` }
        // }

        // --- 5. Extraction: Informations du contrat physique ---
        const officialLeaseNumber = formData.get("officialLeaseNumber") as string || undefined
        const scanUrl = formData.get("scanUrl") as string || null

        // --- 6. Création Finale du Bail ---
        const lease = await prisma.lease.create({
            data: {
                propertyId,
                tenantId: tenant.id,
                startDate,
                endDate,
                renewalMode,
                rentAmount,
                paymentDueDate,
                charges,
                deposit,
                advancePayment,
                agencyFee,
                legalPlafonningMet,
                officialLeaseNumber,
                scanUrl,
                status: "PENDING"
            }
        })

        // --- 7. Notification au Locataire ---
        await createNotification({
            userId: tenant.id,
            title: "Nouveau bail à signer",
            message: `Un nouveau contrat de bail pour le bien "${lease.propertyId}" a été déposé par votre propriétaire. Veuillez le consulter et le signer.`,
            type: "WARNING",
            link: `/dashboard/leases/${lease.id}/signature`
        })

        // --- 8. Revalidation UI Cache
        const { revalidatePath } = await import("next/cache")
        revalidatePath("/dashboard/leases")
        revalidatePath("/dashboard/properties")

        return { success: true, leaseId: lease.id, legalPlafonningMet }
    } catch (error: any) {
        console.error("[SERVER ACTION] Error registering lease:", error)
        if (error.code === 'P2002' && error.meta?.target?.includes('officialLeaseNumber')) {
            return { error: "Ce numéro officiel de bail a déjà été enregistré." }
        }
        return { error: error.message || "Erreur inconnue lors de l'enregistrement du bail" }
    }
}

export async function getTenantLeases() {
    const session = await auth()
    // @ts-ignore
    const userId = session?.user?.id
    if (!userId) throw new Error("Unauthorized")

    return await prisma.lease.findMany({
        where: { tenantId: userId },
        include: {
            property: true,
            receipts: {
                orderBy: { paymentDate: 'desc' },
                take: 3
            },
            escrow: true
        },
        orderBy: { startDate: 'desc' }
    })
}

export async function signLease(leaseId: string, signature: string) {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) throw new Error("Non autorisé")

    const lease = await prisma.lease.findUnique({
        where: { id: leaseId },
        include: { property: true, tenant: true }
    })

    if (!lease) throw new Error("Bail introuvable")

    const isTenant = lease.tenantId === userId
    const isOwner = lease.property.ownerId === userId

    if (!isTenant && !isOwner) throw new Error("Accès non autorisé pour signer ce bail")

    const updateData: any = {
        signedAt: new Date(),
    }

    if (isTenant) {
        updateData.tenantSignature = signature
    } else {
        updateData.ownerSignature = signature
    }

    // Mise à jour de la signature spécifique
    const updatedLease = await prisma.lease.update({
        where: { id: leaseId },
        data: updateData
    })

    // Si les deux signatures sont présentes, le bail devient ACTIVE
    if (updatedLease.tenantSignature && updatedLease.ownerSignature) {
        await prisma.lease.update({
            where: { id: leaseId },
            data: { status: "ACTIVE" }
        })

        // Notifier l'autre partie de la signature finale
        const targetUserId = isTenant ? lease.property.ownerId : lease.tenantId
        await createNotification({
            userId: targetUserId,
            title: "Bail Actif 📄",
            message: `Le bail pour le bien "${lease.property.address}" est désormais actif suite à la signature des deux parties.`,
            type: "SUCCESS",
            link: `/dashboard/leases/${leaseId}`
        })
    } else {
        // Notifier l'autre partie qu'une signature a été apposée
        const targetUserId = isTenant ? lease.property.ownerId : lease.tenantId
        await createNotification({
            userId: targetUserId,
            title: "Contrat Signé ✍️",
            message: `Le ${isTenant ? 'locataire' : 'propriétaire'} a signé le contrat de bail. Votre signature est requise pour finaliser.`,
            type: "INFO",
            link: `/dashboard/leases/${leaseId}/signature`
        })
    }

    const { revalidatePath } = await import("next/cache")
    revalidatePath(`/dashboard/leases/${leaseId}`)
    revalidatePath("/dashboard/leases")
    return { success: true }
}
