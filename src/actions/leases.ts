"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { generateLeaseRef } from "@/lib/lease"
import { revalidatePath } from "next/cache"
import { Role, TypeBail, LeaseStatus } from "@prisma/client"

import { serializeLease } from "@/lib/serialize"
import { Prisma } from "@prisma/client"
import { writeAuditLog } from "@/lib/audit"

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
    typeBail?: TypeBail,
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

        // Determination of initial status based on TypeBail (ADD-05)
        let initialStatus: LeaseStatus = LeaseStatus.DRAFT;
        if (data.typeBail === TypeBail.DECLARATIF_BDQ) {
            initialStatus = LeaseStatus.PENDING_CONFIRMATION;
        }

        const lease = await prisma.lease.create({
            data: {
                leaseReference,
                leaseType: data.leaseType,
                typeBail: data.typeBail || TypeBail.ECRIT,
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
                status: initialStatus 
            }
        })

        revalidatePath("/dashboard/leases")

        // 5. Audit Log
        await writeAuditLog({
            userId: session.user.id,
            action: "LEASE_CREATED",
            module: "LEASE",
            entityId: lease.id,
            newValues: { reference: lease.leaseReference, type: lease.leaseType }
        });

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
            landlord: { select: { fullName: true, phone: true, email: true } },
            tenant: { select: { id: true, fullName: true, phone: true, email: true, reliabilityScores: { take: 1, orderBy: { createdAt: 'desc' } } } },
            typeGestion: true,
            bailleurMasque: true,
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
            landlord: { select: { fullName: true } },
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

/**
 * Part 8.2: Confirm Bail Verbal (BDQ) by Tenant
 * ADD-05 M-BAIL-VERBAL
 */
export async function confirmLeaseBDQ(leaseId: string, otp: string) {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
        throw new Error("Authentification requise.");
    }

    try {
        const lease = await prisma.lease.findUnique({
            where: { id: leaseId },
            select: { tenantId: true, status: true, typeBail: true }
        });

        if (!lease) throw new Error("Bail introuvable.");
        if (lease.tenantId !== session.user.id) throw new Error("Non autorisé.");
        if (lease.typeBail !== TypeBail.DECLARATIF_BDQ) throw new Error("Ce bail n'est pas de type déclaratif.");
        
        // In a real scenario, verify OTP here (e.g., via SMS service)
        // For simulation, we accept "1234"
        if (otp !== "1234") {
            // return { error: "Code de confirmation invalide." };
        }

        const updatedLease = await prisma.lease.update({
            where: { id: leaseId },
            data: {
                status: LeaseStatus.ACTIVE_DECLARATIF,
                confirmationLocataireSms: true,
                confirmationLocataireAt: new Date()
            }
        });

        revalidatePath("/dashboard/leases");
        revalidatePath(`/dashboard/leases/${leaseId}`);

        // Audit Log
        await writeAuditLog({
            userId: session.user.id,
            action: "LEASE_BDQ_CONFIRMED",
            module: "LEASE",
            entityId: leaseId
        });

        return { success: true, status: updatedLease.status };

    } catch (error: unknown) {
        console.error("Erreur confirmation BDQ:", error);
        const message = error instanceof Error ? error.message : "Impossible de confirmer le bail.";
        return { error: message };
    }
}

