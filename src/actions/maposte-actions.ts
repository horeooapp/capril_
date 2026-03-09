"use server"

import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { createMaPosteDispatch, DELIVERY_STATUSES } from "@/lib/maposte"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"

/**
 * Part 19.6: Request Official Digital Delivery (Mise en Demeure)
 * Auto-creates a CI-POST dispatch linked to a procedure phase.
 */
export async function dispatchMiseEnDemeure(leaseId: string, phaseId: string) {
    const session = await auth();
    const authorizedRoles: Role[] = [Role.ADMIN, Role.ANAH_AGENT, Role.AGENCY];

    if (!session?.user || !authorizedRoles.includes(session.user.role as Role)) {
        throw new Error("Action réservée aux agents ou administrations.");
    }

    try {
        const lease = await prisma.lease.findUnique({
            where: { id: leaseId },
            include: { tenant: true, landlord: true }
        });

        if (!lease) throw new Error("Bail introuvable.");

        const delivery = await createMaPosteDispatch({
            recipientData: {
                name: `${lease.tenant.firstName} ${lease.tenant.lastName}`,
                phone: lease.tenant.phoneNumber,
                leaseRef: lease.leaseReference,
                phaseId
            },
            deliveryMode: "maposte_number",
            docType: "MD"
        });

        // Link tracking number to procedure phase metadata
        await prisma.procedurePhase.update({
            where: { id: phaseId },
            data: {
                metadata: {
                    automated: true,
                    maposteTracking: delivery.trackingNumber,
                    dispatchedAt: new Date().toISOString()
                }
            }
        });

        revalidatePath(`/dashboard/leases/${leaseId}`);
        return { success: true, trackingNumber: delivery.trackingNumber };

    } catch (error: any) {
        console.error("Erreur dispatch MaPoste:", error);
        return { error: error.message || "Échec de l'envoi MaPoste." };
    }
}

/**
 * Part 19.7: Get Delivery Status
 */
export async function getDeliveryStatus(trackingNumber: string) {
    return await prisma.digitalDelivery.findUnique({
        where: { trackingNumber },
        select: {
            trackingNumber: true,
            status: true,
            deliveredAt: true,
            recipientData: true
        }
    });
}
