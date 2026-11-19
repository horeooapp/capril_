"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ensureAuthenticated } from "@/actions/auth-helpers";
import { writeAuditLog } from "@/lib/audit";
import {
  emettreQuittanceExpress, etatDossier, QuittanceExpressError, type QuittanceExpressInput,
} from "@/lib/quittance-express";
import { remettreQuittance, lienQuittance } from "@/lib/quittance-express-envoi";

const ROLES_EMETTEURS = ["LANDLORD", "LANDLORD_PRO", "AGENCY", "ADMIN", "SUPER_ADMIN"];

/** Émet une quittance à partir de quatre informations et la remet au locataire. */
export async function emettreQuittanceExpressAction(input: QuittanceExpressInput) {
  try {
    const session = await ensureAuthenticated();
    const role = (session.user as any).role as string;
    if (!ROLES_EMETTEURS.includes(role)) {
      return { success: false as const, code: "ROLE", error: "Seul un bailleur ou une agence peut émettre une quittance." };
    }
    const bailleurId = session.user.id as string;

    const r = await emettreQuittanceExpress(prisma, bailleurId, input);

    // La remise se fait après la transaction : un envoi en échec n'annule jamais la quittance.
    let remise: Awaited<ReturnType<typeof remettreQuittance>> = [];
    try {
      remise = await remettreQuittance(r.quittance.id, { email: r.saisie.email });
    } catch (e: any) {
      console.error("[QUITTANCE_EXPRESS] remise impossible", e);
    }

    await writeAuditLog({
      userId: bailleurId,
      action: "QUITTANCE_EXPRESS_EMISE",
      module: "RECEIPT",
      entityId: r.quittance.id,
      newValues: {
        reference: r.quittance.receiptRef, bail: r.bail.leaseReference, mois: r.saisie.mois, montant: r.saisie.montant,
        dossierCree: r.dossierCree, remise: remise.map((x) => `${x.canal}=${x.statut}`),
      },
    });

    revalidatePath("/dashboard/receipts");
    revalidatePath("/dashboard/quittance-express");

    return {
      success: true as const,
      quittance: { id: r.quittance.id, reference: r.quittance.receiptRef, empreinte: r.quittance.receiptHash, lien: lienQuittance(r.quittance) },
      bail: { id: r.bail.id, reference: r.bail.leaseReference },
      dossierCree: r.dossierCree,
      remise,
      remisAuLocataire: remise.some((x) => x.statut === "ENVOYE"),
    };
  } catch (e: any) {
    if (e instanceof QuittanceExpressError) return { success: false as const, code: e.code, error: e.message };
    if (e?.code === "P2002") return { success: false as const, code: "DEJA_EMISE", error: "Une quittance existe déjà pour ce locataire sur ce mois." };
    console.error("[QUITTANCE_EXPRESS]", e);
    return { success: false as const, code: "INTERNE", error: "La quittance n’a pas pu être émise. Rien n’a été enregistré." };
  }
}

/** Dossiers nés d'une quittance express, avec leur avancement. */
export async function listerDossiersExpress() {
  const session = await ensureAuthenticated();
  const bailleurId = session.user.id as string;
  const baux = await (prisma as any).lease.findMany({
    where: { landlordId: bailleurId, modeCreation: "QUITTANCE_EXPRESS", deletedAt: null },
    include: { property: true, bdq: true, tenant: true, _count: { select: { receipts: true } } },
    orderBy: { createdAt: "desc" },
  });
  return baux.map((b: any) => {
    const etat = etatDossier({ bail: b, bien: b.property, bdq: b.bdq, nbQuittances: b._count.receipts });
    return {
      bailId: b.id,
      reference: b.leaseReference,
      locataire: b.bdq?.nomLocataireDeclare || [b.tenant?.firstName, b.tenant?.lastName].filter(Boolean).join(" "),
      telephone: b.tenant?.phone || b.bdq?.telephoneLocataire || "",
      quartier: b.property?.quartier || b.property?.commune || "",
      loyer: Number(b.rentAmount),
      nbQuittances: b._count.receipts,
      pourcentage: etat.pourcentage,
      etapes: etat.etapes,
      prochaine: etat.prochaine,
      bienId: b.propertyId,
    };
  });
}

/** Renvoie une quittance déjà émise. */
export async function renvoyerQuittanceAction(receiptId: string) {
  const session = await ensureAuthenticated();
  const q = await (prisma as any).receipt.findUnique({ where: { id: receiptId }, include: { lease: true } });
  if (!q || q.lease.landlordId !== session.user.id) return { success: false as const, error: "Quittance introuvable." };
  const remise = await remettreQuittance(receiptId);
  return { success: remise.some((x) => x.statut === "ENVOYE"), remise };
}

/** Complète le logement et le bail d'un dossier express (étapes 3 et 4). */
export async function completerDossierExpressAction(data: {
  bailId: string; typeBien: string; adresse: string; dateEffet: string; dureeMois: number; depot?: number;
}) {
  try {
    const session = await ensureAuthenticated();
    const bail = await (prisma as any).lease.findUnique({ where: { id: data.bailId } });
    if (!bail || bail.landlordId !== session.user.id || bail.modeCreation !== "QUITTANCE_EXPRESS") {
      return { success: false as const, error: "Dossier introuvable." };
    }
    const typeBien = (data.typeBien || "").trim();
    const adresse = (data.adresse || "").trim();
    const duree = Math.round(Number(data.dureeMois));
    const dateEffet = new Date(data.dateEffet);
    if (!typeBien) return { success: false as const, error: "Indiquez le type de logement." };
    if (adresse.length < 5) return { success: false as const, error: "Indiquez l’adresse du logement." };
    if (!(duree > 0 && duree <= 120)) return { success: false as const, error: "Indiquez la durée du bail en mois." };
    if (isNaN(dateEffet.getTime())) return { success: false as const, error: "Indiquez la date d’effet du bail." };
    const depot = data.depot != null && data.depot !== ("" as any) ? Math.round(Number(data.depot)) : undefined;

    await prisma.$transaction([
      (prisma as any).property.update({
        where: { id: bail.propertyId },
        data: { propertyType: typeBien, address: adresse, confirmation: "CONFIRME", confirmeAt: new Date() },
      }),
      (prisma as any).lease.update({
        where: { id: bail.id },
        data: { startDate: dateEffet, durationMonths: duree, adossementStatut: "CONFIRME", ...(depot != null && depot >= 0 ? { depositAmount: depot } : {}) },
      }),
    ]);
    revalidatePath("/dashboard/quittance-express");
    return { success: true as const };
  } catch (e: any) {
    console.error("[QUITTANCE_EXPRESS_COMPLETER]", e);
    return { success: false as const, error: "Le dossier n’a pas pu être enregistré." };
  }
}

/** Envoie au locataire le bail complété, avec son code de signature (étape 4). */
export async function envoyerBailASignatureAction(bailId: string) {
  const session = await ensureAuthenticated();
  const bail = await (prisma as any).lease.findUnique({ where: { id: bailId }, include: { property: true, bdq: true, _count: { select: { receipts: true } } } });
  if (!bail || (bail.landlordId !== session.user.id && bail.agentId !== session.user.id)) {
    return { success: false as const, error: "Dossier introuvable." };
  }
  const etat = etatDossier({ bail, bien: bail.property, bdq: bail.bdq, nbQuittances: bail._count.receipts });
  const manque = etat.etapes.find((e) => !e.fait && (e.code === "BIEN_COMPLETE" || e.code === "BAIL_COMPLETE"));
  if (manque) return { success: false as const, error: `Avant la signature : ${manque.action.toLowerCase()}.` };
  const { requestSignatureOTP } = await import("@/actions/lease.actions");
  const r = await requestSignatureOTP(bailId);
  if (!r.success) return { success: false as const, error: (r as any).error || "Envoi impossible." };
  revalidatePath("/dashboard/quittance-express");
  return { success: true as const };
}
