"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { generateLeaseRef } from "@/lib/lease"
import { revalidatePath } from "next/cache"
import { Role } from "@prisma/client"

import { serializeLease } from "@/lib/serialize"
import { Prisma } from "@prisma/client"

interface CommercialData {
    indexationType: 'fixed' | 'ipc';
    indexationPeriod: number;
    activityType: string;
    indexationPercentage?: number;
    pendingSignatureOTP?: string | null;
    otpGeneratedAt?: Date | string | null;
    signatureVerifiedAt?: Date | string | null;
    [key: string]: any;
}

/**
 * Part 8.1: Create Lease (Residential or Commercial OHADA)
 */
export async function createLease(data: {
    propertyId: string,
    leaseType: 'residential' | 'commercial',
    tenantPhone?: string, // Optional if tenantEntityId is provided
    tenantEntityId?: string, // For corporate tenants (Commercial)
    startDate: Date,
    rentAmount: number,
    chargesAmount?: number,
    depositAmount?: number,
    durationMonths: number,
    commercialData?: {
        indexationType: 'fixed' | 'ipc',
        indexationPeriod: number, // months
        activityType: string,
        indexationPercentage?: number
    }
}) {
    const session = await auth()
    if (!session || !session.user || !session.user.id) {
        throw new Error("Authentification requise.")
    }

    try {
        // 1. Verify Landlord KYC Status (Level 2 min, Level 4 if Pro)
        const landlord = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { kycLevel: true, role: true }
        })

        if (!landlord) throw new Error("Profil introuvable.")
        
        const isPro = ([Role.AGENCY, Role.LANDLORD_PRO] as Role[]).includes(landlord.role as Role)
        if (isPro && landlord.kycLevel < 4) {
            throw new Error("Votre entité légale doit être vérifiée (Niveau 4).")
        }
        if (!isPro && landlord.kycLevel < 2) {
            throw new Error("Votre identité doit être vérifiée (Niveau 2).")
        }

        // 2. Identify Tenant
        let tenantId: string | undefined = undefined;
        if (data.tenantPhone) {
            let tenant = await prisma.user.findUnique({ where: { phone: data.tenantPhone } })
            if (!tenant) {
                tenant = await prisma.user.create({
                    data: { phone: data.tenantPhone, role: Role.TENANT, status: 'pending' }
                })
            }
            tenantId = tenant.id;
        }

        // 3. Generate Reference with new prefix system
        const leaseReference = await generateLeaseRef(data.leaseType);

        // 4. Create Lease (OHADA: 24 months min is a common best practice for stability)
        const finalDuration = data.leaseType === 'commercial' ? Math.max(data.durationMonths, 24) : data.durationMonths;

        const lease = await prisma.lease.create({
            data: {
                leaseReference,
                leaseType: data.leaseType,
                propertyId: data.propertyId,
                landlordId: session.user.id,
                tenantId,
                tenantEntityId: data.tenantEntityId,
                startDate: data.startDate,
                durationMonths: finalDuration,
                rentAmount: data.rentAmount,
                chargesAmount: data.chargesAmount || 0,
                depositAmount: data.depositAmount || 0,
                commercialData: data.commercialData as Prisma.InputJsonValue,
                status: 'DRAFT' 
            }
        })

        revalidatePath("/dashboard/leases")
        return { success: true, leaseId: lease.id, leaseReference: lease.leaseReference }

    } catch (error: unknown) {
        console.error("Erreur création bail:", error)
        const message = error instanceof Error ? error.message : "Impossible de créer le bail."
        return { error: message }
    }
}

/**
 * Part 6: Get Lease Details
 */
export async function getLeaseById(id: string) {
    const lease = await prisma.lease.findUnique({
        where: { id },
        include: {
            property: true,
            landlord: { select: { fullName: true, phone: true } },
            tenant: { select: { id: true, fullName: true, phone: true, email: true, reliabilityScores: { take: 1, orderBy: { createdAt: 'desc' } } } },
            procedurePhases: true,
            repaymentPlans: {
                orderBy: { createdAt: 'desc' },
                take: 1
            },
            mediation: {
                include: { messages: true }
            },
            cdcDeposits: true, // plural in schema
            insurance: true,
            inspections: {
                orderBy: { date: 'desc' },
                include: { rooms: true }
            },
            reminders: {
                orderBy: { sentAt: 'desc' }
            }
        }
    })

    if (!lease) return null
    return serializeLease(lease)
}

/**
 * Part 14.1: Get Leases for the logged-in Tenant
 */
export async function getTenantLeases() {
    const session = await auth()
    if (!session || !session.user || !session.user.id) {
        return []
    }

    const leases = await prisma.lease.findMany({
        where: { tenantId: session.user.id },
        include: {
            property: true,
            receipts: {
                orderBy: { periodMonth: 'desc' },
                take: 3
            }
        },
        orderBy: { startDate: 'desc' }
    })

    return leases.map(serializeLease)
}

/**
 * Part 13.2: Trigger Rent Indexation Review
 */
export async function triggerIndexation(leaseId: string) {
    const session = await auth()
    if (!session || !session.user || !session.user.id) {
        return { error: "Non autorisé" }
    }

    try {
        const { applyLeaseIndexation } = await import("@/lib/indexation");
        const result = await applyLeaseIndexation(leaseId);
        
        if (result.success) {
            revalidatePath(`/dashboard/leases/${leaseId}`)
            return { success: true, data: result }
        } else {
            return { error: result.error }
        }
    } catch (error) {
        return { error: "Échec de l'indexation." }
    }
}

/**
 * Part 14: Request Signature OTP (2FA)
 */
export async function requestSignatureOTP(leaseId: string) {
    const { initiateLeaseSignature } = await import("./signature");
    return initiateLeaseSignature(leaseId);
}

/**
 * Part 14: Sign Lease with 2FA OTP
 * @deprecated Use verifyLeaseSignature from signature.ts directly for client-side capture
 */
export async function signLease(leaseId: string, otp: string) {
    const { verifyLeaseSignature } = await import("./signature");
    return verifyLeaseSignature(leaseId, otp, "REMOTE", "SERVER_ACTION_FALLBACK");
}

