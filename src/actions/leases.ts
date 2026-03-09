"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { generateLeaseRef } from "@/lib/lease"
import { revalidatePath } from "next/cache"
import { Role } from "@prisma/client"

/**
 * Helper to serialize BigInt
 */
const serializeLease = (lease: any) => ({
    ...lease,
    rentAmount: lease.rentAmount?.toString(),
    depositAmount: lease.depositAmount?.toString(),
    chargesAmount: lease.chargesAmount?.toString(),
})

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
        if (isPro && (landlord as any).kycLevel < 4) {
            throw new Error("Votre entité légale doit être vérifiée (Niveau 4).")
        }
        if (!isPro && (landlord as any).kycLevel < 2) {
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
                commercialData: data.commercialData as any,
                status: 'draft' 
            }
        })

        revalidatePath("/dashboard/leases")
        return { success: true, leaseId: lease.id, leaseReference: lease.leaseReference }

    } catch (error: any) {
        console.error("Erreur création bail:", error)
        return { error: error.message || "Impossible de créer le bail." }
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
            tenant: { select: { fullName: true, phone: true } }
        }
    })

    if (!lease) return null
    return serializeLease(lease)
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
    const session = await auth()
    if (!session || !session.user || !session.user.id) {
        return { error: "Non autorisé" }
    }

    try {
        const lease = await prisma.lease.findUnique({
            where: { id: leaseId },
            include: { tenant: true }
        })

        if (!lease || !lease.tenant?.phone) {
            return { error: "Locataire ou numéro de téléphone introuvable." }
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Save to DB (reusing a simple field or a dedicated table)
        // For v3.0, we'll store it in a temporary meta field in commercialData or a dedicated OTP table
        // Let's check if we have an OTP table or if we should add one. 
        // For now, let's use a simple system_config or a dedicated table if exists.
        // Actually, let's use the 'webhook_events' payload as a temporary store or just log it for the simulator.
        console.log(`[SIGNATURE_OTP] Le OTP pour le bail ${lease.leaseReference} est: ${otp}`);
        
        const { sendSMS } = await import("@/lib/sms");
        await sendSMS(lease.tenant.phone, `Votre code de signature QAPRIL est: ${otp}`);

        // Store OTP in commercialData (encrypted/hashed in prod, clear for demo)
        await prisma.lease.update({
            where: { id: leaseId },
            data: {
                commercialData: {
                    ...(lease.commercialData as any || {}),
                    pendingSignatureOTP: otp,
                    otpGeneratedAt: new Date()
                }
            }
        })

        return { success: true }
    } catch (error) {
        return { error: "Échec de l'envoi de l'OTP." }
    }
}

/**
 * Part 14: Sign Lease with 2FA OTP
 */
export async function signLease(leaseId: string, otp: string) {
    const session = await auth()
    if (!session || !session.user || !session.user.id) {
        return { error: "Non autorisé" }
    }

    try {
        const lease = await prisma.lease.findUnique({
            where: { id: leaseId }
        })

        if (!lease) return { error: "Bail introuvable." }
        
        const commData = (lease.commercialData as any) || {}
        if (commData.pendingSignatureOTP !== otp) {
            return { error: "Code OTP invalide." }
        }

        // OTP Valid, sign lease
        await prisma.lease.update({
            where: { id: leaseId },
            data: { 
                status: 'active',
                signedAt: new Date(),
                commercialData: {
                    ...commData,
                    pendingSignatureOTP: null, // Clear OTP
                    signatureVerifiedAt: new Date()
                }
            }
        })

        const { writeAuditLog } = await import("@/lib/audit");
        await writeAuditLog({
            userId: session.user.id,
            action: "LEASE_SIGNED_2FA",
            module: "LEASE",
            entityId: leaseId
        });

        revalidatePath("/dashboard/leases")
        revalidatePath(`/dashboard/leases/${leaseId}`)
        return { success: true }
    } catch (error) {
        console.error("Sign error:", error);
        return { error: "Échec de la signature." }
    }
}

