import { prisma } from "./prisma";

export const ARREARS_PHASE_CONFIG = {
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
        where: { leaseId, status: 'PENDING' },
        orderBy: { periodMonth: 'asc' }
    });

    if (unpaidReceipts.length === 0) {
        return { 
            active: false, 
            delayDays: 0, 
            lastPhase: null, 
            unpaidCount: 0 
        };
    }

    // Use the earliest unpaid month to determine delay
    const earliestMonth = unpaidReceipts[0].periodMonth || ""; // YYYY-MM
    let delayDays = 0;
    if (earliestMonth.includes('-')) {
        const [year, month] = earliestMonth.split('-').map(Number);
        const dueDate = new Date(year, month - 1, 5); // Assuming 5th of the month
        const today = new Date();
        delayDays = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    }

    return {
        active: true,
        delayDays,
        lastPhase: lastPhase?.name || null,
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
                name: targetPhase,
                phaseNumber: 1, // Default or calculated
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

/**
 * [ESC-01] Discover unpaid rents and trigger J3/J7/J15 escalations
 */
export async function discoverAndEscalateArrears() {
    const now = new Date();
    const currentDay = now.getDate();
    
    // 1. Get all pending or partial syntheses for current or past months
    const pendingSyntheses = await prisma.monthlyRentSynthesis.findMany({
        where: {
            status: { in: ["EN_ATTENTE", "PARTIAL", "IMPAYE"] }
        },
        include: {
            lease: {
                include: { tenant: true }
            }
        }
    });

    let escalations = 0;

    for (const synthesis of pendingSyntheses) {
        const lease = synthesis.lease;
        if (!lease.tenantId || !lease.tenant) continue;

        // Calculate delay based on synthesis month and lease.paymentDay
        const [year, month] = synthesis.month.split('-').map(Number);
        const dueDate = new Date(year, month - 1, lease.paymentDay || 5);
        const delayDays = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

        if (delayDays <= 0) continue;

        // Escalation Logic
        const { NotificationService } = await import("./notification-service");

        // J3: Soft Reminder
        if (delayDays === 3 && lease.seuilJ3) {
            await NotificationService.envoyerNotification(lease.tenantId, "IMPAYE_J3", {
                payload: {
                    smsText: `[QAPRIL] Rappel amical : Votre loyer de ${synthesis.month} est en attente (J+3). Merci de régulariser.`,
                    parameters: [lease.tenant.firstName || "Locataire", synthesis.month]
                }
            });
            escalations++;
        }

        // J7: Firm Reminder + State Update
        if (delayDays === 7 && lease.seuilJ7) {
            await prisma.monthlyRentSynthesis.update({
                where: { id: synthesis.id },
                data: { status: "IMPAYE" }
            });
            await NotificationService.envoyerNotification(lease.tenantId, "IMPAYE_J7", {
                payload: {
                    smsText: `[QAPRIL] Alerte retard : Votre loyer de ${synthesis.month} n'a pas été reçu (J+7). Des pénalités peuvent s'appliquer.`,
                    parameters: [lease.tenant.firstName || "Locataire", synthesis.month]
                }
            });
            escalations++;
        }

        // J15: Procedural Escalation
        if (delayDays === 15 && lease.seuilJ15) {
            await transitionArrearsPhase(lease.id, "MISE_EN_DEMEURE");
            await prisma.lease.update({
                where: { id: lease.id },
                data: { status: "MISE_EN_DEMEURE" }
            });
            await NotificationService.envoyerNotification(lease.tenantId, "IMPAYE_J15", {
                payload: {
                    smsText: `[QAPRIL] Mise en demeure : Défaut de paiement constaté (J+15). Votre dossier est transmis au service contentieux.`,
                    parameters: [lease.tenant.firstName || "Locataire", synthesis.month]
                }
            });
            escalations++;
        }
    }

    return escalations;
}
