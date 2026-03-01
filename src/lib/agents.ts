"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

const REGULARIZATION_PERIOD_DAYS = 270; // 9 months approx.

export interface AgentStatus {
    isCertified: boolean;
    daysSinceRegistration: number;
    daysRemaining: number;
    isSuspended: boolean;
    alerts: string[];
}

export async function getAgentStatus(userId?: string): Promise<AgentStatus | null> {
    const session = await auth()
    const id = userId || session?.user?.id

    if (!id) return null

    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            createdAt: true,
            isCertified: true,
            role: true
        }
    })

    if (!user || (user.role !== "NON_CERTIFIED_AGENT" && user.role !== "AGENCY")) {
        return null
    }

    const registrationDate = user.createdAt;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - registrationDate.getTime());
    const daysSinceRegistration = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const daysRemaining = Math.max(0, REGULARIZATION_PERIOD_DAYS - daysSinceRegistration);
    const isSuspended = !user.isCertified && daysRemaining === 0;

    const alerts: string[] = [];
    if (!user.isCertified) {
        if (daysSinceRegistration >= 240) alerts.push("ALERTE CRITIQUE (J+240): Suspension imminente dans moins de 30 jours.");
        else if (daysSinceRegistration >= 180) alerts.push("ALERTE RÈGLEMENTAIRE (J+180): Veuillez régulariser votre situation.");
        else if (daysSinceRegistration >= 90) alerts.push("Information (J+90): Rappel de l'obligation de certification sous 9 mois.");
        else if (daysSinceRegistration >= 30) alerts.push("Bienvenue (J+30): N'oubliez pas d'initier votre processus de certification.");
    }

    return {
        isCertified: !!user.isCertified,
        daysSinceRegistration,
        daysRemaining,
        isSuspended,
        alerts
    }
}

/**
 * Middleware-like check for agent operations.
 * Throws if agent is beyond the 9-month limit and not certified.
 */
export async function enforceAgentActive() {
    const status = await getAgentStatus();
    if (status && status.isSuspended) {
        throw new Error("Action bloquée: Délai de régularisation dépassé. Veuillez affilier votre compte à une agence agréée.");
    }
}
