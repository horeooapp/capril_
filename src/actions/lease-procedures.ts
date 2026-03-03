"use server";

import { prisma } from "@/lib/prisma";
import { LeaseStatus, PlanStatus } from "@prisma/client";

/**
 * Phase 1 & 2: Détection automatique / Signalement manuel d'impayé
 * Passe le bail au statut LOYER_IMPAYE et enregistre la phase 1.
 */
export async function declareUnpaidRent(leaseId: string, userId: string) {
    try {
        const lease = await prisma.lease.update({
            where: { id: leaseId },
            data: { status: LeaseStatus.LOYER_IMPAYE },
        });

        await prisma.procedurePhase.create({
            data: {
                leaseId,
                phaseNumber: 1,
                name: "Détection impayé & Délai de grâce",
                description: "L'impayé a été signalé et le délai de grâce contractuel débute.",
            },
        });

        await prisma.auditLog.create({
            data: {
                userId,
                action: "DECLARE_UNPAID",
                entityType: "LEASE",
                entityId: leaseId,
                details: JSON.stringify({ oldStatus: "ACTIVE", newStatus: "LOYER_IMPAYE" }),
            },
        });

        return { success: true, lease };
    } catch (error) {
        console.error("Error declaring unpaid rent:", error);
        return { success: false, error: "Failed to declare unpaid rent" };
    }
}

/**
 * Phase 3: Mise en demeure
 */
export async function sendFormalNotice(leaseId: string, userId: string) {
    try {
        const lease = await prisma.lease.update({
            where: { id: leaseId },
            data: { status: LeaseStatus.MISE_EN_DEMEURE },
        });

        await prisma.procedurePhase.create({
            data: {
                leaseId,
                phaseNumber: 3,
                name: "Mise en demeure",
                description: "Mise en demeure numérique horodatée envoyée au locataire.",
            },
        });

        await prisma.auditLog.create({
            data: {
                userId,
                action: "SEND_FORMAL_NOTICE",
                entityType: "LEASE",
                entityId: leaseId,
            },
        });

        return { success: true, lease };
    } catch (error) {
        console.error("Error sending formal notice:", error);
        return { success: false, error: "Failed to send formal notice" };
    }
}

/**
 * Phase 5: Option de clémence (Proposition d'un échéancier par le propriétaire)
 */
export async function proposeClemency(leaseId: string, details: string, userId: string) {
    try {
        const lease = await prisma.lease.update({
            where: { id: leaseId },
            data: { status: LeaseStatus.CLEMENCE_EN_COURS },
        });

        const repaymentPlan = await prisma.repaymentPlan.create({
            data: {
                leaseId,
                details,
                status: PlanStatus.PROPOSED,
            },
        });

        await prisma.procedurePhase.create({
            data: {
                leaseId,
                phaseNumber: 5,
                name: "Proposition de clémence",
                description: `Échéancier proposé: ${details}`,
            },
        });

        await prisma.auditLog.create({
            data: {
                userId,
                action: "PROPOSE_CLEMENCY",
                entityType: "REPAYMENT_PLAN",
                entityId: repaymentPlan.id,
            },
        });

        return { success: true, repaymentPlan };
    } catch (error) {
        console.error("Error proposing clemency:", error);
        return { success: false, error: "Failed to propose clemency" };
    }
}

/**
 * Phase 5 (suite) : Le locataire accepte ou refuse la clémence
 */
export async function respondToClemency(planId: string, accepted: boolean, tenantSignature: string, userId: string) {
    try {
        const planResponse = await prisma.repaymentPlan.update({
            where: { id: planId },
            data: {
                status: accepted ? PlanStatus.ACCEPTED : PlanStatus.REJECTED,
                tenantSignature: accepted ? tenantSignature : null,
            },
        });

        await prisma.auditLog.create({
            data: {
                userId,
                action: "RESPOND_CLEMENCY",
                entityType: "REPAYMENT_PLAN",
                entityId: planId,
                details: JSON.stringify({ accepted }),
            },
        });

        return { success: true, plan: planResponse };
    } catch (error) {
        console.error("Error responding to clemency:", error);
        return { success: false, error: "Failed to respond to clemency" };
    }
}

/**
 * Phase 6: Reprise automatique si non-respect de la clémence
 */
export async function breakClemency(planId: string, leaseId: string, userId: string) {
    try {
        const plan = await prisma.repaymentPlan.update({
            where: { id: planId },
            data: { status: PlanStatus.BROKEN },
        });

        const lease = await prisma.lease.update({
            where: { id: leaseId },
            data: { status: LeaseStatus.REPRISE_PROCEDURE },
        });

        await prisma.procedurePhase.create({
            data: {
                leaseId,
                phaseNumber: 6,
                name: "Rupture de l'échéancier",
                description: "L'échéancier n'a pas été respecté. Reprise de la procédure.",
            },
        });

        await prisma.auditLog.create({
            data: {
                userId,
                action: "BREAK_CLEMENCY",
                entityType: "LEASE",
                entityId: leaseId,
            },
        });

        return { success: true, lease, plan };
    } catch (error) {
        console.error("Error breaking clemency:", error);
        return { success: false, error: "Failed to break clemency" };
    }
}

/**
 * Phase 7 & 8: Demande de résiliation (sans effet automatique) & Constitution dossier
 */
export async function initiateTermination(leaseId: string, userId: string) {
    try {
        const lease = await prisma.lease.update({
            where: { id: leaseId },
            data: { status: LeaseStatus.DEMANDE_RESILIATION },
        });

        await prisma.procedurePhase.create({
            data: {
                leaseId,
                phaseNumber: 7,
                name: "Demande de résiliation",
                description: "Demande de résiliation initiée. Préparation du dossier contentieux (Phase 8).",
            },
        });

        await prisma.auditLog.create({
            data: {
                userId,
                action: "INITIATE_TERMINATION",
                entityType: "LEASE",
                entityId: leaseId,
            },
        });

        return { success: true, lease };
    } catch (error) {
        console.error("Error initiating termination:", error);
        return { success: false, error: "Failed to initiate termination" };
    }
}
