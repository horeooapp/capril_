import { prisma } from "./prisma";
import { Role } from "@prisma/client";

export const ARREARS_PHASES = {
    PHASE_1_AMIABLE: { day: 5, label: "Relance Amiable (SMS/Push)" },
    PHASE_2_FORMAL: { day: 15, label: "Mise en Demeure (Email/SMS)" },
    PHASE_3_MAPOSTE: { day: 30, label: "Mise en Demeure (MaPoste)" },
    PHASE_4_SUSPENSION: { day: 45, label: "Suspension Administrative" },
    PHASE_5_BAILIFF: { day: 60, label: "Commandement de Payer (Huissier)" },
    PHASE_6_LITIGATION: { day: 75, label: "Assignation en Justice" },
    PHASE_7_JUDGMENT: { day: 90, label: "Obtention du Titre Exécutoire" },
    PHASE_8_EVICTION_NOTICE: { day: 105, label: "Commandement de Quitter les Lieux" },
    PHASE_9_FORCE_REQUEST: { day: 120, label: "Requête de Force Publique" },
    PHASE_10_EVICTION: { day: 135, label: "Expulsion Effective" }
};

/**
 * Part 11.1: Calculate Current Procedural Phase
 */
export async function getLeaseProceduralState(leaseId: string) {
    const lastPhase = await prisma.procedurePhase.findFirst({
        where: { leaseId },
        orderBy: { actionDate: 'desc' }
    });

    const unpaidReceipts = await prisma.receipt.findMany({
        where: { leaseId, status: 'pending' },
        orderBy: { periodMonth: 'asc' }
    });

    if (unpaidReceipts.length === 0) return { active: false, currentPhase: null };

    // Use the earliest unpaid month to determine delay
    const earliestMonth = unpaidReceipts[0].periodMonth; // YYYY-MM
    const [year, month] = earliestMonth.split('-').map(Number);
    const dueDate = new Date(year, month - 1, 5); // Assuming 5th of the month
    const today = new Date();
    const delayDays = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

    return {
        active: true,
        delayDays,
        lastPhase: lastPhase?.phase || null,
        unpaidCount: unpaidReceipts.length
    };
}

/**
 * Part 11.2: Execute Phase Transition
 */
export async function transitionArrearsPhase(leaseId: string, targetPhase: string) {
    return await prisma.$transaction(async (tx) => {
        const phase = await tx.procedurePhase.create({
            data: {
                leaseId,
                phase: targetPhase,
                actionDate: new Date(),
                metadata: { automated: true, timestamp: Date.now() }
            }
        });

        // Impact reliability score (logic to be implemented in Part 13)
        // For now, we log the intent
        console.log(`[ArrearsEngine] Lease ${leaseId} transitioned to ${targetPhase}`);

        return phase;
    });
}
