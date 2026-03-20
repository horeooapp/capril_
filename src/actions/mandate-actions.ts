"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { generateMandateRef, validateCommission, MANDATE_TYPES } from "@/lib/mandates"
import { Role, MandateType, MandateStatus } from "@prisma/client"

export type CreateMandateInput = {
    propertyId: string;
    agentId: string;
    mandateType: MandateType;
    commissionPct: number;
    startDate: string;
    endDate: string;
};

/**
 * Part 12.4: Create a New Mandate
 */
export async function createMandate(input: CreateMandateInput) {
    try {
        const session = await auth();
        if (!session || !session.user || (session.user.role !== 'ADMIN' && session.user.role !== 'AGENCY')) {
            return { error: "Action réservée aux agences ou administrateurs." };
        }

        if (!validateCommission(input.commissionPct)) {
            return { error: "La commission ne peut excéder 15%." };
        }

        const mandateRef = await generateMandateRef(input.agentId);
        
        const mandate = await prisma.mandate.create({
            data: {
                mandateRef,
                propertyId: input.propertyId,
                agentUserId: input.agentId,
                mandateType: input.mandateType,
                commissionPct: input.commissionPct,
                startDate: new Date(input.startDate),
                endDate: new Date(input.endDate),
                status: MandateStatus.DRAFT
            }
        });

        revalidatePath(`/dashboard/mandates`);
        return { success: true, mandateId: mandate.id, mandateRef };

    } catch (error: unknown) {
        console.error("Erreur création mandat:", error);
        return { error: "Impossible de créer le mandat." };
    }
}

/**
 * Part 12.5: Sign Mandate (Simulation via SMS/2FA)
 */
export async function signMandate(mandateId: string) {
    try {
        const session = await auth();
        if (!session) return { error: "Non authentifié." };

        const mandate = await prisma.mandate.update({
            where: { id: mandateId },
            data: {
                status: MandateStatus.ACTIVE,
                signedAt: new Date(),
            }
        });

        // Proactively activate property if linked
        await prisma.property.update({
            where: { id: mandate.propertyId },
            data: { status: 'AVAILABLE' }
        });

        revalidatePath(`/dashboard/mandates/${mandateId}`);
        return { success: true };
    } catch (error) {
        return { error: "Échec de la signature du mandat." };
    }
}

/**
 * Part 12.6: Revenue Forecast for Agency
 */
export async function getAgencyRevenueForecast(agentId: string) {
    const mandates = await prisma.mandate.findMany({
        where: { agentUserId: agentId, status: MandateStatus.ACTIVE },
        include: {
            leases: {
                where: { status: 'ACTIVE' }
            }
        }
    });

    let totalProjected = 0;

    for (const mandate of mandates) {
        for (const lease of mandate.leases) {
            // Projected monthly commission
            const monthlyComm = (lease.rentAmount * Number(mandate.commissionPct)) / 100;
            totalProjected += monthlyComm;
        }
    }

    return { totalProjected, mandateCount: mandates.length };
}
