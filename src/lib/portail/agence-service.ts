// ══════════════════════════════════════════════════════════════════════════════
// QAPRIL — Service Agence du Portail (ADD-26 §3 — RG-AGE-01)
// Publication limitée au périmètre de mandat & Tableau de bord
// ══════════════════════════════════════════════════════════════════════════════

import { prisma } from "@/lib/prisma";

export interface AnnoncePublicationInput {
  logementId: string;
  titre: string;
  description: string;
  loyerDemande: number;
  charges?: number;
  photosUrls?: string[];
  criteres?: Record<string, any>;
}

/**
 * RG-AGE-01 : Vérifie qu'une agence détient un mandat ACTIF sur le bien avant publication
 */
export async function verifierMandatAgence(agenceId: string, logementId: string): Promise<{ valide: boolean; motif?: string; mandateRef?: string }> {
  // 1. Vérifier si l'agence existe et est active
  const agence = await prisma.user.findUnique({
    where: { id: agenceId },
    select: { id: true, role: true, status: true, isCertified: true }
  });

  if (!agence) {
    return { valide: false, motif: "Agence introuvable." };
  }

  if (agence.status !== "ACTIVE") {
    return { valide: false, motif: "Le compte de l'agence est suspendu ou inactif." };
  }

  // 2. Vérifier si le bien appartient directement à l'utilisateur (s'il est propriétaire-gestionnaire)
  const propriete = await prisma.property.findUnique({
    where: { id: logementId },
    select: { id: true, ownerUserId: true, managedByUserId: true, status: true }
  });

  if (!propriete) {
    return { valide: false, motif: "Bien immobilier introuvable." };
  }

  // Si l'agence est propriétaire directe ou gestionnaire assignée
  if (propriete.ownerUserId === agenceId || propriete.managedByUserId === agenceId) {
    return { valide: true, mandateRef: "DIRECT_OWNERSHIP_OR_MANAGEMENT" };
  }

  // 3. RG-AGE-01 STRICT : Vérifier le mandat dans la table Mandate
  const mandat = await prisma.mandate.findFirst({
    where: {
      propertyId: logementId,
      agentUserId: agenceId,
      status: "ACTIVE"
    },
    select: { id: true, mandateRef: true, endDate: true }
  });

  if (!mandat) {
    // Vérification de secours dans MandatGestionBien au cas où le mandat y serait stocké
    const mandatGestion = await prisma.mandatGestionBien.findFirst({
      where: {
        bienId: logementId,
        mandat: {
          agenceId: agenceId,
          statut: "ACTIF"
        }
      },
      select: { id: true }
    });

    if (!mandatGestion) {
      return { 
        valide: false, 
        motif: "RG-AGE-01 Violation : Publication bloquée. L'agence ne détient aucun mandat actif sur ce bien dans QAPRIL." 
      };
    }
    return { valide: true, mandateRef: `MGB_${mandatGestion.id}` };
  }

  // Vérifier si le mandat est expiré
  if (mandat.endDate && new Date(mandat.endDate) < new Date()) {
    return { valide: false, motif: `Le mandat ${mandat.mandateRef} est expiré depuis le ${mandat.endDate.toLocaleDateString("fr-FR")}.` };
  }

  return { valide: true, mandateRef: mandat.mandateRef };
}

/**
 * Publie ou met à jour une annonce après contrôle du mandat (RG-AGE-01)
 */
export async function publierAnnonceAgence(agenceId: string, input: AnnoncePublicationInput) {
  // Contrôle strict du mandat
  const check = await verifierMandatAgence(agenceId, input.logementId);
  if (!check.valide) {
    throw new Error(check.motif || "Publication non autorisée : Mandat manquant.");
  }

  // Application du label de confiance si l'agence est certifiée
  const agence = await prisma.user.findUnique({
    where: { id: agenceId },
    select: { isCertified: true, kycLevel: true, companyRegNumber: true }
  });

  const labelConfiance = Boolean(agence?.isCertified || (agence?.kycLevel && agence.kycLevel >= 2) || agence?.companyRegNumber);

  const diffusionsMetadata = {
    label_confiance: labelConfiance,
    mandate_ref: check.mandateRef,
    publie_par_agence_agreee: true,
    historique_prix: [{ date: new Date().toISOString(), prix: input.loyerDemande }],
    signalements_count: 0,
    signalements: []
  };

  // Vérifier s'il existe déjà une annonce active pour ce bien (Détection doublon par logementId §4)
  const annonceExistante = await prisma.annonce.findFirst({
    where: {
      logementId: input.logementId,
      statut: { in: ["ACTIVE", "PUBLIEE", "active", "SOUS_OPTION"] }
    }
  });

  if (annonceExistante) {
    // Mise à jour de l'annonce existante
    const existingDiff: any = annonceExistante.diffusions || {};
    const historiquePrix = Array.isArray(existingDiff.historique_prix) ? existingDiff.historique_prix : [];
    
    if (annonceExistante.loyerDemande !== input.loyerDemande) {
      historiquePrix.push({ date: new Date().toISOString(), prix: input.loyerDemande });
    }

    return await prisma.annonce.update({
      where: { id: annonceExistante.id },
      data: {
        titre: input.titre,
        description: input.description,
        loyerDemande: input.loyerDemande,
        charges: input.charges || 0,
        photosUrls: input.photosUrls || annonceExistante.photosUrls,
        criteres: input.criteres || annonceExistante.criteres || {},
        statut: "PUBLIEE",
        publieeAt: annonceExistante.publieeAt || new Date(),
        diffusions: {
          ...existingDiff,
          ...diffusionsMetadata,
          historique_prix: historiquePrix
        }
      }
    });
  }

  // Création d'une nouvelle annonce
  return await prisma.annonce.create({
    data: {
      logementId: input.logementId,
      agenceId: agenceId,
      titre: input.titre,
      description: input.description,
      loyerDemande: input.loyerDemande,
      charges: input.charges || 0,
      photosUrls: input.photosUrls || [],
      criteres: input.criteres || {},
      statut: "PUBLIEE",
      publieeAt: new Date(),
      diffusions: diffusionsMetadata
    }
  });
}

/**
 * Récupère le tableau de bord agence (§3.2)
 */
export async function getDashboardAgence(agenceId: string) {
  const annonces = await prisma.annonce.findMany({
    where: { agenceId },
    include: {
      logement: {
        select: { propertyCode: true, propertyType: true, commune: true, address: true }
      }
    },
    orderBy: { publieeAt: "desc" }
  });

  let actives = 0;
  let suspendues = 0;
  let louees = 0;
  let sousOption = 0;
  let totalContacts = 0;
  let totalVisites = 0;
  let totalCandidatures = 0;

  const annoncesDetaillees = annonces.map((a: any) => {
    const st = (a.statut || "").toUpperCase();
    if (st === "ACTIVE" || st === "PUBLIEE") actives++;
    else if (st === "SUSPUNDEE" || st === "ARCHIVEE") suspendues++;
    else if (st === "LOUEE") louees++;
    else if (st === "SOUS_OPTION") sousOption++;

    totalContacts += (a.nbContacts || 0);
    totalVisites += (a.nbVisites || 0);
    totalCandidatures += (a.nbCandidatures || 0);

    return {
      id: a.id,
      titre: a.titre,
      statut: a.statut,
      loyer: Number(a.loyerDemande),
      commune: a.logement?.commune,
      code_bien: a.logement?.propertyCode,
      nb_contacts: a.nbContacts || 0,
      nb_visites: a.nbVisites || 0,
      nb_candidatures: a.nbCandidatures || 0,
      publiee_at: a.publieeAt
    };
  });

  // Tri par annonces les plus vues/contactées
  const topAnnonces = [...annoncesDetaillees].sort((x, y) => y.nb_contacts - x.nb_contacts).slice(0, 5);

  return {
    synthese: {
      total_annonces: annonces.length,
      annonces_actives: actives,
      annonces_sous_option: sousOption,
      annonces_louees: louees,
      annonces_suspendues: suspendues,
      total_contacts_recus: totalContacts,
      total_visites_planifiees: totalVisites,
      total_candidatures: totalCandidatures,
      delai_moyen_location_jours: 14 // Heuristique du marché local
    },
    top_annonces: topAnnonces,
    annonces: annoncesDetaillees
  };
}
