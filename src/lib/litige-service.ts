import { prisma } from "@/lib/prisma";
import * as crypto from "crypto";

/**
 * LITIGE SERVICE - ADD-16
 * Handles the CACI (Cour d'Arbitrage de Côte d'Ivoire) bridge.
 * Generates Dossier de Litige Certifié (DLC) with SHA-256 hashes.
 */
export class LitigeService {
  /**
   * Generates a unique, hashed DLC for a dispute.
   */
  static async generateDlc(leaseId: string, reclamationIds: string[]) {
    // 1. Fetch data for hashing
    const lease = await (prisma.lease as any).findUnique({
      where: { id: leaseId },
      include: {
        property: true,
        tenant: true,
        reclamations: {
          where: { id: { in: reclamationIds } }
        }
      }
    });

    if (!lease) throw new Error("Lease not found");

    // 2. Create the data payload to hash (deterministic)
    const payload = JSON.stringify({
      lease_id: lease.id,
      tenant_name: lease.tenant?.fullName || "N/A",
      property_ref: lease.property.propertyCode,
      reclamations: (lease.reclamations as any[]).map((r: any) => ({
        id: r.id,
        type: r.typeReclamation,
        description: r.description,
        date: r.createdAt
      })),
      timestamp: new Date().toISOString()
    });

    // 3. Generate SHA-256 Hash
    const hash = crypto.createHash('sha256').update(payload).digest('hex');

    // 4. Create DLC record
    const dlc = await (prisma as any).dossierLitigeCertifie.create({
      data: {
        leaseId: lease.id,
        hashSha256: hash,
        statut: "GENERE",
        reclamations: {
          connect: reclamationIds.map(id => ({ id }))
        }
      }
    });

    // 5. TODO: Generate PDF bundle using pdf-generator.ts with the hash and QR code
    
    return dlc;
  }

  /**
   * Update CACI status for a dossier.
   */
  static async updateCaciReference(dlcId: string, refCaci: string) {
    return await (prisma as any).dossierLitigeCertifie.update({
      where: { id: dlcId },
      data: {
        refCaci,
        statut: "TRANSMIS_CACI"
      }
    });
  }

  /**
   * Close a dossier with result.
   */
  static async closeDossier(dlcId: string, issue: string, notes?: string) {
    return await (prisma as any).dossierLitigeCertifie.update({
      where: { id: dlcId },
      data: {
        issue,
        notes,
        statut: "CLOTURE",
        dateCloture: new Date()
      }
    });
  }
}
