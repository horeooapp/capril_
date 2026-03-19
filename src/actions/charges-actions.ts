"use server"

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
