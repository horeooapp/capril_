import { prisma } from "./prisma";
import { NotificationService } from "./notification-service";
import { calculateReliabilityScore } from "./reliability";

/**
 * RCL SERVICE - Automated Ticket Resolution (REG-2026-001 / RCL-Délai)
 * Enforces the 144h (6 days) response deadline for landlord/management.
 */
export class RclService {
    
    /**
     * Scans for open tickets over 144h old and closes them automatically in favor of the tenant.
     */
    static async processAutoClosures() {
        const SIX_DAYS_AGO = new Date(Date.now() - 144 * 60 * 60 * 1000);

        // Find tickets still open after 144h
        const lateTickets = await prisma.reclamationLocataire.findMany({
            where: {
                statut: { in: ['OUVERT', 'VU', 'EN_COURS'] },
                createdAt: { lt: SIX_DAYS_AGO }
            },
            include: {
                lease: {
                    include: {
                        landlord: true,
                        tenant: true
                    }
                }
            }
        });

        console.log(`[RCL-Cron] Found ${lateTickets.length} tickets over 144h.`);

        for (const ticket of lateTickets) {
            try {
                // 1. Close ticket in favor of tenant (Statut to FERME_AUTO)
                await prisma.reclamationLocataire.update({
                    where: { id: ticket.id },
                    data: {
                        statut: 'FERME_AUTO'
                    }
                });

                // 2. Trigger Score Recalculation (-2 pts rule)
                await calculateReliabilityScore(ticket.lease.landlordId);

                const ticketRef = `RCL-${ticket.id.slice(0, 4).toUpperCase()}`;

                // 3. Notify Landlord (Sanction notification)
                if (ticket.lease.landlord.phone) {
                    await NotificationService.envoyerNotification(
                        ticket.lease.landlordId,
                        "RECLAMATION_RECUE", // Mapping to existing event for notification
                        {
                            payload: {
                                smsText: `[QAPRIL] Sanction : Réclamation ${ticketRef} close automatiquement après 144h de silence. Votre score est réduit de 2 pts.`
                            }
                        }
                    );
                }

                // 4. Notify Tenant (Success notification)
                if (ticket.lease.tenant?.phone) {
                    await NotificationService.envoyerNotification(
                        ticket.lease.tenantId!,
                        "RECLAMATION_RECUE",
                        {
                            payload: {
                                smsText: `[QAPRIL] Règle 144h : Votre réclamation ${ticketRef} validée automatiquement en votre faveur faute de réponse du bailleur.`
                            }
                        }
                    );
                }

                console.log(`[RCL-Cron] Ticket ${ticket.id} auto-closed and score updated.`);
            } catch (err) {
                console.error(`[RCL-Cron] Failed to close ticket ${ticket.id}:`, err);
            }
        }

        return lateTickets.length;
    }
}

