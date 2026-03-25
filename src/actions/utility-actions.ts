"use server"

import { UtilityService } from "@/lib/utility-service";
import { UtilityType, UtilityMode, RepartitionModel, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ensureAuthenticated, ensureLeaseAccess } from "./auth-helpers";
import { writeAuditLog } from "@/lib/audit";

/**
 * Configurer le mode utilité du bail (UTL-01)
 */
export async function configureLeaseUtilities(data: {
  leaseId: string;
  modeUtilities: UtilityMode;
  identifiantCie?: string;
  identifiantSodeci?: string;
  modeleRepartition?: RepartitionModel;
  forfaitUtilitiesMensuel?: number;
}) {
  const session = await ensureAuthenticated();

  try {
    await ensureLeaseAccess(data.leaseId, [Role.LANDLORD, Role.LANDLORD_PRO, Role.AGENCY, Role.ADMIN]);

    const lease = await prisma.lease.update({
      where: { id: data.leaseId },
      data: {
        modeUtilities: data.modeUtilities,
        identifiantCie: data.identifiantCie,
        identifiantSodeci: data.identifiantSodeci,
        modeleRepartition: data.modeleRepartition,
        forfaitUtilitiesMensuel: data.forfaitUtilitiesMensuel,
      },
    });

    revalidatePath(`/dashboard/leases/${data.leaseId}`);

    await writeAuditLog({
      userId: session.user.id,
      action: "LEASE_UTILITIES_CONFIGURED",
      module: "UTILITY",
      entityId: data.leaseId,
      newValues: { mode: data.modeUtilities }
    });

    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

/**
 * Consulter une facture via le tunnel (UTL-02)
 */
export async function consultUtilityBill(leaseId: string, type: UtilityType) {
  const session = await ensureAuthenticated();

  try {
    await ensureLeaseAccess(leaseId);
    
    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      select: { identifiantCie: true, identifiantSodeci: true }
    });

    const identifiant = type === "CIE" ? lease?.identifiantCie : lease?.identifiantSodeci;
    if (!identifiant) throw new Error(`Identifiant ${type} non configuré.`);

    const billInfo = await UtilityService.consulterFacture(identifiant, type);

    if (!billInfo) {
      return { success: false, fallbackToManual: true, message: "Impossible de récupérer la facture via l'API. Merci de saisir manuellement les informations." };
    }

    return { success: true, billInfo };
  } catch (error: any) {
    return { error: error.message };
  }
}

/**
 * Enregistrer et répartir une facture (UTL-04)
 */
export async function registerAndDistributeUtility(data: {
  leaseId: string;
  typeUtility: UtilityType;
  identifiantCompteur: string;
  moisFacture: Date;
  montantTotal: number;
  source: string;
}) {
  const session = await ensureAuthenticated();
  const userId = session.user.id;
  const role = session.user.role as string;

  try {
    const facture = await UtilityService.repartirFacture({
      ...data,
      acteurId: userId,
      roleActeur: role === "TENANT" ? "LOCATAIRE" : "PROPRIO",
    });

    revalidatePath(`/dashboard/utilities/${data.leaseId}`);

    await writeAuditLog({
      userId,
      action: "UTILITY_BILL_REGISTERED",
      module: "UTILITY",
      entityId: facture.id,
      newValues: { total: data.montantTotal, type: data.typeUtility }
    });

    return { success: true, factureId: facture.id };
  } catch (error: any) {
    return { error: error.message };
  }
}
