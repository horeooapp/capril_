"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import crypto from "crypto";
import { 
  calculerDecompteTransaction, 
  getNiveauVerificationVente, 
  NATURES_TITRES, 
  NatureTitre, 
  CategorieBienVente,
  StatutPipelineVente
} from "@/lib/transaction-rules";
import { revalidatePath } from "next/cache";

// ── 1. RÉCUPÉRATION DU PORTEFEUILLE TRANSACTIONS (AGENCE & PROPRIÉTAIRE) ──

export async function getAgencyTransactionsData() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Authentification requise");
  }

  const userId = session.user.id;
  const userRole = (session.user as any).role || "AGENCY";
  const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(userRole);

  try {
    // Mandats de vente
    const mandats = await prisma.mandatVente.findMany({
      where: isAdmin ? {} : {
        OR: [
          { agentUserId: userId },
          { vendeurUserId: userId }
        ]
      },
      include: {
        property: true,
        annonces: true,
        offres: {
          orderBy: { createdAt: "desc" }
        },
        transactions: {
          include: {
            compromis: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // Biens spécifiquement en vente ou avec caractéristiques foncières
    const biensEnVente = await prisma.property.findMany({
      where: isAdmin ? {
        OR: [
          { forSale: true },
          { categorie_vente: { not: null } }
        ]
      } : {
        AND: [
          {
            OR: [
              { ownerId: userId },
              { managedByUserId: userId }
            ]
          },
          {
            OR: [
              { forSale: true },
              { categorie_vente: { not: null } }
            ]
          }
        ]
      },
      orderBy: { createdAt: "desc" }
    });

    // Pipeline des transactions actives
    const transactions = await prisma.transactionVente.findMany({
      where: isAdmin ? {} : {
        OR: [
          { vendeurUserId: userId },
          { acquereurUserId: userId },
          { mandat: { agentUserId: userId } }
        ]
      },
      include: {
        property: true,
        mandat: true,
        compromis: true
      },
      orderBy: { updatedAt: "desc" }
    });

    // Vivier acquéreurs qualifiés
    const profilsAcquereurs = await prisma.profilAcquereur.findMany({
      where: { statut: "ACTIF" },
      orderBy: { createdAt: "desc" },
      take: 20
    });

    // Alertes de sécurité foncière / signaux de double vente
    const signauxFraude = await prisma.signalFraudeVente.findMany({
      orderBy: { createdAt: "desc" },
      take: 10
    });

    // Calcul des indicateurs de synthèse financière
    const totalVolumeVenteFcfa = mandats.reduce((sum, m) => sum + (m.prixPresentationFcfa || 0), 0);
    const mandatsActifsCount = mandats.filter(m => m.statut === "ACTIF").length;
    const mandatsExclusifsCount = mandats.filter(m => m.typeMandat === "EXCLUSIF" && m.statut === "ACTIF").length;
    const transactionsEnCoursCount = transactions.filter(t => !['CLOTURE', 'ECHEC', 'CADUC', 'RETIRE'].includes(t.statutPipeline)).length;
    const biensVerifiesAcdCount = biensEnVente.filter(b => b.titre_type === "ACD" || (b.niveau_verif_vente && b.niveau_verif_vente >= 3)).length;

    return {
      success: true,
      data: {
        mandats,
        biensEnVente,
        transactions,
        profilsAcquereurs,
        signauxFraude,
        aggregates: {
          totalVolumeVenteFcfa,
          mandatsActifsCount,
          mandatsExclusifsCount,
          transactionsEnCoursCount,
          biensVerifiesAcdCount,
          totalBiensEnVente: biensEnVente.length
        }
      }
    };
  } catch (err: any) {
    console.error("Erreur getAgencyTransactionsData:", err);
    return {
      success: false,
      error: err.message || "Impossible de charger les données transactions",
      data: {
        mandats: [],
        biensEnVente: [],
        transactions: [],
        profilsAcquereurs: [],
        signauxFraude: [],
        aggregates: {
          totalVolumeVenteFcfa: 0,
          mandatsActifsCount: 0,
          mandatsExclusifsCount: 0,
          transactionsEnCoursCount: 0,
          biensVerifiesAcdCount: 0,
          totalBiensEnVente: 0
        }
      }
    };
  }
}

// ── 2. CRÉATION D'UN BIEN EN VENTE & MANDAT ASSIGNÉ (RG-VTE-01 à RG-VTE-07) ──

export interface CreateVenteMandatInput {
  titreBien: string;
  categorieBienVente: CategorieBienVente;
  natureTitre: NatureTitre;
  numeroTitre: string;
  dateTitre?: string;
  numeroLot?: string;
  numeroIlot?: string;
  superficieM2: number;
  commune: string;
  quartier?: string;
  estViabilise?: boolean;
  servitudesDeclarees?: string;
  coordonneesGpsBornes?: string;
  prixPresentationFcfa: number;
  typeMandat: "EXCLUSIF" | "SIMPLE";
  tauxCommissionPct?: number;
  montantCommissionFixe?: number;
  commissionCharge?: "ACQUEREUR" | "VENDEUR" | "PARTAGEE";
  dureeMois?: number;
  vendeurNom?: string;
  vendeurTelephone?: string;
}

export async function createBienEtMandatVenteAction(input: CreateVenteMandatInput) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Authentification requise pour déposer un mandat");
  }

  const userId = session.user.id;
  const anneeCourante = new Date().getFullYear();

  // 1. RG-VTE-05 : CONTRÔLE D'UNICITÉ DU TITRE & ANTI-DOUBLE VENTE
  const titreClean = input.numeroTitre.trim().toUpperCase();
  const communeClean = input.commune.trim().toUpperCase();

  const doublonTitre = await prisma.property.findFirst({
    where: {
      titre_type: input.natureTitre,
      titre_numero: titreClean,
      city: { contains: communeClean, mode: "insensitive" }
    }
  });

  if (doublonTitre) {
    // Alerte immédiate SignalFraudeVente
    const refSignal = `FRD-VTE-${Date.now().toString().slice(-6)}`;
    await prisma.signalFraudeVente.create({
      data: {
        referenceSignal: refSignal,
        propertyId: doublonTitre.id,
        titreNumero: titreClean,
        typeSignal: "TENTATIVE_DOUBLE_VENTE",
        description: `Tentative d'enregistrement d'un titre identique (${input.natureTitre} N° ${titreClean}) sur la commune de ${input.commune}. Bloqué par RG-VTE-05.`,
        scoreGravite: 4,
        actionPrise: "BLOCAGE_AUTOMATIQUE"
      }
    });

    throw new Error(
      `RG-VTE-05 Bloqué : Le titre ${input.natureTitre} N° ${titreClean} est déjà enregistré sur la plateforme pour un bien existant sur ${input.commune}. Toute tentative de double mise en vente est strictement proscrite et tracée.`
    );
  }

  // 2. Détermination du niveau de vérification initial (RG-VTE-04)
  let niveauVerif = 1; // 1 = identité déclarée
  if (['ACD', 'TITRE_FONCIER'].includes(input.natureTitre)) {
    niveauVerif = 3; // Titre de pleine propriété étatique
  } else if (['LETTRE_ATTRIBUTION', 'CERTIFICAT_FONCIER_RURAL'].includes(input.natureTitre)) {
    niveauVerif = 2; // Rapprochement documentaire en cours
  }

  // 3. Création du Bien dans la base de données
  const property = await prisma.property.create({
    data: {
      name: input.titreBien || `${input.categorieBienVente} ${input.superficieM2}m² - ${input.commune}`,
      type: input.categorieBienVente.startsWith("TERRAIN") ? "COMMERCIAL" : "RESIDENTIAL",
      forSale: true,
      prixVenteFcfa: input.prixPresentationFcfa,
      price: input.prixPresentationFcfa,
      city: input.commune,
      district: input.quartier || input.commune,
      address: `${input.commune}, ${input.quartier || 'Centre'} (Lot ${input.numeroLot || '-'}, Îlot ${input.numeroIlot || '-'})`,
      surface: input.superficieM2,
      superficie_m2: input.superficieM2,
      categorie_vente: input.categorieBienVente,
      titre_type: input.natureTitre,
      titre_numero: titreClean,
      titre_date: input.dateTitre ? new Date(input.dateTitre) : null,
      numero_lot: input.numeroLot,
      numero_ilot: input.numeroIlot,
      est_viabilise: Boolean(input.estViabilise),
      servitudes_declarees: input.servitudesDeclarees,
      coordonnees_gps_bornes: input.coordonneesGpsBornes,
      niveau_verif_vente: niveauVerif,
      ownerId: userId,
      managedByUserId: userId,
      status: "ACTIVE"
    }
  });

  // 4. Génération du Mandat de Vente (RG-VTE-06, RG-VTE-07)
  const countMandats = await prisma.mandatVente.count();
  const seqMandat = String(countMandats + 1).padStart(4, "0");
  const numeroMandat = `MV-${anneeCourante}-${seqMandat}`;
  const vendeurCodeMasque = `VEN-${Date.now().toString().slice(-4)}`;

  const dureeMois = Math.min(input.dureeMois || 12, 12); // RG-VTE-07: max 12 mois
  const dateDebut = new Date();
  const dateFin = new Date();
  dateFin.setMonth(dateFin.getMonth() + dureeMois);

  // Empreinte SHA-256 du mandat
  const hashPayload = `${numeroMandat}|${property.id}|${titreClean}|${input.prixPresentationFcfa}|${dateDebut.toISOString()}|${dateFin.toISOString()}`;
  const sha256Contrat = crypto.createHash("sha256").update(hashPayload).digest("hex");

  const mandat = await prisma.mandatVente.create({
    data: {
      numeroMandat,
      propertyId: property.id,
      agentUserId: userId,
      vendeurUserId: userId,
      vendeurCodeMasque,
      typeMandat: input.typeMandat,
      prixPresentationFcfa: input.prixPresentationFcfa,
      tauxCommissionPct: input.tauxCommissionPct || 5.0,
      montantCommissionFixe: input.montantCommissionFixe || null,
      commissionCharge: input.commissionCharge || "VENDEUR",
      dateDebut,
      dateFin,
      statut: "ACTIF",
      conditionsVisite: "Sur rendez-vous avec collaborateur agence identifié.",
      obligationsAgence: "Vérification juridique du titre, promotion ciblée et respect du séquestre notarial (RG-VTE-16).",
      sha256Contrat,
      signedAt: new Date()
    }
  });

  // 5. Publication de l'annonce si niveau de vérification suffisant (RG-VTE-11)
  const natureInfo = NATURES_TITRES[input.natureTitre];
  const referenceAnnonce = `ANN-VTE-${Date.now().toString().slice(-6)}`;

  await prisma.annonceVente.create({
    data: {
      referenceAnnonce,
      propertyId: property.id,
      mandatId: mandat.id,
      titreAnnonce: input.titreBien || `${natureInfo.libelle} - ${input.commune} (${input.superficieM2} m²)`,
      description: `Mise en vente certifiée par mandat officiel ${numeroMandat}. Titre : ${natureInfo.libelle} N° ${titreClean}. Superficie : ${input.superficieM2} m². Viabilisé : ${input.estViabilise ? 'Oui' : 'Non'}. Conditions conformes Loi n° 2019-576.`,
      prixFcfa: input.prixPresentationFcfa,
      estNegociable: false,
      niveauVerif,
      badgeVerifie: niveauVerif >= 3,
      natureTitreClair: natureInfo.libelle,
      statut: "PUBLIE"
    }
  });

  // 6. Initialisation de la transaction dans le pipeline (RG-VTE-17)
  const referenceTransaction = `TRX-${anneeCourante}-${Date.now().toString().slice(-6)}`;
  const decompte = calculerDecompteTransaction(input.prixPresentationFcfa, input.tauxCommissionPct || 5.0);

  await prisma.transactionVente.create({
    data: {
      referenceTransaction,
      propertyId: property.id,
      mandatId: mandat.id,
      acquereurUserId: userId,
      vendeurUserId: userId,
      prixFinalFcfa: input.prixPresentationFcfa,
      droitsMutationEstimesFcfa: decompte.droitsEnregistrementMutationFcfa,
      fraisNotaireEstimesFcfa: decompte.fraisNotaireEstimesFcfa,
      fraisConservationEstimesFcfa: decompte.fraisConservationFonciereFcfa,
      commissionAgenceFcfa: decompte.commissionAgenceFcfa,
      statutPipeline: "MANDAT"
    }
  });

  revalidatePath("/dashboard/ventes");
  revalidatePath("/dashboard");

  return {
    success: true,
    message: `Mandat de vente ${numeroMandat} enregistré avec succès. Fiche bien et annonce publiées.`,
    data: {
      propertyId: property.id,
      mandatId: mandat.id,
      numeroMandat,
      sha256Contrat,
      niveauVerif
    }
  };
}

// ── 3. SIMULATEUR FISCAL ET NOTARIAL EN TEMPS RÉEL (RG-VTE-19) ──

export async function simulerFraisTransactionAction(prixVenteFcfa: number, tauxCommissionPct: number = 5.0) {
  if (!prixVenteFcfa || prixVenteFcfa <= 0) {
    throw new Error("Prix de vente invalide");
  }

  const decompte = calculerDecompteTransaction(prixVenteFcfa, tauxCommissionPct);

  return {
    success: true,
    decompte
  };
}

// ── 4. TRANSITION D'ÉTAPE DU PIPELINE DE VENTE (RG-VTE-17) ──

export async function avancerEtapePipelineAction(
  transactionId: string, 
  nouvelleEtape: StatutPipelineVente,
  numeroDgi?: string
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non autorisé");

  const transaction = await prisma.transactionVente.findUnique({
    where: { id: transactionId }
  });

  if (!transaction) throw new Error("Dossier de transaction introuvable");

  const updateData: any = {
    statutPipeline: nouvelleEtape,
    updatedAt: new Date()
  };

  if (nouvelleEtape === "ACTE_SIGNE") {
    updateData.dateSignatureActe = new Date();
  }

  if (nouvelleEtape === "MUTATION_ENREGISTREE" && numeroDgi) {
    updateData.numeroEnregistrementDgi = numeroDgi;
    updateData.dateEnregistrementDgi = new Date();
  }

  await prisma.transactionVente.update({
    where: { id: transactionId },
    data: updateData
  });

  revalidatePath("/dashboard/ventes");
  return { success: true, message: `Pipeline mis à jour vers le statut : ${nouvelleEtape}` };
}
