/**
 * QAPRIL — Quittance express
 *
 * Le bailleur saisit quatre informations (nom, téléphone, montant, quartier).
 * La quittance part tout de suite ; le bien et le bail sont créés à l'état
 * provisoire et se complètent ensuite, étape par étape.
 *
 * Ce fichier ne contient que la logique métier (aucune dépendance à la session
 * ni à Next.js) afin de pouvoir être testé directement contre une base.
 */
import { createHash, randomUUID } from "crypto";
import { normalizePhone } from "@/lib/phone";

export interface QuittanceExpressInput {
  nomLocataire: string;
  telephone: string;
  montant: number;
  quartier: string;
  /** Mois concerné au format AAAA-MM. Par défaut : mois en cours. */
  mois?: string;
  /** Obligatoire : comment le bailleur a été payé (voir MODES_PAIEMENT). */
  modePaiement: string;
  /** Référence de la transaction (Mobile Money, virement, chèque). Facultative. */
  referencePaiement?: string;
  email?: string;
}

export type EtapeDossier = "QUITTANCE_EMISE" | "BIEN_COMPLETE" | "BAIL_COMPLETE" | "BAIL_SIGNE" | "BAIL_ENREGISTRE";

export const ETAPES: { code: EtapeDossier; libelle: string; action: string }[] = [
  { code: "QUITTANCE_EMISE", libelle: "Quittance émise", action: "" },
  { code: "BIEN_COMPLETE", libelle: "Logement décrit", action: "Compléter le logement (adresse, type)" },
  { code: "BAIL_COMPLETE", libelle: "Bail renseigné", action: "Compléter le bail (date d’effet, durée, dépôt)" },
  { code: "BAIL_SIGNE", libelle: "Bail signé par le locataire", action: "Faire signer le bail par le locataire" },
  { code: "BAIL_ENREGISTRE", libelle: "Bail enregistré", action: "Enregistrer le bail" },
];

import { MODES_PAIEMENT, ALIAS_MODES, libelleModePaiement } from "@/lib/quittance-express-modes";
export { MODES_PAIEMENT, libelleModePaiement };

export class QuittanceExpressError extends Error {
  constructor(public code: string, message: string) {
    super(message);
  }
}

const MOIS_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

export function moisCourant(d: Date = new Date()): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function ref(prefix: string, zone?: string): string {
  const alea = randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase();
  const z = zone ? `-${zone.normalize("NFD").replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase() || "XXX"}` : "";
  return `${prefix}${z}-${new Date().getUTCFullYear()}-${alea}`;
}

/** Empreinte de la quittance : locataire, bail, montant, mois, date d'émission, émetteur (RG-QUI-02). */
export function empreinteQuittance(q: {
  locataireId: string; leaseId: string; montant: number; mois: string; emiseLe: Date; emetteurId: string; reference: string;
}): string {
  const canon = [q.reference, q.locataireId, q.leaseId, q.montant, q.mois, q.emiseLe.toISOString(), q.emetteurId].join("|");
  return createHash("sha256").update(canon).digest("hex");
}

export function validerSaisie(input: QuittanceExpressInput) {
  const nom = (input.nomLocataire || "").trim().replace(/\s+/g, " ");
  if (nom.length < 2) throw new QuittanceExpressError("NOM", "Indiquez le nom du locataire.");
  const telephone = normalizePhone(input.telephone);
  if (!telephone || telephone.replace(/\D/g, "").length < 10) {
    throw new QuittanceExpressError("TELEPHONE", "Indiquez un numéro de téléphone valide : c’est par lui que le locataire reçoit sa quittance.");
  }
  const montant = Math.round(Number(input.montant));
  if (!Number.isFinite(montant) || montant <= 0) throw new QuittanceExpressError("MONTANT", "Indiquez le montant payé.");
  if (montant > 50_000_000) throw new QuittanceExpressError("MONTANT", "Ce montant paraît anormalement élevé. Vérifiez la saisie.");
  const quartier = (input.quartier || "").trim().replace(/\s+/g, " ");
  if (quartier.length < 2) throw new QuittanceExpressError("QUARTIER", "Indiquez le quartier du logement.");
  const mois = input.mois || moisCourant();
  if (!MOIS_RE.test(mois)) throw new QuittanceExpressError("MOIS", "Mois invalide.");
  const brut = String(input.modePaiement || "").toUpperCase();
  const modePaiement = ALIAS_MODES[brut] || brut;
  if (!MODES_PAIEMENT.some((m) => m.code === modePaiement)) {
    throw new QuittanceExpressError("MODE", "Indiquez comment vous avez été payé : Wave, Orange Money, espèces…");
  }
  const referencePaiement = (input.referencePaiement || "").trim().replace(/\s+/g, " ").slice(0, 40) || undefined;
  const email = (input.email || "").trim().toLowerCase() || undefined;
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new QuittanceExpressError("EMAIL", "Adresse e-mail invalide.");
  return { nom, telephone, montant, quartier, mois, modePaiement, referencePaiement, email };
}

/**
 * Émet la quittance et, la première fois, crée le locataire, le bien provisoire,
 * le bail provisoire et la déclaration associée. Tout se fait dans une seule
 * transaction : soit tout est créé, soit rien.
 */
export async function emettreQuittanceExpress(prisma: any, bailleurId: string, input: QuittanceExpressInput) {
  const s = validerSaisie(input);

  return prisma.$transaction(async (tx: any) => {
    const bailleur = await tx.user.findUnique({ where: { id: bailleurId }, select: { id: true, phone: true, role: true } });
    if (!bailleur) throw new QuittanceExpressError("BAILLEUR", "Compte bailleur introuvable.");
    if (bailleur.phone && normalizePhone(bailleur.phone) === s.telephone) {
      throw new QuittanceExpressError("TELEPHONE", "Le numéro du locataire ne peut pas être le vôtre.");
    }

    // 1. Locataire : retrouvé par son numéro, sinon créé.
    let locataire = await tx.user.findUnique({ where: { phone: s.telephone } });
    let locataireCree = false;
    if (!locataire) {
      const [prenom, ...reste] = s.nom.split(" ");
      locataire = await tx.user.create({
        data: {
          phone: s.telephone,
          firstName: reste.length ? prenom : "",
          lastName: reste.length ? reste.join(" ") : prenom,
          role: "TENANT",
          status: "INVITED",
          onboardingComplete: false,
        },
      });
      locataireCree = true;
    }

    // 2. Bail : on réutilise le bail en cours entre ces deux personnes s'il existe.
    let bail = await tx.lease.findFirst({
      where: {
        landlordId: bailleurId,
        tenantId: locataire.id,
        deletedAt: null,
        status: { in: ["ACTIVE", "ACTIVE_DECLARATIF", "LOYER_IMPAYE", "MISE_EN_DEMEURE", "CLEMENCE_EN_COURS"] },
      },
      orderBy: { createdAt: "desc" },
    });
    let dossierCree = false;
    let bdq: any = null;

    if (!bail) {
      const bien = await tx.property.create({
        data: {
          propertyCode: ref("EXP", s.quartier),
          ownerUserId: bailleurId,
          propertyType: "A_PRECISER",
          typeStructure: "INDEPENDANT",
          commune: s.quartier,
          quartier: s.quartier,
          address: `Logement — ${s.quartier}`,
          name: `Logement de ${s.nom}`,
          declaredRentFcfa: s.montant,
          status: "ACTIVE",
          confirmation: "PROVISOIRE",
        },
      });

      const [annee, moisNum] = s.mois.split("-").map(Number);
      bail = await tx.lease.create({
        data: {
          leaseReference: ref("QEX"),
          propertyId: bien.id,
          landlordId: bailleurId,
          // Agence : elle émet pour un propriétaire qui sera renseigné en complétant le dossier.
          agentId: bailleur.role === "AGENCY" ? bailleurId : null,
          tenantId: locataire.id,
          typeBail: "DECLARATIF_BDQ",
          status: "ACTIVE_DECLARATIF",
          modeCreation: "QUITTANCE_EXPRESS",
          startDate: new Date(Date.UTC(annee, moisNum - 1, 1)),
          durationMonths: 0, // 0 = durée non renseignée (convention déjà utilisée par le bail déclaratif)
          rentAmount: s.montant,
          chargesAmount: 0,
          paymentDay: 5,
          adossementStatut: "PROPOSE",
          bienProvisoireId: bien.id,
          designationDeclaree: { quartier: s.quartier },
          draftData: { quittanceExpress: true, creeLe: new Date().toISOString() },
        },
      });

      bdq = await tx.bailDeclaratif.create({
        data: {
          bailleurId,
          locataireId: locataire.id,
          propertyId: bien.id,
          nomLocataireDeclare: s.nom,
          telephoneLocataire: s.telephone,
          descriptionLogement: `Logement — ${s.quartier}`,
          adresseLibre: s.quartier,
          loyerDeclareMensuel: s.montant,
          dateEntreeEstimee: bail.startDate,
          precisionDateEntree: "APPROXIMATIVE",
          sourceCreation: "QUITTANCE_EXPRESS",
          statut: "PENDING_LOCATAIRE",
          hashDeclaration: createHash("sha256").update([bailleurId, s.telephone, s.montant, s.quartier].join("|")).digest("hex"),
          qrToken: randomUUID(),
          bailFormelId: bail.id,
        },
      });
      dossierCree = true;
    }

    // 3. Quittance : une seule par bail et par mois.
    const existante = await tx.receipt.findUnique({
      where: { leaseId_periodMonth: { leaseId: bail.id, periodMonth: s.mois } },
    });
    if (existante && existante.status === "PAID") {
      throw new QuittanceExpressError("DEJA_EMISE", `Une quittance (${existante.receiptRef}) existe déjà pour ce locataire sur ${s.mois}.`);
    }

    const emiseLe = new Date();
    const reference = `REC-${s.mois}-${randomUUID().slice(0, 6).toUpperCase()}`;
    const empreinte = empreinteQuittance({
      reference, locataireId: locataire.id, leaseId: bail.id, montant: s.montant, mois: s.mois, emiseLe, emetteurId: bailleurId,
    });
    const dossierComplet = bail.status === "ACTIVE" && bail.isSignedElectronically === true;
    const corps = {
      receiptRef: reference,
      rentAmount: s.montant,
      chargesAmount: 0,
      totalAmount: s.montant,
      paymentMethod: s.modePaiement,
      paymentRef: s.referencePaiement ?? null,
      paidAt: emiseLe,
      dateEncaissement: emiseLe,
      status: "PAID",
      declarative: !dossierComplet,
      valeurProbanteActive: dossierComplet,
      qrToken: randomUUID(),
      receiptHash: empreinte,
      sha256Hash: empreinte,
      sha256CalculeLe: emiseLe,
      moisConcerne: s.mois,
    };
    const quittance = existante
      ? await tx.receipt.update({ where: { id: existante.id }, data: corps })
      : await tx.receipt.create({ data: { ...corps, leaseId: bail.id, periodMonth: s.mois } });

    return { quittance, bail, locataire, bdq, locataireCree, dossierCree, saisie: s };
  });
}

/** État d'avancement du dossier d'un bail né d'une quittance express. */
export function etatDossier(d: { bail: any; bien: any; bdq?: any; nbQuittances: number }) {
  const { bail, bien } = d;
  const fait: Record<EtapeDossier, boolean> = {
    QUITTANCE_EMISE: d.nbQuittances > 0,
    BIEN_COMPLETE: !!bien && bien.propertyType !== "A_PRECISER",
    BAIL_COMPLETE: !!bail && (bail.durationMonths ?? 0) > 0,
    BAIL_SIGNE: !!bail?.isSignedElectronically,
    BAIL_ENREGISTRE: ["ENREGISTRE", "PAYE_CONFIRME"].includes(bail?.statutFiscal) || !!bail?.dgiReference,
  };
  const etapes = ETAPES.map((e) => ({ ...e, fait: fait[e.code] }));
  const nbFaits = etapes.filter((e) => e.fait).length;
  const prochaine = etapes.find((e) => !e.fait) || null;
  return { etapes, pourcentage: Math.round((nbFaits / etapes.length) * 100), prochaine, complet: !prochaine };
}

export function messageQuittance(p: { nomLocataire: string; montant: number; mois: string; lien: string }): string {
  const m = String(p.montant).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const nom = p.nomLocataire.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return `QAPRIL : ${nom}, votre quittance de loyer ${p.mois} (${m} F) est disponible : ${p.lien}`;
}

/** SMS sans accent : un accent fait passer le message en UCS-2 (70 caractères par segment au lieu de 160). */
export function messageRelance(p: { nomLocataire: string; pourcentage: number; action: string; lien: string }): string {
  const sansAccent = (t: string) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[’]/g, "'");
  return sansAccent(`QAPRIL : dossier de ${p.nomLocataire} complet a ${p.pourcentage} %. A faire : ${p.action}. ${p.lien}`);
}
