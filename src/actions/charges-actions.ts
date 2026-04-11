"use server"

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function setupChargeProvision(data: {
  leaseId: string;
  montantProvision: number;
  periodicite: "MENSUEL" | "TRIMESTRIEL";
  typeCharges: string[];
}) {
  try {
    const config = await (prisma as any).chargeParametrage.create({
      data: {
        ...data,
        active: true,
      }
    });

    revalidatePath(`/dashboard/leases/${data.leaseId}`);
    return { success: true, config };
  } catch (error) {
    console.error("[CHARGES] Setup Error:", error);
    return { success: false, error: "Erreur lors du paramétrage des charges" };
  }
}

export async function recordExpense(data: {
  propertyId: string;
  label: string;
  montant: number;
  dateFacture: Date;
  categorie: string;
  documentUrl?: string;
}) {
  try {
    // Note: On pourrait créer un modèle spécifique 'Depense' ou utiliser TicketMaintenance clôturé
    // Pour l'instant, on simule l'enregistrement pour la compta
    console.log(`[CHARGES] Dépense enregistrée: ${data.label} - ${data.montant} FCFA`);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function getAllCharges() {
  try {
    const session = await auth()
    if (!session?.user) throw new Error("Non authentifié")
    
    let targetId = session.user.id;
    const userAny = session.user as any;
    if ((session.user.role === "NON_CERTIFIED_AGENT" || session.user.role === "AGENCY") && userAny.agencyId) {
        targetId = userAny.agencyId;
    }

    const charges = await prisma.chargeParametrage.findMany({
      where: {
        logement: {
          ownerUserId: targetId
        }
      },
      include: {
        logement: { select: { name: true, address: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return { success: true, charges };
  } catch (error) {
    return { success: false, error: "Impossible de charger les paramètres de charges" };
  }
}
