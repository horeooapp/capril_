import { prisma } from "@/lib/prisma";
import { LeaseStatus } from "@prisma/client";

/**
 * LeaseLifecycleService
 * 
 * Implémentation d'une Machine à États (State Machine) pour garantir l'intégrité
 * des transitions de statuts d'un bail. Évite les incohérences métier (ex: passer de DRAFT à ARCHIVED).
 */

export class LeaseLifecycleService {
    
    // Matrice des transitions autorisées (De -> Vers[])
    private static readonly ALLOWED_TRANSITIONS: Record<LeaseStatus, LeaseStatus[]> = {
        DRAFT: ["PENDING_SIGNATURE", "PENDING_CONFIRMATION", "CANCELLED"],
        PENDING_SIGNATURE: ["PENDING_DEPOSIT", "ACTIVE", "CANCELLED"],
        PENDING_CONFIRMATION: ["PENDING_DEPOSIT", "ACTIVE", "CANCELLED"],
        PENDING_DEPOSIT: ["ACTIVE", "CANCELLED"],
        
        ACTIVE: ["LOYER_IMPAYE", "DEMANDE_RESILIATION", "TERMINATED"],
        ACTIVE_DECLARATIF: ["ACTIVE", "LOYER_IMPAYE", "DEMANDE_RESILIATION", "TERMINATED"],
        
        LOYER_IMPAYE: ["ACTIVE", "MISE_EN_DEMEURE", "CLEMENCE_EN_COURS", "TERMINATED"],
        MISE_EN_DEMEURE: ["ACTIVE", "REPRISE_PROCEDURE", "TERMINATED"],
        CLEMENCE_EN_COURS: ["ACTIVE", "LOYER_IMPAYE", "MISE_EN_DEMEURE"],
        REPRISE_PROCEDURE: ["TERMINATED"],
        
        DEMANDE_RESILIATION: ["TERMINATED", "ACTIVE"],
        
        TERMINATED: ["ARCHIVED"],
        CANCELLED: ["ARCHIVED"],
        ARCHIVED: [] // État final
    };

    /**
     * Tente de transitionner un bail vers un nouveau statut.
     * @throws Error si la transition est interdite.
     */
    static async transitionLease(leaseId: string, newStatus: LeaseStatus, userId: string, reason?: string) {
        const lease = await prisma.lease.findUnique({
            where: { id: leaseId },
            select: { status: true, propertyId: true }
        });

        if (!lease) throw new Error("Bail introuvable");

        const currentStatus = lease.status as LeaseStatus;

        if (currentStatus === newStatus) {
            return { success: true, message: "Le bail est déjà dans ce statut." };
        }

        const allowedNextStates = this.ALLOWED_TRANSITIONS[currentStatus];
        if (!allowedNextStates.includes(newStatus)) {
            throw new Error(`Transition invalide: Impossible de passer de ${currentStatus} à ${newStatus}.`);
        }

        // Effectuer la transition
        const updatedLease = await prisma.lease.update({
            where: { id: leaseId },
            data: { status: newStatus }
        });

        // Logger l'audit de la transition
        await prisma.auditLog.create({
            data: {
                userId: userId,
                action: "LEASE_STATUS_TRANSITION",
                entityId: leaseId,
                module: "LEASE",
                oldValues: JSON.stringify({ status: currentStatus }),
                newValues: JSON.stringify({ 
                    status: newStatus, 
                    reason: reason || "Transition automatique" 
                })
            }
        });

        // Mettre à jour le statut du bien si nécessaire
        if (newStatus === "ACTIVE" || newStatus === "ACTIVE_DECLARATIF") {
            await prisma.property.update({
                where: { id: lease.propertyId },
                data: { status: "active" } // Occupé
            });
        } else if (newStatus === "TERMINATED" || newStatus === "CANCELLED") {
            // Vérifier s'il reste d'autres baux actifs sur ce bien avant de le déclarer vacant
            const otherActiveLeases = await prisma.lease.count({
                where: {
                    propertyId: lease.propertyId,
                    id: { not: leaseId },
                    status: { in: ["ACTIVE", "ACTIVE_DECLARATIF", "LOYER_IMPAYE", "MISE_EN_DEMEURE", "CLEMENCE_EN_COURS", "DEMANDE_RESILIATION"] }
                }
            });

            if (otherActiveLeases === 0) {
                await prisma.property.update({
                    where: { id: lease.propertyId },
                    data: { status: "available" } // Vacant
                });
            }
        }

        return { success: true, lease: updatedLease };
    }

    /**
     * Raccourci métier : Déclarer un impayé
     */
    static async markAsUnpaid(leaseId: string, userId: string) {
        return this.transitionLease(leaseId, "LOYER_IMPAYE", userId, "Détection automatique d'impayé");
    }

    /**
     * Raccourci métier : Résoudre un impayé (Restauration)
     */
    static async resolveUnpaid(leaseId: string, userId: string) {
        return this.transitionLease(leaseId, "ACTIVE", userId, "Régularisation du solde locataire");
    }
}
