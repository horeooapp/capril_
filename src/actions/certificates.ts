"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { generateProofHash } from "@/lib/proof"

export interface RentalCertificate {
    certificateId: string
    issueDate: Date
    tenant: {
        name: string | null
        email: string | null
    }
    property: {
        name: string | null
        address: string
        city: string
    }
    status: {
        isCertified: boolean
        lastReceiptDate: Date | null
        escrowStatus: string | null
    }
    verificationHash: string
}

/**
 * Generates a Digital Rental Certificate for a tenant on a specific lease.
 */
export async function generateRentalCertificate(leaseId: string): Promise<RentalCertificate> {
    const session = await auth()
    if (!session?.user) throw new Error("Non authentifié")

    const lease = await prisma.lease.findUnique({
        where: { id: leaseId },
        include: {
            tenant: true,
            property: true,
            cdcDeposits: true,
            receipts: {
                orderBy: { periodMonth: 'desc' },
                take: 1
            }
        }
    })

    if (!lease) throw new Error("Bail introuvable")

    // Authorization: Tenant, Owner, or Manager
    const userId = session.user.id
    if (lease.tenantId !== userId && lease.property.ownerUserId !== userId && lease.property.managedByUserId !== userId) {
        throw new Error("Accès non autorisé au certificat")
    }

    const certificateData = {
        leaseId: lease.id,
        tenantId: lease.tenantId,
        propertyId: lease.propertyId,
        timestamp: new Date().toISOString()
    }

    const verificationHash = generateProofHash(certificateData)

    return {
        certificateId: `CERT-${lease.id.substring(0, 8).toUpperCase()}`,
        issueDate: new Date(),
        tenant: {
            name: lease.tenant?.fullName || null,
            email: lease.tenant?.email || null
        },
        property: {
            name: lease.property.name || lease.property.propertyCode,
            address: lease.property.address,
            city: lease.property.city || lease.property.commune
        },
        status: {
            isCertified: !!lease.tenant?.isCertified,
            lastReceiptDate: lease.receipts[0] ? new Date(lease.receipts[0].periodMonth + "-05") : null,
            escrowStatus: (lease as any).cdcDeposits?.[0]?.status || null
        },
        verificationHash
    }
}
