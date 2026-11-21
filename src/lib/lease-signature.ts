/**
 * QAPRIL — Signature du bail par le locataire (IC-05)
 *
 * Une seule implémentation pour le web et le mobile. Règles :
 *  - seul le locataire du bail signe ; ni le bailleur, ni l'agence, ni un administrateur ;
 *  - le code n'est envoyé qu'au locataire, jamais à celui qui le demande ;
 *  - le code expire et se bloque après 5 erreurs ;
 *  - on signe un contenu précis : son empreinte est figée à l'envoi du code et
 *    vérifiée à la signature ; si le bail a changé entre-temps, il faut un nouveau code ;
 *  - chaque signature laisse une preuve (qui, quand, d'où, quel contenu).
 *
 * Logique pure : le client Prisma est passé en paramètre, ce qui permet de la tester
 * directement contre une base.
 */
import { createHash, randomInt, timingSafeEqual } from "crypto";
import { normalizePhone } from "@/lib/phone";

export const CODE_VALIDITE_HEURES = 48;
export const CODE_ESSAIS_MAX = 5;

const STATUTS_FERMES = ["CANCELLED", "TERMINATED", "ARCHIVED"];

export class SignatureError extends Error {
  constructor(public code: string, message: string) {
    super(message);
  }
}

const hashCode = (code: string) => createHash("sha256").update(code.trim()).digest("hex");

function memeHash(a: string, b: string): boolean {
  const x = Buffer.from(a, "hex"), y = Buffer.from(b, "hex");
  return x.length === y.length && x.length > 0 && timingSafeEqual(x, y);
}

/** Empreinte des termes du bail : c'est ce contenu, et lui seul, qui est signé. */
export function empreinteBail(bail: any): string {
  const termes = {
    reference: bail.leaseReference,
    bailleur: bail.landlordId,
    gestionnaire: bail.agentId ?? null,
    locataire: bail.tenant?.phone ? normalizePhone(bail.tenant.phone) : bail.tenantId,
    bien: bail.propertyId ?? null,
    adresse: bail.property?.address ?? null,
    typeBien: bail.property?.propertyType ?? null,
    loyer: Number(bail.rentAmount),
    charges: Number(bail.chargesAmount ?? 0),
    depot: Number(bail.depositAmount ?? 0),
    avance: Number(bail.avanceLoyer ?? 0),
    debut: bail.startDate ? new Date(bail.startDate).toISOString().slice(0, 10) : null,
    dureeMois: bail.durationMonths ?? null,
    jourPaiement: bail.paymentDay ?? null,
    // Empreinte du bail complet figé (PDF) : la signature couvre tout le texte, pas seulement les termes.
    document: (bail.signatureContext as any)?.bail?.sha256 ?? null,
  };
  return createHash("sha256").update(JSON.stringify(termes)).digest("hex");
}

function estLocataire(bail: any, user: { id: string; phone?: string | null; email?: string | null }): boolean {
  if (bail.tenantId && bail.tenantId === user.id) return true;
  const tel = user.phone && bail.tenant?.phone && normalizePhone(user.phone) === normalizePhone(bail.tenant.phone);
  const mail = user.email && bail.tenant?.email && user.email.toLowerCase() === bail.tenant.email.toLowerCase();
  return Boolean(tel || mail);
}

function estPartieOuGestionnaire(bail: any, userId: string): boolean {
  return [bail.landlordId, bail.agentId, bail.property?.ownerUserId, bail.property?.managedByUserId].includes(userId);
}

async function chargerBail(prisma: any, leaseId: string) {
  const bail = await prisma.lease.findUnique({ where: { id: leaseId }, include: { tenant: true, property: true, bdq: true } });
  if (!bail || bail.deletedAt) throw new SignatureError("INTROUVABLE", "Contrat de bail introuvable.");
  return bail;
}

/**
 * Prépare l'envoi du code de signature. Renvoie le code en clair à l'appelant, qui
 * doit l'envoyer au locataire et à personne d'autre (voir `destinataire`).
 */
export async function preparerCodeSignature(
  prisma: any,
  p: { leaseId: string; demandeurId: string; demandeurRole?: string; /** Fige le bail complet (PDF) une fois les contrôles passés. */ figer?: () => Promise<unknown> }
) {
  let bail = await chargerBail(prisma, p.leaseId);
  const demandeur = await prisma.user.findUnique({ where: { id: p.demandeurId }, select: { id: true, phone: true, email: true } });
  if (!demandeur) throw new SignatureError("ACCES", "Compte introuvable.");
  const admin = ["ADMIN", "SUPER_ADMIN"].includes(p.demandeurRole || "");
  const locataire = estLocataire(bail, demandeur);
  const emetteur = estPartieOuGestionnaire(bail, demandeur.id);
  if (!locataire && !emetteur && !admin) throw new SignatureError("ACCES", "Vous n’êtes pas partie à ce bail.");
  if (bail.isSignedElectronically) throw new SignatureError("DEJA_SIGNE", "Ce bail est déjà signé.");
  if (STATUTS_FERMES.includes(bail.status)) throw new SignatureError("FERME", "Ce bail est clos : il ne peut plus être signé.");
  const propertyOwner = bail.property?.ownerUserId || bail.property?.ownerId;
  if (bail.tenantId && (bail.tenantId === bail.landlordId || (propertyOwner && bail.tenantId === propertyOwner))) {
    throw new SignatureError("AUTO_BAIL", "Une personne ne peut être locataire de sa propre maison.");
  }
  if (!bail.tenant || (!bail.tenant.phone && !bail.tenant.email)) {
    throw new SignatureError("SANS_LOCATAIRE", "Aucun locataire joignable sur ce bail : renseignez son téléphone avant l’envoi.");
  }
  if (!(Number(bail.rentAmount) > 0) || !bail.startDate) {
    throw new SignatureError("INCOMPLET", "Le bail est incomplet (loyer, date d’effet) : complétez-le avant l’envoi à la signature.");
  }

  if (p.figer) {
    await p.figer();
    bail = await chargerBail(prisma, p.leaseId);
  }

  const code = randomInt(100000, 1000000).toString();
  const empreinte = empreinteBail(bail);
  const expireLe = new Date(Date.now() + CODE_VALIDITE_HEURES * 3600 * 1000);
  const avant = (bail.signatureContext as any) || {};
  const contexte = { ...avant, empreinteEnvoyee: empreinte, envoyeLe: new Date().toISOString(), envoyePar: demandeur.id, premierEnvoiLe: avant.premierEnvoiLe || new Date().toISOString() };

  await prisma.$transaction(async (tx: any) => {
    await tx.lease.update({
      where: { id: bail.id },
      data: { signingOtpHash: hashCode(code), signingOtpExpiresAt: expireLe, signingOtpAttempts: 0, signatureContext: contexte },
    });
    // Le bailleur (ou son agence) qui envoie le bail à la signature s'engage sur ce contenu.
    if (emetteur && !locataire) {
      await tx.signatureElectronique.deleteMany({ where: { documentType: "BAIL", documentId: bail.id, signataireId: demandeur.id } });
      await tx.signatureElectronique.create({
        data: {
          documentType: "BAIL", documentId: bail.id, signataireId: demandeur.id,
          statut: "SIGNE", methode: "SESSION_AUTHENTIFIEE", hashDocument: empreinte, signedAt: new Date(),
        },
      });
    }
  });

  return {
    code,
    expireLe,
    bail,
    destinataire: {
      userId: bail.tenantId as string | null,
      nom: [bail.tenant.firstName, bail.tenant.lastName].filter(Boolean).join(" ").trim() || bail.bdq?.nomLocataireDeclare || "Locataire",
      telephone: bail.tenant.phone as string | null,
      email: bail.tenant.email as string | null,
    },
  };
}

/** Signature du bail par le locataire, avec le code reçu. */
export async function signerBail(prisma: any, p: { leaseId: string; signataireId: string; code: string; ip?: string; userAgent?: string }) {
  const code = String(p.code || "").replace(/\s/g, "");
  if (!/^\d{6}$/.test(code)) throw new SignatureError("CODE_FORMAT", "Saisissez le code à 6 chiffres reçu par SMS.");

  const bail = await chargerBail(prisma, p.leaseId);
  const user = await prisma.user.findUnique({ where: { id: p.signataireId }, select: { id: true, phone: true, email: true } });
  if (!user || !estLocataire(bail, user)) {
    throw new SignatureError("ACCES", "Seul le locataire désigné sur ce bail peut le signer. Connectez-vous avec son numéro.");
  }
  const propertyOwner = bail.property?.ownerUserId || bail.property?.ownerId;
  if (user.id === bail.landlordId || (propertyOwner && user.id === propertyOwner)) {
    throw new SignatureError("AUTO_BAIL", "Une personne ne peut être locataire de sa propre maison.");
  }
  if (bail.isSignedElectronically) throw new SignatureError("DEJA_SIGNE", "Ce bail est déjà signé.");
  if (STATUTS_FERMES.includes(bail.status)) throw new SignatureError("FERME", "Ce bail est clos : il ne peut plus être signé.");
  if (!bail.signingOtpHash) throw new SignatureError("SANS_CODE", "Aucun code en cours. Demandez un nouveau code.");
  if ((bail.signingOtpAttempts || 0) >= CODE_ESSAIS_MAX) {
    throw new SignatureError("BLOQUE", "Trop d’essais. Demandez un nouveau code.");
  }
  if (bail.signingOtpExpiresAt && new Date() > new Date(bail.signingOtpExpiresAt)) {
    throw new SignatureError("EXPIRE", "Ce code a expiré. Demandez un nouveau code.");
  }
  if (!memeHash(bail.signingOtpHash, hashCode(code))) {
    const essais = (bail.signingOtpAttempts || 0) + 1;
    await prisma.lease.update({ where: { id: bail.id }, data: { signingOtpAttempts: essais } });
    const reste = CODE_ESSAIS_MAX - essais;
    throw new SignatureError("CODE_FAUX", reste > 0 ? `Code incorrect. Il vous reste ${reste} essai${reste > 1 ? "s" : ""}.` : "Code incorrect. Demandez un nouveau code.");
  }

  const empreinte = empreinteBail(bail);
  const envoyee = (bail.signatureContext as any)?.empreinteEnvoyee;
  if (envoyee && envoyee !== empreinte) {
    throw new SignatureError("MODIFIE", "Le bail a été modifié depuis l’envoi du code. Demandez un nouveau code pour signer la version à jour.");
  }

  const maintenant = new Date();
  const express = bail.modeCreation === "QUITTANCE_EXPRESS";
  await prisma.$transaction(async (tx: any) => {
    await tx.lease.update({
      where: { id: bail.id },
      data: {
        tenantId: user.id,
        isSignedElectronically: true,
        signedAt: maintenant,
        signingOtpHash: null,
        signingOtpExpiresAt: null,
        signingOtpAttempts: 0,
        status: "ACTIVE",
        confirmationLocataireAt: bail.confirmationLocataireAt || maintenant,
        // Un bail né d'une quittance express devient un bail écrit et signé.
        ...(express ? { typeBail: "ECRIT" } : {}),
        signatureContext: {
          ...((bail.signatureContext as any) || {}),
          empreinteSignee: empreinte, signeLe: maintenant.toISOString(), signePar: user.id, methode: "OTP_SMS",
          ip: p.ip || null, userAgent: p.userAgent || null,
        },
      },
    });
    await tx.signatureElectronique.deleteMany({ where: { documentType: "BAIL", documentId: bail.id, signataireId: user.id } });
    await tx.signatureElectronique.create({
      data: {
        documentType: "BAIL", documentId: bail.id, signataireId: user.id,
        statut: "SIGNE", methode: "OTP_SMS", otpHash: bail.signingOtpHash, hashDocument: empreinte,
        ipAddress: p.ip || null, userAgent: (p.userAgent || "").slice(0, 300) || null, signedAt: maintenant,
      },
    });
    if (bail.bdq) {
      await tx.bailDeclaratif.update({
        where: { id: bail.bdq.id },
        data: { statut: "FORMALISE", confirmationLocataire: true, confirmationAt: maintenant, locataireId: user.id },
      });
    }
    if (bail.propertyId) {
      await tx.property.update({ where: { id: bail.propertyId }, data: { status: "rented" } });
    }
  });

  return { leaseId: bail.id as string, typeBail: (express ? "ECRIT" : bail.typeBail) as string, empreinte, signeLe: maintenant };
}

/** Preuves de signature d'un bail (bailleur ou agence, puis locataire). */
export async function preuvesSignature(prisma: any, leaseId: string) {
  return prisma.signatureElectronique.findMany({
    where: { documentType: "BAIL", documentId: leaseId, statut: "SIGNE" },
    orderBy: { signedAt: "asc" },
    select: { signataireId: true, methode: true, hashDocument: true, signedAt: true, ipAddress: true },
  });
}
