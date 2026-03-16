"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getLeaseProceduralState, transitionArrearsPhase, ARREARS_PHASE_CONFIG } from "@/lib/arrears-engine"
import { Role } from "@prisma/client"

/**
 * Part 11.3: Trigger Automated Recovery Scan for a Lease
 */
export async function scanLeaseForArrears(leaseId: string) {
    const session = await auth();
    const authorizedRoles: Role[] = [Role.ADMIN, Role.ANAH_AGENT, Role.AGENCY];

    if (!session || !session.user || !authorizedRoles.includes(session.user.role as Role)) {
        throw new Error("Action réservée aux administrateurs ou agents.");
    }

    try {
        const state = await getLeaseProceduralState(leaseId);
        if (!state.active) return { success: true, message: "Aucun impayé détecté." };

        let phaseToTrigger: string | null = null;

        // Determine which phase to trigger based on delay (Logic simple simulation)
        const delayDays = state.delayDays || 0;
        if (delayDays >= ARREARS_PHASE_CONFIG.PHASE_1_AMIABLE.day && state.lastPhase === null) {
            phaseToTrigger = "PHASE_1_AMIABLE";
        } else if (state.delayDays >= ARREARS_PHASE_CONFIG.PHASE_2_FORMAL.day && state.lastPhase === "PHASE_1_AMIABLE") {
            phaseToTrigger = "PHASE_2_FORMAL";
        } else if (state.delayDays >= ARREARS_PHASE_CONFIG.PHASE_3_MAPOSTE.day && state.lastPhase === "PHASE_2_FORMAL") {
            phaseToTrigger = "PHASE_3_MAPOSTE";
        }
        // ... Higher phases would typically require manual validation or specific triggers

        if (phaseToTrigger) {
            await transitionArrearsPhase(leaseId, phaseToTrigger);
            revalidatePath(`/dashboard/leases/${leaseId}`);
            return { success: true, newPhase: phaseToTrigger };
        }

        return { success: true, message: "En attente de la prochaine échéance procédurale." };

    } catch (error: unknown) {
        console.error("Erreur de scan impayés:", error);
        return { error: "Impossible d'exécuter la procédure de recouvrement." };
    }
}

/**
 * Part 11.4: Reset Procedure (On Full Payment)
 */
export async function resetLeaseProcedure(leaseId: string) {
    const session = await auth();
    if (!session || !session.user || session.user.role !== Role.ADMIN) {
        throw new Error("Action réservée aux administrateurs.");
    }

    try {
        await prisma.procedurePhase.deleteMany({ where: { leaseId } });
        revalidatePath(`/dashboard/leases/${leaseId}`);
        return { success: true };
    } catch (error) {
        return { error: "Échec de la réinitialisation." };
    }
}

/**
 * Part 11.5: Landlord-initiated Procedural Phase (Hybrid Automation)
 */
export async function initiateProceduralPhase(leaseId: string, phaseName: string) {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
        throw new Error("Authentification requise.");
    }

    try {
        const lease = await prisma.lease.findUnique({
            where: { id: leaseId },
            select: { id: true, landlordId: true, status: true }
        });

        if (!lease) throw new Error("Bail introuvable.");

        // Verification: Only owner (or Admin) can trigger
        const isOwner = session.user.id === lease.landlordId;
        const isAdmin = session.user.role === Role.ADMIN;
        if (!isOwner && !isAdmin) {
            throw new Error("Seul le propriétaire peut valider cette action.");
        }

        // Verify state is eligible for this phase
        const state = await getLeaseProceduralState(leaseId);
        if (!state.active) throw new Error("Aucun impayé actif pour ce bail.");

        // Execute transition
        await transitionArrearsPhase(leaseId, phaseName);

        // Update lease status if it's a critical phase
        if (phaseName === "PHASE_2_FORMAL") {
            await prisma.lease.update({
                where: { id: leaseId },
                data: { status: "MISE_EN_DEMEURE" }
            });
        }

        await logAction({
            action: "INITIALIZE_RECOVERY_PHASE",
            module: "RECOVERY",
            entityId: leaseId,
            newValues: { phase: phaseName, triggeredBy: session.user.id }
        });

        revalidatePath(`/dashboard/leases/${leaseId}`);
        return { success: true };

    } catch (error: unknown) {
        console.error("Erreur initiation phase:", error);
        const message = error instanceof Error ? error.message : "Erreur inconnue";
        return { error: message };
    }
}
