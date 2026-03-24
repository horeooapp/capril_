import { prisma } from "@/lib/prisma";
import { ReclamationLocataire, DossierLitigeCertifie } from "@prisma/client";
import { LitigeService } from "./litige-service";

/**
 * RECLAMATION SERVICE - ADD-16
 * Handles tenant complaints (RCL-01 to RCL-04)
 * and escalation to CACI.
 */
export class ReclamationService {
  /**
   * Submit a new reclamation from a tenant.
   */
  static async submit(data: {
    leaseId: string;
    tenantId: string;
    type: string; // RCL-01 | RCL-02 | RCL-03 | RCL-04
    description: string;
    preuveUrl?: string;
  }) {
    // 10 business days response deadline (standard)
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 14); // ~10 business days

    const reclamation = await prisma.reclamationLocataire.create({
      data: {
        leaseId: data.leaseId,
        tenantId: data.tenantId,
        typeReclamation: data.type,
        description: data.description,
        preuveUrl: data.preuveUrl,
        dateEcheance: deadline,
        statut: "OUVERT",
      },
      include: {
        lease: {
          include: {
            property: true,
          },
        },
      },
    });

    // TODO: Notify Landlord via WhatsApp/Email (ADD-09 integration)
    
    return reclamation;
  }

  /**
   * Escalate an unresolved reclamation to CACI.
   * Generates a Dossier de Litige Certifié (DLC).
   */
  static async escalateToCaci(reclamationId: string) {
    const rec = await prisma.reclamationLocataire.findUnique({
      where: { id: reclamationId },
      include: { lease: true },
    });

    if (!rec) throw new Error("Reclamation not found");
    if (rec.statut !== "OUVERT" && rec.statut !== "EN_COURS") {
      throw new Error("Cannot escalate a closed reclamation");
    }

    // 1. Generate DLC
    const dlc = await LitigeService.generateDlc(rec.leaseId, [reclamationId]);

    // 2. Update Reclamation status
    await prisma.reclamationLocataire.update({
      where: { id: reclamationId },
      data: {
        statut: "ESCALADE_CACI",
        dossierLitigeId: dlc.id,
      },
    });

    return dlc;
  }
}
