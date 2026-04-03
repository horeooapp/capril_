"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Role, TypeBail, LeaseStatus } from "@prisma/client"
import { writeAuditLog } from "@/lib/audit"
import { Prisma } from "@prisma/client"

/**
 * Mettre à jour intégralement un bail avant qu'il ne soit activé/déclaré.
 */
export async function updateLeaseDraft(leaseId: string, data: {
    propertyId: string,
    leaseType: 'residential' | 'commercial',
    typeBail?: TypeBail,
    tenantPhone?: string,
    tenantEntityId?: string,
    startDate: Date,
    rentAmount: number,
    chargesAmount?: number,
    depositAmount?: number,
    durationMonths: number,
    dateLimitePaiement?: number,
    paiementAvance?: boolean,
    commercialData?: any
}) {
    const session = await auth()
    if (!session || !session.user || !session.user.id) {
        throw new Error("Authentification requise.")
    }

    try {
        const lease = await prisma.lease.findUnique({
            where: { id: leaseId },
            include: { landlord: true }
        })

        if (!lease) throw new Error("Contrat de bail introuvable.")

        // 1. Vérification Propriétaire
        if (lease.landlordId !== session.user.id && session.user.role !== Role.SUPER_ADMIN && session.user.role !== Role.ADMIN) {
            throw new Error("Vous n'êtes pas autorisé à modifier ce bail.")
        }

        // 2. Vérification du Statut (Uniquement brouillons / en attente)
        const allowedStatuses: string[] = [
            LeaseStatus.DRAFT, 
            LeaseStatus.PENDING_SIGNATURE, 
            LeaseStatus.PENDING_CONFIRMATION
        ]
        
        if (!allowedStatuses.includes(lease.status)) {
            throw new Error(`Ce bail a déjà expassé le statut modifiable (${lease.status}). Il ne peut plus être altéré sans avenant.`)
        }

        // 3. Identification/Création Locataire si téléphone fourni
        let tenantId: string | undefined = lease.tenantId || undefined;
        if (data.tenantPhone) {
            let tenant = await prisma.user.findUnique({ where: { phone: data.tenantPhone } })
            if (!tenant) {
                tenant = await prisma.user.create({
                    data: { phone: data.tenantPhone, role: Role.TENANT, status: 'pending' }
                })
            }
            tenantId = tenant.id;
        } else {
            // S'il s'agit d'une entité commerciale (sans tenantPhone direct) on peut garder à undefined
            if (!data.tenantEntityId) {
                 tenantId = undefined;
            }
        }

        // 4. Update Lease in Transaction
        const finalDuration = data.leaseType === 'commercial' ? Math.max(data.durationMonths, 24) : data.durationMonths;

        const updatedLease = await prisma.lease.update({
            where: { id: leaseId },
            data: {
                propertyId: data.propertyId,
                tenantId,
                tenantEntityId: data.tenantEntityId,
                startDate: data.startDate,
                durationMonths: finalDuration,
                rentAmount: data.rentAmount,
                chargesAmount: data.chargesAmount || 0,
                depositAmount: data.depositAmount || 0,
                typeBail: data.typeBail || lease.typeBail,
                leaseType: data.leaseType,
                commercialData: data.commercialData 
                    ? (data.commercialData as Prisma.InputJsonValue) 
                    : (lease.commercialData ? (lease.commercialData as Prisma.InputJsonValue) : Prisma.JsonNull),
                paymentDay: data.dateLimitePaiement ?? lease.paymentDay,
                paiementAvance: data.paiementAvance ?? lease.paiementAvance
            }
        })

        // 5. Audit Log (LEGAL REQUIREMENT FOR IMMUTABILITY TRACE)
        await writeAuditLog({
            userId: session.user.id,
            action: "LEASE_AMENDED_DRAFT",
            module: "LEASE",
            entityId: lease.id,
            newValues: { 
                rent: data.rentAmount, 
                deposit: data.depositAmount, 
                property: data.propertyId, 
                tenant: tenantId 
            }
        });

        // 6. Si c'est un BDQ (Bail Déclaratif), son cache ou son objet `BailDeclaratif` (si déjà généré) 
        // devrait potentiellement être updaté s'il dépendait de champs croisés.
        // Puisque le statut est "DRAFT/PENDING", la DGI n'a encore rien reçu.

        revalidatePath(`/dashboard/leases/${leaseId}`)
        revalidatePath("/dashboard/leases")

        return { success: true, leaseId: updatedLease.id }

    } catch (error: any) {
        console.error("Erreur édition bail:", error)
        return { error: error.message || "Impossible de modifier le bail." }
    }
}
