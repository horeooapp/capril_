import { prisma } from "./prisma";
import { NotificationService } from "./notification-service";

export class OnboardingService {
  /**
   * [P5.2] Finalize user onboarding after registration.
   * Sends welcome pack and requests critical consents (ICL).
   */
  static async completeFirstLogin(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { diasporaProfile: true }
    });

    if (!user) return;

    // 1. Mark onboarding as completed (assuming metadata field or similar)
    // We'll update the user status or a dedicated flag if it exists
    await prisma.user.update({
        where: { id: userId },
        data: { 
            status: "ACTIVE", // Or other status indicating full activation
        }
    });

    // 2. Initialize default notification preferences
    await prisma.notificationPreference.upsert({
        where: { userId },
        update: {},
        create: {
            userId,
            emailActif: !!user.email,
            smsActif: true,
            waActif: !!user.diasporaProfile, // WA by default for Diaspora
        }
    });

    // 3. Send Welcome Notification (WhatsApp + Email)
    await NotificationService.envoyerNotification(userId, "BIENVENUE_QAPRIL", {
        payload: {
            name: user.firstName || "Utilisateur",
            action: "Complétez votre profil pour activer votre score ICL."
        }
    });

    return { success: true };
  }

  /**
   * [P5.2] Prompt for ICL Privacy Consent on a specific lease.
   */
  static async setIclConsent(leaseId: string, consent: boolean) {
      return await prisma.lease.update({
          where: { id: leaseId },
          data: { scoreConsent: consent }
      });
  }
}
