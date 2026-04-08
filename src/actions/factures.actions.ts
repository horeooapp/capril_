"use server";
// QAPRIL — Factures CIE/SODECI · ADD-18 M-UTILITIES v2
// Modèle Prisma : FactureUtility

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ── Sauvegarder une facture OCR-scannée ───────────────────
export async function saveFactureOCR(data: {
  leaseId:             string;
  acteurId:            string;  // locataire ou proprio
  roleActeur:          "PROPRIO" | "LOCATAIRE";
  typeUtility:         "CIE" | "SODECI";
  identifiantCompteur: string;
  moisFacture:         string;
  montantTotal:        number;
  dateLimitePaiement?: Date;
  invoiceUrl?:         string;  // URL photo/scan
}) {
  return prisma.factureUtility.create({
    data: {
      leaseId:             data.leaseId,
      acteurId:            data.acteurId,
      roleActeur:          data.roleActeur,
      typeUtility:         data.typeUtility,
      identifiantCompteur: data.identifiantCompteur,
      moisFacture:         data.moisFacture,
      montantTotal:        data.montantTotal,
      dateLimitePaiement:  data.dateLimitePaiement,
      statut:              "EN_COURS",
      source:              "OCR_QAPRIL",
      invoiceUrl:          data.invoiceUrl,
      modeUtilities:       "INDIVIDUEL_LOCATAIRE"
    }
  });
}

// ── Marquer une facture comme payée ───────────────────────
export async function markFacturePaid(factureId: string, datePaiement?: Date) {
  return prisma.factureUtility.update({
    where: { id: factureId },
    data: { statut: "PAYEE", datePaiement: datePaiement ?? new Date() }
  });
}

// ── Factures d'un locataire ───────────────────────────────
export async function getFacturesLocataire(leaseId: string) {
  return prisma.factureUtility.findMany({
    where:   { leaseId },
    orderBy: { moisFacture: "desc" }
  });
}

// ── Factures en attente (pour rappels automatiques) ───────
export async function getFacturesEnAttente(locataireId: string) {
  return prisma.factureUtility.findMany({
    where: {
      acteurId: locataireId,
      statut:   { in: ["EN_COURS", "EN_ATTENTE", "EN_RETARD"] },
      dateLimitePaiement: { gte: new Date() }
    },
    orderBy: { dateLimitePaiement: "asc" }
  });
}

// ── Générer deep link paiement facture ────────────────────
// (utiliser wallet.actions.ts genererDeepLink avec le montant de la facture)
// Exemple :
// const { url } = await genererDeepLink(userId, "WAVE", facture.montantTotal);
