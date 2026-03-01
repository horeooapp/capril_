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
            escrow: true,
            receipts: {
                orderBy: { periodEnd: 'desc' },
                take: 1
            }
        }
    })

    if (!lease) throw new Error("Bail introuvable")

    // Authorization: Tenant, Owner, or Manager
    const userId = session.user.id
    if (lease.tenantId !== userId && lease.property.ownerId !== userId && lease.property.managerId !== userId) {
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
            name: lease.tenant.name,
            email: lease.tenant.email
        },
        property: {
            name: lease.property.name,
            address: lease.property.address,
            city: lease.property.city
        },
        status: {
            isCertified: !!lease.tenant.isCertified,
            lastReceiptDate: lease.receipts[0]?.periodEnd || null,
            escrowStatus: lease.escrow?.status || null
        },
        verificationHash
    }
}
