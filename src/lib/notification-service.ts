import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"
import { sendSMS } from "@/lib/sms"
import { sendWhatsAppTemplate } from "@/lib/whatsapp"

export type EventType = 
  | "QUITTANCE_GENEREE"
  | "PAIEMENT_RECU"
  | "IMPAYE_DETECTE"
  | "RAPPEL_ECHEANCE"
  | "BAIL_CONFIRME"
  | "RAPPORT_MENSUEL"
  | "WALLET_BAS"
  | "BAIL_EXPIRANT"
  | "INVITATION_BAIL_RECUE"
  | "RECLAMATION_RECUE"
  | "PROPOSITION_LOYER"
  | "DLC_GENERE"
  | "SUCCESSION_ACTIVEE"
  | "TICKET_MAINTENANCE_CREE"
  | "TICKET_MAINTENANCE_MAJ"
  | "TICKET_MAINTENANCE_RESOLU"
  | "TICKET_MAINTENANCE_CONFIRME"
  | "NOUVEAU_MESSAGE_BAIL"
  | "ANNONCE_VOISINAGE"
  | "FACTURE_UTILITY_DISPO"

interface NotificationData {
  referenceId?: string
  templateId?: string
  payload?: any
  receiptBuffer?: Buffer
}

/**
 * NotificationService
 * 
 * Basé sur l'ADD-09 - Architecture Multi-Canal
 * Gère le dispatch des notifications selon les préférences utilisateur
 * et la criticité des événements (WhatsApp, SMS, Email, Push).
 */
export class NotificationService {
  
  /**
   * Point d'entrée principal pour émettre un événement de notification
   */
  static async envoyerNotification(userId: string, event: EventType, data: NotificationData) {
    try {
      // 1. Récupérer les préférences de l'utilisateur
      const prefs = await (prisma as any).notificationPreference.findUnique({
        where: { userId }
      });

      if (!prefs) {
        console.warn(`[NotificationService] Aucune préférence trouvée pour l'utilisateur ${userId}. Fallback SMS only.`);
        await this.fallbackSmsOnly(userId, event, data);
        return;
      }

      // 2. Extraire la liste des canaux souhaités pour cet événement
      const evenementsActifs = prefs.evenementsActifs as Record<string, string[]> | null;
      const canaux_voulus = (evenementsActifs && evenementsActifs[event]) || ["sms"];
      
      // 3. Gestion des plages horaires (ex: 7h00 - 21h00 CI)
      const heure_ci = this.getHeureCIActuelle();
      const hors_plage = heure_ci < prefs.heureDebut || heure_ci > prefs.heureFin;
      
      const CRITIQUES = ['QUITTANCE_GENEREE', 'PAIEMENT_RECU', 'IMPAYE_DETECTE'];
      if (hors_plage && !CRITIQUES.includes(event)) {
         console.info(`[NotificationService] Événement non critique hors plage horaire. Différé à ${prefs.heureDebut}h00.`);
         // TODO: Implémenter le scheduling réel via une queue (Bull/Redis)
         return;
      }

      let au_moins_un_succes = false;

      // 4. Parcourir chaque canal dans l'ordre défini
      for (const canalStr of canaux_voulus) {
        if (canalStr === "wa" && prefs.waActif && prefs.waVerifie) {
          const ok = await this.envoyerWhatsApp(prefs.waNumero, event, data, userId);
          if (ok) au_moins_un_succes = true;
        }
        if (canalStr === "email" && prefs.emailActif && prefs.emailVerifie) {
          const ok = await this.envoyerEmail(prefs.emailAdresse, event, data, userId);
          if (ok) au_moins_un_succes = true;
        }
        if (canalStr === "sms" && prefs.smsActif) {
          const ok = await this.envoyerSMS(userId, event, data);
          if (ok) au_moins_un_succes = true;
        }
        // TODO: Ajouter implémentation Push si nécessaire
      }

      // 5. Fallback critique
      if (!au_moins_un_succes && CRITIQUES.includes(event)) {
        console.warn(`[NotificationService] Aucun canal réussi pour un événement CRITIQUE. Fallback SMS forcé.`);
        await this.envoyerSMS(userId, event, data);
      }
      
    } catch (e) {
      console.error(`[NotificationService] Erreur globale:`, e);
    }
  }

  /**
   * Calcule les dates de rappel dynamiques basées sur DLP-001
   */
  static calculateReminderDates(dateLimite: number, month: number, year: number) {
    const baseDate = new Date(year, month - 1, dateLimite);
    
    return {
      t_minus_3: new Date(new Date(baseDate).setDate(baseDate.getDate() - 3)),
      t_minus_1: new Date(new Date(baseDate).setDate(baseDate.getDate() - 1)),
      t_zero: new Date(baseDate),
      t_plus_2: new Date(new Date(baseDate).setDate(baseDate.getDate() + 2)),
      t_plus_5: new Date(new Date(baseDate).setDate(baseDate.getDate() + 5)),
      t_plus_10: new Date(new Date(baseDate).setDate(baseDate.getDate() + 10)),
    };
  }

  // ---- Implémentations spécifiques (vides pour l'instant - seront complétées dans le Sprint 1 & 2) ----

  private static async envoyerWhatsApp(numero: string | null, event: EventType, data: NotificationData, userId: string): Promise<boolean> {
    if (!numero) return false;
    
    // Si c'est un événement connu (avec un template id)
    // Ici, mapping rudimentaire : event -> templateName
    let templateName = data.templateId || "default";
    if (event === "QUITTANCE_GENEREE") templateName = "qapril_quittance_generee";
    if (event === "IMPAYE_DETECTE") templateName = "qapril_relance_impaye";
    
    // Extract parameters from payload if they exist, else empty array
    let parameters: string[] = [];
    if (data.payload && Array.isArray(data.payload.parameters)) {
       parameters = data.payload.parameters;
    }

    try {
      const result = await sendWhatsAppTemplate(numero, templateName, parameters);
      
      await this.logNotification(
        userId, 
        "WHATSAPP", 
        event, 
        templateName, 
        result.success ? "LIVRE" : "ECHEC"
      );
      
      return result.success;
    } catch (e) {
      console.error("[NotificationService] WhatsApp failed", e);
      await this.logNotification(userId, "WHATSAPP", event, templateName, "ECHEC");
      return false;
    }
  }

  private static async envoyerEmail(email: string | null, event: EventType, data: NotificationData, userId: string): Promise<boolean> {
    if (!email) return false;
    
    try {
      // Basic formatting, real implementation requires real content
      const subject = "Notification QAPRIL: " + event;
      const htmlContent = data.payload?.html || `<p>Nouveau message pour l'événement: ${event}</p>`;
      
      const { wrapInPremiumTemplate } = await import("@/lib/email");
      
      let attachments;
      if (data.receiptBuffer) {
        attachments = [{
          content: data.receiptBuffer.toString('base64'),
          filename: `Quittance_QAPRIL_${data.referenceId || "Loyer"}.pdf`,
          type: 'application/pdf',
          disposition: 'attachment',
        }];
      }

      const result = await sendEmail({
        to: email,
        subject,
        html: wrapInPremiumTemplate(htmlContent, "Alert QAPRIL"),
        attachments
      });

      await this.logNotification(
        userId, 
        "EMAIL", 
        event, 
        data.templateId, 
        result.success ? "ENVOYE" : "ECHEC"
      );

      return result.success;
    } catch (e) {
      console.error("[NotificationService] Email failed", e);
      await this.logNotification(userId, "EMAIL", event, data.templateId, "ECHEC");
      return false;
    }
  }

  private static async envoyerSMS(userId: string, event: EventType, data: NotificationData): Promise<boolean> {
    let delivered = false;
    try {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { phone: true } });
      if (user?.phone) {
        const textMessage = data.payload?.smsText || "Notification QAPRIL importante sur votre espace.";
        delivered = await sendSMS(user.phone, textMessage);
      }
      
      await this.logNotification(
        userId, 
        "SMS", 
        event, 
        data.templateId, 
        delivered ? "ENVOYE" : "ECHEC"
      );

    } catch (e) {
      console.error("[NotificationService] SMS failed", e);
      await this.logNotification(userId, "SMS", event, data.templateId, "ECHEC");
    }
    return delivered;
  }

  private static async fallbackSmsOnly(userId: string, event: EventType, data: NotificationData) {
    await this.envoyerSMS(userId, event, data);
  }

  // ---- Utils ----

  private static async logNotification(userId: string, canal: any, event: string, templateId?: string, statut: any = "ENVOYE") {
    await (prisma as any).notificationLog.create({
      data: {
        userId,
        canal,
        typeEvenement: event,
        templateId,
        statut
      }
    });
  }

  private static getHeureCIActuelle(): number {
    // Abidjan timezone is UTC
    const date = new Date();
    return date.getUTCHours();
  }
}
