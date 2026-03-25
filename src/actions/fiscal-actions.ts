"use server";

import { FiscalService } from "@/lib/fiscal-service";
import { DossierDgiService } from "@/lib/dossier-dgi-service";
import { auth } from "@/auth";

export async function calculerDroitsAction(leaseId: string, pdfBuffer?: Buffer) {
  const session = await auth();
  if (!session) throw new Error("Non autorisé");

  try {
    const updatedDossier = await FiscalService.calculerDroits(leaseId, pdfBuffer);
    return { success: true as const, dossier: updatedDossier };
  } catch (error: any) {
    return { success: false as const, error: error.message };
  }
}

export async function initierPaiementFiscalAction(leaseId: string) {
  const session = await auth();
  if (!session) throw new Error("Non autorisé");

  try {
    const result = await FiscalService.initierSplitCinetPay(leaseId);
    return { success: true as const, paymentUrl: result.paymentUrl };
  } catch (error: any) {
    return { success: false as const, error: error.message };
  }
}

export async function genererPackDgiAction(leaseId: string) {
  const session = await auth();
  if (!session) throw new Error("Non autorisé");

  try {
    const pack = await DossierDgiService.genererPackComplet(leaseId);
    return { success: true as const, pack };
  } catch (error: any) {
    return { success: false as const, error: error.message };
  }
}

// ALIASES & NEW EXPORTS FOR UI COMPATIBILITY
export async function getFiscalStats() {
  try {
    const data = await FiscalService.getStats();
    return { 
      success: true as const, 
      stats: data.stats, 
      recentRegistrations: data.recentRegistrations 
    };
  } catch (error: any) {
    return { success: false as const, error: error.message };
  }
}

export async function getOrCreateFiscalDossier(leaseId: string) {
  try {
    const dossier = await FiscalService.getOrCreateDossier(leaseId);
    return { success: true as const, data: dossier };
  } catch (error: any) {
    return { success: false as const, error: error.message };
  }
}

export async function initiateFiscalPayment(fiscalId: string) {
  try {
    const result = await FiscalService.initierSplitCinetPay(fiscalId);
    return { success: true as const, paymentUrl: result.paymentUrl };
  } catch (error: any) {
    return { success: false as const, error: error.message };
  }
}

export async function generateFiscalCert(fiscalId: string) {
  try {
    const cert = await FiscalService.generateCertificate(fiscalId);
    return { success: true as const, cert };
  } catch (error: any) {
    return { success: false as const, error: error.message };
  }
}


