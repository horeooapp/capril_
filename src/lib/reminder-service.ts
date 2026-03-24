import { prisma } from "@/lib/prisma";
import { NotificationService, EventType } from "@/lib/notification-service";

/**
 * REMINDER SERVICE - ADD-09 & DLP-001
 * Core engine for automated lease and payment reminders.
 */
export class ReminderService {
  /**
   * Main entry point for the daily cron job.
   */
  static async processDailyReminders() {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    // 1. Fetch active leases
    const activeLeases = await prisma.lease.findMany({
      where: {
        status: "ACTIVE",
        rentAmount: { gt: 0 },
      },
      include: {
        tenant: true,
        property: { include: { owner: true } },
      },
    });

    console.info(`[ReminderService] Processing ${activeLeases.length} active leases...`);

    for (const lease of activeLeases) {
      try {
        // Default DLP is 5 if not set (DLP-001 fallback)
        const dlp = lease.dateLimitePaiement || 5;
        
        // Calculate reminder window
        const dates = NotificationService.calculateReminderDates(dlp, month, year);
        
        // Today's date at 00:00:00
        const todayStr = today.toISOString().split('T')[0];

        // Check each reminder trigger
        if (this.isSameDay(dates.t_minus_3, today)) {
          await this.sendReminder(lease, "RAPPEL_ECHEANCE", "T-3");
        } else if (this.isSameDay(dates.t_minus_1, today)) {
          await this.sendReminder(lease, "RAPPEL_ECHEANCE", "T-1");
        } else if (this.isSameDay(dates.t_zero, today)) {
          await this.sendReminder(lease, "RAPPEL_ECHEANCE", "T-0");
        } else if (this.isSameDay(dates.t_plus_2, today)) {
          await this.sendReminder(lease, "IMPAYE_DETECTE", "T+2");
        } else if (this.isSameDay(dates.t_plus_5, today)) {
          await this.sendReminder(lease, "IMPAYE_DETECTE", "T+5");
        } else if (this.isSameDay(dates.t_plus_10, today)) {
          await this.sendReminder(lease, "IMPAYE_DETECTE", "T+10");
        }

      } catch (err) {
        console.error(`[ReminderService] Error processing lease ${lease.id}:`, err);
      }
    }
  }

  /**
   * Check if a lease has already been paid for this month.
   */
  private static async isAlreadyPaid(leaseId: string, month: number, year: number) {
    const payment = await prisma.paymentPgw.findFirst({
      where: {
        leaseId,
        metadata: {
          path: ["periode"],
          equals: `${month}/${year}`,
        },
        status: "SUCCESSFUL",
      },
    });
    return !!payment;
  }

  private static async sendReminder(lease: any, event: EventType, timing: string) {
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();

    // Check if already paid before sending reminder
    const paid = await this.isAlreadyPaid(lease.id, month, year);
    if (paid) return;

    console.info(`[ReminderService] Sending ${event} (${timing}) for lease ${lease.id}`);

    const payload = {
      leaseReference: lease.leaseReference,
      amount: lease.rentAmount,
      timing,
      smsText: `QAPRIL: Rappel paiement loyer ${lease.property.ref} (${timing}). Montant: ${lease.rentAmount} FCFA.`,
      parameters: [lease.tenant.fullName, lease.property.ref, String(lease.rentAmount)]
    };

    await NotificationService.envoyerNotification(lease.tenantId, event, {
      referenceId: lease.id,
      payload
    });
  }

  private static isSameDay(d1: Date, d2: Date): boolean {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  }
}
