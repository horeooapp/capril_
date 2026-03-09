"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getLeaseProceduralState, transitionArrearsPhase, ARREARS_PHASES } from "@/lib/arrears-engine"
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
        if (state.delayDays >= ARREARS_PHASES.PHASE_1_AMIABLE.day && state.lastPhase === null) {
            phaseToTrigger = "PHASE_1_AMIABLE";
        } else if (state.delayDays >= ARREARS_PHASES.PHASE_2_FORMAL.day && state.lastPhase === "PHASE_1_AMIABLE") {
            phaseToTrigger = "PHASE_2_FORMAL";
        } else if (state.delayDays >= ARREARS_PHASES.PHASE_3_MAPOSTE.day && state.lastPhase === "PHASE_2_FORMAL") {
            phaseToTrigger = "PHASE_3_MAPOSTE";
        }
        // ... Higher phases would typically require manual validation or specific triggers

        if (phaseToTrigger) {
            await transitionArrearsPhase(leaseId, phaseToTrigger);
            revalidatePath(`/dashboard/leases/${leaseId}`);
            return { success: true, newPhase: phaseToTrigger };
        }

        return { success: true, message: "En attente de la prochaine échéance procédurale." };

    } catch (error: any) {
        console.error("Erreur de scan impayés:", error);
        return { error: "Impossible d'exécuter la procédure de recouvrement." };
    }
}

/**
 * Part 11.4: Reset Procedure (On Full Payment)
 */
export async function resetLeaseProcedure(leaseId: string) {
    const session = await auth();
    if (!session || !session.user || (session.user.role as Role) !== Role.ADMIN) {
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
