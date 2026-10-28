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

/**
 * Scan OCR d'une facture pour extraire le montant (UTL-05)
 */
export async function scanUtilityBillOCR(formData: FormData) {
  const session = await ensureAuthenticated();
  const file = formData.get("billFile") as File;
  const typeUtility = formData.get("typeUtility") as UtilityType;

  if (!file) throw new Error("Aucun fichier fourni.");

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const Tesseract = require('tesseract.js');
    
    const { data: { text } } = await Tesseract.recognize(
      buffer,
      'fra', 
      { logger: (m: any) => console.log("[OCR]", m.status, Math.round(m.progress * 100) + "%") }
    );

    console.log("[OCR_RESULT_RAW]", text);

    let montantTrouve = 0;

    const regexMontant = /(?:net|total)[^0-9]*?(?:a|à)?\s*(?:payer)?\s*[:=\s]*([0-9\s]+(?:[.,][0-9]{1,2})?)/i;
    const match = text.match(regexMontant);

    if (match && match[1]) {
      const montantStr = match[1].replace(/\s+/g, '').replace(',', '.');
      montantTrouve = parseFloat(montantStr);
    } else {
      const allNumbers = text.match(/\b\d{1,3}(?:[.,\s]\d{3})*(?:[.,]\d{1,2})?\b/g);
      if (allNumbers) {
         const numericVals = allNumbers.map((n: string) => parseFloat(n.replace(/\s+/g, '').replace(',', '.'))).filter((n: number) => !isNaN(n));
         if (numericVals.length > 0) montantTrouve = Math.max(...numericVals);
      }
    }

    if (montantTrouve <= 0) {
      return { error: "L'IA n'a pas pu identifier le montant avec certitude. Veuillez resaisir manuellement." };
    }

    await writeAuditLog({
      userId: session.user.id,
      action: "UTILITY_BILL_SCANNED_OCR",
      module: "UTILITY",
      entityId: "SCAN",
      newValues: { extractedAmount: montantTrouve, type: typeUtility }
    });

    return { 
      success: true, 
      montant: montantTrouve, 
      texteExtrait: text.substring(0, 500)
    };

  } catch (error: any) {
    console.error("[OCR_PROCESS_ERROR]", error);
    return { error: "Erreur lors de l'analyse OCR du document: " + error.message };
  }
}

/**
 * Créer une facture via saisie manuelle (Saisie Rapide)
 */
export async function createManualUtilityBill(data: {
  leaseId: string;
  typeUtility: UtilityType;
  montantTotal: number;
  dateLimitePaiement: Date;
  identifiantCompteur?: string;
  source?: string;
}) {
  const session = await ensureAuthenticated();

  try {
    const roleActeur = session.user.role === 'TENANT' ? 'LOCATAIRE' : 'PROPRIO';
    
    const facture = await prisma.factureUtility.create({
      data: {
        leaseId: data.leaseId,
        acteurId: session.user.id,
        roleActeur: roleActeur,
        typeUtility: data.typeUtility,
        identifiantCompteur: data.identifiantCompteur || `COMPT-${Date.now()}`,
        moisFacture: new Date().toISOString().slice(0, 7),
        montantTotal: data.montantTotal,
        dateLimitePaiement: data.dateLimitePaiement,
        statut: "EN_COURS",
        source: data.source || "SAISIE_MANUELLE",
        modeUtilities: "INDIVIDUEL_LOCATAIRE" as any
      }
    });

    revalidatePath(`/mon-espace-locataire/cie-sodeci`);

    await writeAuditLog({
      userId: session.user.id,
      action: "UTILITY_BILL_MANUAL_ENTRY",
      module: "UTILITY",
      entityId: facture.id,
      newValues: { amount: data.montantTotal, type: data.typeUtility }
    });

    return { success: true, factureId: facture.id };
  } catch (error: any) {
    console.error("Erreur Saisie Manuelle:", error);
    return { error: error.message || "Erreur inconnue." };
  }
}

/**
 * Créer et répartir une facture collective d'immeuble (UTL-06)
 */
export async function createPropertyUtilityBill(data: {
  propertyId: string;
  typeUtility: UtilityType;
  montantTotal: number;
  moisFacture: string;
  modeRepartition: string;
}) {
  const session = await ensureAuthenticated();

  try {
    // 1. Trouver un bail actif lié à cette propriété pour servir d'ancre
    const lease = await prisma.lease.findFirst({
      where: { propertyId: data.propertyId, status: { in: ["ACTIVE", "ACTIVE_DECLARATIF"] } },
      include: {
        property: {
          include: {
            leases: {
              where: { status: { in: ["ACTIVE", "ACTIVE_DECLARATIF"] } }
            }
          }
        }
      }
    });

    if (!lease) {
      return { error: "Aucun bail actif trouvé sur ce bien pour appliquer la répartition." };
    }

    const activeLeases = lease.property?.leases || [lease];
    const nbLeases = Math.max(1, activeLeases.length);
    const quotePart = Math.round(data.montantTotal / nbLeases);

    // 2. Création de la facture principale
    const facture = await prisma.factureUtility.create({
      data: {
        leaseId: lease.id,
        acteurId: session.user.id,
        roleActeur: session.user.role === 'TENANT' ? 'LOCATAIRE' : 'PROPRIO',
        typeUtility: data.typeUtility,
        identifiantCompteur: `COMPT-${data.typeUtility}-${Date.now().toString().slice(-6)}`,
        moisFacture: data.moisFacture,
        montantTotal: data.montantTotal,
        dateLimitePaiement: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        statut: "EN_COURS",
        source: "GESTION_CHARGES",
        modeUtilities: "PARTAGÉ_PROPRIO" as any
      }
    });

    // 3. Répartition automatique entre chaque locataire actif
    for (const l of activeLeases) {
      if (l.tenantId) {
        await (prisma as any).repartitionUtility.create({
          data: {
            factureId: facture.id,
            leaseLocataireId: l.id,
            locataireId: l.tenantId,
            montantQuotePart: quotePart,
            modeleApplique: (data.modeRepartition as any) || "PRORATA_CHAMBRE",
            statutPaiement: "EN_ATTENTE",
            dateNotification: new Date()
          }
        });
      }
    }

    revalidatePath("/dashboard/utilities");

    await writeAuditLog({
      userId: session.user.id,
      action: "PROPERTY_UTILITY_BILL_CREATED",
      module: "UTILITY",
      entityId: facture.id,
      newValues: { amount: data.montantTotal, type: data.typeUtility, propertyId: data.propertyId }
    });

    return { success: true, factureId: facture.id, repartitionCount: activeLeases.length };
  } catch (error: any) {
    console.error("Erreur createPropertyUtilityBill:", error);
    return { error: error.message || "Impossible d'enregistrer la facture." };
  }
}


