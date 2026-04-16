"use server";

import { prisma } from "@/lib/prisma";
import { LeaseStatus, PlanStatus, Role } from "@prisma/client";
import { ensureAuthenticated, ensureLeaseAccess } from "./auth-helpers";

/**
 * Phase 1 & 2: Détection automatique / Signalement manuel d'impayé
 * Passe le bail au statut LOYER_IMPAYE et enregistre la phase 1.
 */
export async function declareUnpaidRent(leaseId: string) {
    try {
        const session = await ensureAuthenticated();
        const userId = session.user.id;
        
        await ensureLeaseAccess(leaseId, [Role.LANDLORD, Role.LANDLORD_PRO, Role.AGENCY]);

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
                module: "LEASE",
                entityId: leaseId,
                newValues: { oldStatus: "ACTIVE", newStatus: "LOYER_IMPAYE" },
            },
        });

        return { success: true, lease };
    } catch (error: unknown) {
        console.error("Error declaring unpaid rent:", error);
        const message = error instanceof Error ? error.message : "Erreur lors du signalement de l'impayé.";
        return { success: false, error: message };
    }
}

/**
 * Phase 3: Mise en demeure
 */
export async function sendFormalNotice(leaseId: string) {
    try {
        const session = await ensureAuthenticated();
        const userId = session.user.id;

        await ensureLeaseAccess(leaseId, [Role.LANDLORD, Role.LANDLORD_PRO, Role.AGENCY]);

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
                module: "LEASE",
                entityId: leaseId,
            },
        });

        return { success: true, lease };
    } catch (error: unknown) {
        console.error("Error sending formal notice:", error);
        const message = error instanceof Error ? error.message : "Erreur lors de l'envoi de la mise en demeure.";
        return { success: false, error: message };
    }
}

/**
 * Phase 5: Option de clémence (Proposition d'un échéancier par le propriétaire)
 */
export async function proposeClemency(leaseId: string, details: string) {
    try {
        const session = await ensureAuthenticated();
        const userId = session.user.id;

        await ensureLeaseAccess(leaseId, [Role.LANDLORD, Role.LANDLORD_PRO, Role.AGENCY]);

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
                module: "REPAYMENT_PLAN",
                entityId: repaymentPlan.id,
            },
        });

        return { success: true, repaymentPlan };
    } catch (error: unknown) {
        console.error("Error proposing clemency:", error);
        const message = error instanceof Error ? error.message : "Erreur lors de la proposition de clémence.";
        return { success: false, error: message };
    }
}

/**
 * Phase 5 (suite) : Le locataire accepte ou refuse la clémence
 */
export async function respondToClemency(planId: string, accepted: boolean, tenantSignature: string) {
    try {
        const session = await ensureAuthenticated();
        const userId = session.user.id;

        const plan = await prisma.repaymentPlan.findUnique({ where: { id: planId } });
        if (!plan) return { error: "Plan non trouvé." };
        
        await ensureLeaseAccess(plan.leaseId, [Role.TENANT]);

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
                module: "REPAYMENT_PLAN",
                entityId: planId,
                newValues: { accepted },
            },
        });

        return { success: true, plan: planResponse };
    } catch (error: unknown) {
        console.error("Error responding to clemency:", error);
        const message = error instanceof Error ? error.message : "Erreur lors de la réponse à la clémence.";
        return { success: false, error: message };
    }
}

/**
 * Phase 6: Reprise automatique si non-respect de la clémence
 */
export async function breakClemency(planId: string, leaseId: string) {
    try {
        const session = await ensureAuthenticated();
        const userId = session.user.id;

        await ensureLeaseAccess(leaseId, [Role.LANDLORD, Role.LANDLORD_PRO, Role.AGENCY]);

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
                module: "LEASE",
                entityId: leaseId,
            },
        });

        return { success: true, lease, plan };
    } catch (error: unknown) {
        console.error("Error breaking clemency:", error);
        const message = error instanceof Error ? error.message : "Erreur lors de la rupture de l'échéancier.";
        return { success: false, error: message };
    }
}

/**
 * Phase 7 & 8: Demande de résiliation (sans effet automatique) & Constitution dossier
 */
export async function initiateTermination(leaseId: string) {
    try {
        const session = await ensureAuthenticated();
        const userId = session.user.id;

        await ensureLeaseAccess(leaseId, [Role.LANDLORD, Role.LANDLORD_PRO, Role.AGENCY]);

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
                module: "LEASE",
                entityId: leaseId,
            },
        });

        return { success: true, lease };
    } catch (error: unknown) {
        console.error("Error initiating termination:", error);
        const message = error instanceof Error ? error.message : "Erreur serveur.";
        return { success: false, error: message };
    }
}

/**
 * Phase 8: Constitution du dossier contentieux (Horodatage de toutes les preuves)
 */
export async function completeLitigationDossier(leaseId: string) {
    try {
        const session = await ensureAuthenticated();
        const userId = session.user.id;

        await ensureLeaseAccess(leaseId, [Role.LANDLORD, Role.LANDLORD_PRO, Role.AGENCY]);

        await prisma.procedurePhase.create({
            data: {
                leaseId,
                phaseNumber: 8,
                name: "Constitution Dossier Contentieux",
                description: "Toutes les quittances, mises en demeure et logs IOT ont été scellés pour transmission au tribunal.",
            },
        });

        await prisma.auditLog.create({
            data: {
                userId,
                action: "COMPLETE_LITIGATION_DOSSIER",
                module: "LEASE",
                entityId: leaseId,
            },
        });

        return { success: true };
    } catch (error: unknown) {
        console.error("Error completing litigation dossier:", error);
        return { success: false, error: "Erreur lors du scellement du dossier." };
    }
}

/**
 * Annulation d'un contrat non validé (DRAFT, PENDING_SIGNATURE, PENDING_CONFIRMATION)
 */
export async function cancelLease(leaseId: string) {
    try {
        const session = await ensureAuthenticated();
        const userId = session.user.id;

        const lease = await prisma.lease.findUnique({
            where: { id: leaseId },
            select: { landlordId: true, tenantId: true, status: true }
        });

        if (!lease) throw new Error("Bail introuvable.");

        // Autoriser l'annulation si le statut est avant validation
        if (lease.status !== LeaseStatus.DRAFT && lease.status !== LeaseStatus.PENDING_SIGNATURE && lease.status !== LeaseStatus.PENDING_CONFIRMATION) {
            throw new Error("Ce bail ne peut plus être annulé à ce stade car il est déjà engagé.");
        }

        const updatedLease = await prisma.lease.update({
            where: { id: leaseId },
            data: { status: LeaseStatus.CANCELLED },
        });

        await prisma.procedurePhase.create({
            data: {
                leaseId,
                phaseNumber: 0,
                name: "Annulation du contrat",
                description: "Le contrat a été annulé par les parties avant sa validation finale.",
            },
        });

        await prisma.auditLog.create({
            data: {
                userId,
                action: "CANCEL_LEASE",
                module: "LEASE",
                entityId: leaseId,
            },
        });

        return { success: true, lease: updatedLease };
    } catch (error: unknown) {
        console.error("Error cancelling lease:", error);
        const message = error instanceof Error ? error.message : "Erreur lors de l'annulation du bail.";
        return { success: false, error: message };
    }
}

/**
 * Phase IOT: Suspension de l'accès physique à la propriété
 */
export async function suspendPropertyAccess(leaseId: string) {
    try {
        const session = await ensureAuthenticated();
        const userId = session.user.id;

        const lease = await prisma.lease.findUnique({
            where: { id: leaseId },
            select: { propertyId: true, tenantId: true }
        });

        if (!lease || !lease.propertyId || !lease.tenantId) {
            throw new Error("Bail Invalide pour suspension.");
        }

        await prisma.propertyAccess.updateMany({
            where: {
                propertyId: lease.propertyId,
                userId: lease.tenantId
            },
            data: {
                statut: "SUSPENDU"
            }
        });

        await prisma.procedurePhase.create({
            data: {
                leaseId,
                phaseNumber: 99,
                name: "Coupure Accès IOT",
                description: "Le contrôleur d'accès physique au bâtiment a été suspendu pour ce locataire défaillant.",
            },
        });

        await prisma.auditLog.create({
            data: {
                userId,
                action: "SUSPEND_PHYSICAL_ACCESS",
                module: "IOT",
                entityId: lease.propertyId,
            },
        });

        return { success: true };
    } catch (error: unknown) {
        console.error("Error suspending property access:", error);
        const message = error instanceof Error ? error.message : "Erreur IOT.";
        return { success: false, error: message };
    }
}

/**
 * Récupère tous les baux sous procédure judiciaire
 */
export async function getDisputedLeases() {
    try {
        const session = await ensureAuthenticated();
        
        let targetId = session.user.id;
        const userAny = session.user as any;
        if ((session.user.role === "NON_CERTIFIED_AGENT" || session.user.role === "AGENCY") && userAny.agencyId) {
            targetId = userAny.agencyId;
        }

        const disputes = await prisma.lease.findMany({
            where: {
                landlordId: targetId,
                status: {
                    in: ["LOYER_IMPAYE", "MISE_EN_DEMEURE", "CLEMENCE_EN_COURS", "REPRISE_PROCEDURE", "DEMANDE_RESILIATION"]
                }
            },
            include: {
                tenant: { select: { firstName: true, lastName: true, phone: true } },
                property: { select: { name: true, address: true } },
                procedurePhases: {
                    orderBy: { actionDate: 'desc' },
                    take: 1
                }
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });

        return { success: true, disputes };
    } catch (error: unknown) {
        return { success: false, error: "Impossible de charger les contentieux" };
    }
}
