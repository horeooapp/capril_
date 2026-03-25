"use server";

import { FiscalService } from "@/lib/fiscal-service";
import { DossierDgiService } from "@/lib/dossier-dgi-service";
import { auth } from "@/auth";

export async function calculerDroitsAction(leaseId: string, pdfBuffer?: Buffer) {
  const session = await auth();
  if (!session) throw new Error("Non autorisé");

  try {
    const updatedLease = await FiscalService.calculerDroits(leaseId, pdfBuffer);
    return { success: true, lease: updatedLease };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function initierPaiementFiscalAction(leaseId: string) {
  const session = await auth();
  if (!session) throw new Error("Non autorisé");

  try {
    const result = await FiscalService.initierSplitCinetPay(leaseId);
    return { success: true, ...result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function genererPackDgiAction(leaseId: string) {
  const session = await auth();
  if (!session) throw new Error("Non autorisé");

  try {
    const pack = await DossierDgiService.genererPackComplet(leaseId);
    return { success: true, pack };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
