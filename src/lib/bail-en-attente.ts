/**
 * QAPRIL — Bail en attente de signature : corriger le numéro du locataire, annuler (IC-09).
 * Logique pure (client Prisma en paramètre), commune au web et au mobile.
 */
import { normalizePhone } from "@/lib/phone";

export class BailEnAttenteError extends Error {
  constructor(public code: string, message: string) { super(message); }
}

const ADMIN = ["ADMIN", "SUPER_ADMIN"];

async function bailGerable(prisma: any, leaseId: string, demandeurId: string, role?: string) {
  const bail = await prisma.lease.findUnique({ where: { id: leaseId }, include: { tenant: true, property: true, bdq: true, _count: { select: { receipts: true } } } });
  if (!bail || bail.deletedAt) throw new BailEnAttenteError("INTROUVABLE", "Contrat de bail introuvable.");
  const gere = [bail.landlordId, bail.agentId, bail.property?.ownerUserId, bail.property?.managedByUserId].includes(demandeurId) || ADMIN.includes(role || "");
  if (!gere) throw new BailEnAttenteError("ACCES", "Seul le bailleur ou son gestionnaire peut modifier ce bail.");
  if (bail.isSignedElectronically) throw new BailEnAttenteError("DEJA_SIGNE", "Ce bail est signé : il ne peut plus être modifié ni annulé ici.");
  if (["CANCELLED", "TERMINATED", "ARCHIVED"].includes(bail.status)) throw new BailEnAttenteError("FERME", "Ce bail est déjà clos.");
  return bail;
}

/**
 * Remplace le numéro du locataire d'un bail non signé. Le code de signature en cours est
 * annulé : il faut renvoyer le bail à la signature, ce qui le refige avec le bon locataire.
 */
export async function corrigerNumeroLocataire(prisma: any, p: { leaseId: string; demandeurId: string; role?: string; telephone: string; nom?: string }) {
  const bail = await bailGerable(prisma, p.leaseId, p.demandeurId, p.role);
  const tel = normalizePhone(p.telephone);
  if (!tel || tel.replace(/\D/g, "").length < 10) throw new BailEnAttenteError("TELEPHONE", "Numéro de téléphone invalide.");
  const demandeur = await prisma.user.findUnique({ where: { id: p.demandeurId }, select: { phone: true } });
  if (demandeur?.phone && normalizePhone(demandeur.phone) === tel) throw new BailEnAttenteError("TELEPHONE", "Le numéro du locataire ne peut pas être le vôtre.");
  if (bail.tenant?.phone && normalizePhone(bail.tenant.phone) === tel) throw new BailEnAttenteError("IDENTIQUE", "C’est déjà le numéro enregistré pour ce locataire.");
  const nom = (p.nom || "").replace(/\s+/g, " ").trim();

  return prisma.$transaction(async (tx: any) => {
    const ancien = bail.tenant;
    let locataire = await tx.user.findUnique({ where: { phone: tel } });
    if (!locataire) {
      // L'ancien compte n'a jamais servi et ne porte que ce bail : on corrige son numéro. Sinon on crée un compte.
      const autresBaux = ancien ? await tx.lease.count({ where: { tenantId: ancien.id, id: { not: bail.id } } }) : 1;
      const jamaisConnecte = ancien && ancien.onboardingComplete !== true && ancien.status !== "ACTIVE";
      if (ancien && autresBaux === 0 && jamaisConnecte) {
        locataire = await tx.user.update({ where: { id: ancien.id }, data: { phone: tel } });
      } else {
        const complet = nom || [ancien?.firstName, ancien?.lastName].filter(Boolean).join(" ") || bail.bdq?.nomLocataireDeclare || "Locataire";
        const [prenom, ...reste] = complet.split(" ");
        locataire = await tx.user.create({ data: { phone: tel, firstName: reste.length ? prenom : "", lastName: reste.length ? reste.join(" ") : prenom, role: "TENANT", status: "INVITED", onboardingComplete: false } });
      }
    }
    if (nom && locataire.onboardingComplete !== true) {
      const [prenom, ...reste] = nom.split(" ");
      locataire = await tx.user.update({ where: { id: locataire.id }, data: { firstName: reste.length ? prenom : "", lastName: reste.length ? reste.join(" ") : prenom } });
    }
    const contexte = { ...((bail.signatureContext as any) || {}) };
    delete contexte.empreinteEnvoyee; delete contexte.bail; delete contexte.premierEnvoiLe; delete contexte.relancesSignature;
    await tx.lease.update({
      where: { id: bail.id },
      data: { tenantId: locataire.id, signingOtpHash: null, signingOtpExpiresAt: null, signingOtpAttempts: 0, signatureContext: contexte },
    });
    if (bail.bdq) {
      await tx.bailDeclaratif.update({ where: { id: bail.bdq.id }, data: { telephoneLocataire: tel, locataireId: locataire.id, ...(nom ? { nomLocataireDeclare: nom } : {}) } });
    }
    return { leaseId: bail.id as string, telephone: tel, locataireId: locataire.id as string };
  });
}

/** Annule un bail qui n'a pas été signé et sur lequel aucune quittance n'a été émise. */
export async function annulerBailEnAttente(prisma: any, p: { leaseId: string; demandeurId: string; role?: string }) {
  const bail = await bailGerable(prisma, p.leaseId, p.demandeurId, p.role);
  if (bail._count.receipts > 0) {
    throw new BailEnAttenteError("QUITTANCES", "Des quittances ont été émises sur ce bail : il ne peut pas être annulé. Vous pouvez le résilier.");
  }
  await prisma.$transaction(async (tx: any) => {
    await tx.lease.update({ where: { id: bail.id }, data: { status: "CANCELLED", signingOtpHash: null, signingOtpExpiresAt: null, signingOtpAttempts: 0 } });
    if (bail.propertyId) {
      const autres = await tx.lease.count({ where: { propertyId: bail.propertyId, id: { not: bail.id }, status: { in: ["ACTIVE", "ACTIVE_DECLARATIF", "PENDING_SIGNATURE"] } } });
      if (autres === 0 && ["RENTED", "rented"].includes(bail.property?.status)) await tx.property.update({ where: { id: bail.propertyId }, data: { status: "ACTIVE" } }).catch(() => {});
    }
  });
  return { leaseId: bail.id as string };
}
