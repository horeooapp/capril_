/**
 * QAPRIL — Module Transactions & Ventes (ADD-25)
 * Règles métiers RG-VTE-01 à RG-VTE-26
 *
 * Référence : QAPRIL/SPEC/001/2026 — ADD-25
 * Textes de référence :
 * - Loi n° 2019-576 (CCH), art. 419 et s. (agents immobiliers agréés)
 * - Ordonnance n° 2013-481 et décret n° 2013-482 (ACD terrains urbains)
 * - Loi n° 98-750 modifiée (domaine foncier rural)
 * - CGI de Côte d'Ivoire (droits d'enregistrement mutations immobilières : 4%)
 * - Loi 2013-546 (transactions électroniques)
 * - Loi 2013-450 (protection des données personnelles)
 */

// ==============================================================================
// 1. TYPOLOGIE & TITRES (RG-VTE-01, RG-VTE-02, RG-VTE-03)
// ==============================================================================

export type CategorieBienVente =
  | 'TERRAIN_URBAIN_NU'
  | 'TERRAIN_RURAL'
  | 'MAISON'
  | 'APPARTEMENT'
  | 'IMMEUBLE_ENTIER'
  | 'LOCAL_COMMERCIAL'
  | 'COUR_COMMUNE_ENTIERE';

export type NatureTitre =
  | 'ACD'
  | 'TITRE_FONCIER'
  | 'LETTRE_ATTRIBUTION'
  | 'ATTESTATION_VILLAGEOISE'
  | 'CERTIFICAT_FONCIER_RURAL'
  | 'ACTE_NOTARIE_ANTERIEUR'
  | 'AUTRE';

export interface TitreSecuriteInfo {
  code: NatureTitre;
  libelle: string;
  niveauSecurite: 'PLEINE_PROPRIETE' | 'ETAPE_ACD' | 'DROIT_COUTUMIER' | 'PRECAIRE';
  estPubliable: boolean;
  explicationClaire: string;
  badgeCouleur: 'emerald' | 'amber' | 'slate' | 'red';
}

export const NATURES_TITRES: Record<NatureTitre, TitreSecuriteInfo> = {
  ACD: {
    code: 'ACD',
    libelle: 'Arrêté de Concession Définitive (ACD)',
    niveauSecurite: 'PLEINE_PROPRIETE',
    estPubliable: true,
    explicationClaire: 'Pleine propriété inattaquable conférée par l’État de Côte d’Ivoire.',
    badgeCouleur: 'emerald',
  },
  TITRE_FONCIER: {
    code: 'TITRE_FONCIER',
    libelle: 'Titre Foncier (Livre Foncier)',
    niveauSecurite: 'PLEINE_PROPRIETE',
    estPubliable: true,
    explicationClaire: 'Titre définitif inscrit au livre foncier de la conservation foncière.',
    badgeCouleur: 'emerald',
  },
  LETTRE_ATTRIBUTION: {
    code: 'LETTRE_ATTRIBUTION',
    libelle: 'Lettre d’attribution ministérielle',
    niveauSecurite: 'ETAPE_ACD',
    estPubliable: true,
    explicationClaire: 'Document administratif ouvrant droit à la demande d’ACD. Mutation finale soumise à obtention de l’ACD.',
    badgeCouleur: 'amber',
  },
  ATTESTATION_VILLAGEOISE: {
    code: 'ATTESTATION_VILLAGEOISE',
    libelle: 'Attestation villageoise (chefferie)',
    niveauSecurite: 'DROIT_COUTUMIER',
    estPubliable: true,
    explicationClaire: 'Cession coutumière. Nécessite l’approbation du lotissement et la purge des droits coutumiers avant ACD.',
    badgeCouleur: 'amber',
  },
  CERTIFICAT_FONCIER_RURAL: {
    code: 'CERTIFICAT_FONCIER_RURAL',
    libelle: 'Certificat foncier rural (Loi 98-750)',
    niveauSecurite: 'PLEINE_PROPRIETE',
    estPubliable: true,
    explicationClaire: 'Reconnaissance légale des droits coutumiers ruraux. Immatriculable en titre foncier.',
    badgeCouleur: 'emerald',
  },
  ACTE_NOTARIE_ANTERIEUR: {
    code: 'ACTE_NOTARIE_ANTERIEUR',
    libelle: 'Acte notarié de vente antérieur',
    niveauSecurite: 'ETAPE_ACD',
    estPubliable: true,
    explicationClaire: 'Contrat notarié constatant une transaction antérieure en cours d’immatriculation définitive.',
    badgeCouleur: 'amber',
  },
  AUTRE: {
    code: 'AUTRE',
    libelle: 'Autre document (non classé)',
    niveauSecurite: 'PRECAIRE',
    estPubliable: false, // RG-VTE-03: libellé libre, non publiable
    explicationClaire: 'Document non reconnu officiellement pour une mise en vente publique.',
    badgeCouleur: 'red',
  },
};

// ==============================================================================
// 2. VÉRIFICATION DU BIEN À LA VENTE (RG-VTE-04)
// ==============================================================================

export interface VerificationVenteInfo {
  niveau: number;
  label: string;
  description: string;
  peutPublier: boolean;
  aBadgeBienVerifie: boolean;
}

export function getNiveauVerificationVente(niveau: number): VerificationVenteInfo {
  switch (niveau) {
    case 0:
      return {
        niveau: 0,
        label: 'Déclaré',
        description: 'Informations déclaratives fournies par le vendeur sans pièces justificatives auditées.',
        peutPublier: false,
        aBadgeBienVerifie: false,
      };
    case 1:
      return {
        niveau: 1,
        label: 'Identité vérifiée',
        description: 'Identité et statut du vendeur vérifiés par CNI/Passeport biométrique certifié.',
        peutPublier: false,
        aBadgeBienVerifie: false,
      };
    case 2:
      return {
        niveau: 2,
        label: 'Titre & Qualité rapprochés',
        description: 'Rapprochement certifié entre l’identité du vendeur et le titulaire du titre (ou mandat notarié/succession documentée).',
        peutPublier: true, // Seuil d’éligibilité à la publication
        aBadgeBienVerifie: false,
      };
    case 3:
      return {
        niveau: 3,
        label: 'Titre contrôlé aux services fonciers',
        description: 'Titre contrôlé auprès de la Conservation foncière ou du Guichet unique du foncier avec attestation de conformité.',
        peutPublier: true,
        aBadgeBienVerifie: true, // Badge "Bien vérifié"
      };
    case 4:
      return {
        niveau: 4,
        label: 'Constat physique et bornage certifié',
        description: 'Visite de vérification sur site, constat des bornes et géolocalisation certifiée par une agence agréée partenaire.',
        peutPublier: true,
        aBadgeBienVerifie: true,
      };
    default:
      return {
        niveau: 0,
        label: 'Inconnu',
        description: 'Statut de vérification non défini.',
        peutPublier: false,
        aBadgeBienVerifie: false,
      };
  }
}

// ==============================================================================
// 3. CONFIDENTIALITÉ & MASQUAGE VENDEUR (RG-VTE-09)
// ==============================================================================

/**
 * Masque l'identité du vendeur selon le rôle de l'observateur.
 * Règle RG-VTE-09 / RG-CONF-01 à 05 :
 * - Acquéreur : voit TOUJOURS uniquement le code masqué VEN-NNN (identité révélée au compromis par le notaire).
 * - Collaborateur d'agence : selon habilitation (code masqué par défaut).
 * - Chef d'agence / SuperAdmin : voit l'identité complète.
 */
export function masquerIdentiteVendeur(
  vendeurNomComplet: string,
  vendeurCodeMasque: string,
  roleObservateur: 'BUYER' | 'COLLABORATOR' | 'AGENCY_DIRECTOR' | 'SUPER_ADMIN' | 'NOTAIRE',
  estCompromisSigne: boolean = false
): string {
  if (roleObservateur === 'SUPER_ADMIN' || roleObservateur === 'AGENCY_DIRECTOR' || roleObservateur === 'NOTAIRE') {
    return vendeurNomComplet;
  }
  if (roleObservateur === 'BUYER' && estCompromisSigne) {
    return vendeurNomComplet;
  }
  return `Vendeur [${vendeurCodeMasque}]`;
}

// ==============================================================================
// 4. FISCALITÉ, FRAIS & COMMISSION (RG-VTE-19, RG-VTE-21, RG-VTE-22)
// ==============================================================================

export interface DecompteFinancierTransaction {
  prixVenteFcfa: number;
  droitsEnregistrementMutationFcfa: number; // 4% CGI
  tauxDroitsEnregistrementPct: number;
  fraisConservationFonciereFcfa: number; // ~1.2%
  fraisNotaireEstimesFcfa: number; // Barème officiel dégressif
  totalFraisAcquisitionFcfa: number;
  coutTotalAcquereurFcfa: number;
  commissionAgenceFcfa: number;
  commissionCharge: 'VENDEUR' | 'ACQUEREUR' | 'PARTAGE';
  netVendeurEstimeFcfa: number;
}

/**
 * Calcule le barème notarial officiel en vigueur en Côte d'Ivoire (dégressif par tranche).
 * Tranches usuelles de la tarification des actes notariés :
 * - De 0 à 20 000 000 FCFA : 4 %
 * - De 20 000 001 à 50 000 000 FCFA : 3 %
 * - De 50 000 001 à 150 000 000 FCFA : 1.5 %
 * - Au-delà de 150 000 000 FCFA : 1 %
 */
export function calculerEmolumentsNotaire(prixFcfa: number): number {
  if (prixFcfa <= 0) return 0;
  let total = 0;

  if (prixFcfa <= 20_000_000) {
    total += prixFcfa * 0.04;
  } else {
    total += 20_000_000 * 0.04;
    if (prixFcfa <= 50_000_000) {
      total += (prixFcfa - 20_000_000) * 0.03;
    } else {
      total += 30_000_000 * 0.03;
      if (prixFcfa <= 150_000_000) {
        total += (prixFcfa - 50_000_000) * 0.015;
      } else {
        total += 100_000_000 * 0.015;
        total += (prixFcfa - 150_000_000) * 0.01;
      }
    }
  }

  // TVA 18% sur émoluments notariés
  const tva = total * 0.18;
  return Math.round(total + tva);
}

/**
 * Calcul complet des droits de mutation et frais de transaction selon RG-VTE-19 & RG-VTE-21.
 */
export function calculerDecompteTransaction(
  prixVenteFcfa: number,
  tauxCommissionPct: number = 5.0,
  commissionCharge: 'VENDEUR' | 'ACQUEREUR' | 'PARTAGE' = 'VENDEUR'
): DecompteFinancierTransaction {
  // Droits de mutation CGI : 4% (RG-VTE-19)
  const TAUX_MUTATION_CGI = 0.04;
  const droitsEnregistrement = Math.round(prixVenteFcfa * TAUX_MUTATION_CGI);

  // Droits de conservation foncière / publicité foncière : ~1.2%
  const TAUX_CONSERVATION = 0.012;
  const fraisConservation = Math.round(prixVenteFcfa * TAUX_CONSERVATION);

  // Émoluments notariés (avec TVA 18%)
  const fraisNotaire = calculerEmolumentsNotaire(prixVenteFcfa);

  // Total frais d'acquisition
  const totalFraisAcquisition = droitsEnregistrement + fraisConservation + fraisNotaire;

  // Commission d'agence
  const commissionAgence = Math.round(prixVenteFcfa * (tauxCommissionPct / 100));

  let coutTotalAcquereur = prixVenteFcfa + totalFraisAcquisition;
  let netVendeurEstime = prixVenteFcfa;

  if (commissionCharge === 'ACQUEREUR') {
    coutTotalAcquereur += commissionAgence;
  } else if (commissionCharge === 'VENDEUR') {
    netVendeurEstime -= commissionAgence;
  } else if (commissionCharge === 'PARTAGE') {
    const demiCommission = Math.round(commissionAgence / 2);
    coutTotalAcquereur += demiCommission;
    netVendeurEstime -= demiCommission;
  }

  return {
    prixVenteFcfa,
    droitsEnregistrementMutationFcfa: droitsEnregistrement,
    tauxDroitsEnregistrementPct: TAUX_MUTATION_CGI * 100,
    fraisConservationFonciereFcfa: fraisConservation,
    fraisNotaireEstimesFcfa: fraisNotaire,
    totalFraisAcquisitionFcfa: totalFraisAcquisition,
    coutTotalAcquereurFcfa: coutTotalAcquereur,
    commissionAgenceFcfa: commissionAgence,
    commissionCharge,
    netVendeurEstimeFcfa: netVendeurEstime,
  };
}

// ==============================================================================
// 5. RÈGLE ABSOLUE RG-VTE-16 (NON-MANIEMENT DES FONDS)
// ==============================================================================

/**
 * RG-VTE-16 : QAPRIL ne détient ni n'achemine JAMAIS le prix, les arrhes, l'acompte
 * ou le séquestre d'une vente. Le notaire instrumentaire est le séquestre exclusif.
 * Cette fonction sert de gardien logiciel absolu.
 */
export function certifierConformiteRegleFondsVente(
  destinatairePaiement: 'NOTAIRE_SEQUESTRE' | 'AGENCE_COMMISSION' | 'QAPRIL_PLATEFORME',
  motifPaiement: 'PRIX_VENTE' | 'ARRHES' | 'ACOMPTE' | 'COMMISSION_AGENCE' | 'FRAIS_PLATEFORME_ABONNEMENT'
): { autorise: boolean; motifRejet?: string } {
  if (motifPaiement === 'PRIX_VENTE' || motifPaiement === 'ARRHES' || motifPaiement === 'ACOMPTE') {
    if (destinatairePaiement !== 'NOTAIRE_SEQUESTRE') {
      return {
        autorise: false,
        motifRejet:
          'VIOLATION STRICTE RG-VTE-16 : QAPRIL interdit tout encaissement ou transit de prix, arrhes ou acomptes de vente. Le paiement doit être effectué directement et exclusivement sur le compte séquestre de l’étude notariale.',
      };
    }
  }

  if (motifPaiement === 'COMMISSION_AGENCE' && destinatairePaiement === 'QAPRIL_PLATEFORME') {
    return {
      autorise: false,
      motifRejet:
        'La commission d’agence est directement facturée par l’agence agréée mandataire (RG-VTE-21).',
    };
  }

  return { autorise: true };
}

// ==============================================================================
// 6. PIPELINE DE TRANSACTION (RG-VTE-17)
// ==============================================================================

export type StatutPipelineVente =
  | 'MANDAT'
  | 'PUBLIE'
  | 'VISITES'
  | 'OFFRE_ACCEPTEE'
  | 'COMPROMIS_SIGNE'
  | 'CONDITIONS_EN_COURS'
  | 'ACTE_SIGNE'
  | 'MUTATION_ENREGISTREE'
  | 'CLOTURE'
  | 'RETIRE'
  | 'CADUC'
  | 'ECHEC';

export interface EtapePipelineInfo {
  statut: StatutPipelineVente;
  titre: string;
  delaiPrevisionnelJours: number;
  estTerminal: boolean;
}

export const ETAPES_PIPELINE: Record<StatutPipelineVente, EtapePipelineInfo> = {
  MANDAT: {
    statut: 'MANDAT',
    titre: 'Mandat de vente signé',
    delaiPrevisionnelJours: 7,
    estTerminal: false,
  },
  PUBLIE: {
    statut: 'PUBLIE',
    titre: 'Annonce vérifiée publiée',
    delaiPrevisionnelJours: 30,
    estTerminal: false,
  },
  VISITES: {
    statut: 'VISITES',
    titre: 'Visites et vivier acquéreurs',
    delaiPrevisionnelJours: 45,
    estTerminal: false,
  },
  OFFRE_ACCEPTEE: {
    statut: 'OFFRE_ACCEPTEE',
    titre: 'Offre d’achat acceptée',
    delaiPrevisionnelJours: 15,
    estTerminal: false,
  },
  COMPROMIS_SIGNE: {
    statut: 'COMPROMIS_SIGNE',
    titre: 'Compromis de vente signé (séquestre notaire)',
    delaiPrevisionnelJours: 60,
    estTerminal: false,
  },
  CONDITIONS_EN_COURS: {
    statut: 'CONDITIONS_EN_COURS',
    titre: 'Levée des conditions suspensives',
    delaiPrevisionnelJours: 30,
    estTerminal: false,
  },
  ACTE_SIGNE: {
    statut: 'ACTE_SIGNE',
    titre: 'Acte authentique signé chez le notaire',
    delaiPrevisionnelJours: 30,
    estTerminal: false,
  },
  MUTATION_ENREGISTREE: {
    statut: 'MUTATION_ENREGISTREE',
    titre: 'Formalités d’enregistrement DGI & conservation',
    delaiPrevisionnelJours: 15,
    estTerminal: false,
  },
  CLOTURE: {
    statut: 'CLOTURE',
    titre: 'Transaction clôturée et archivée (10 ans)',
    delaiPrevisionnelJours: 0,
    estTerminal: true,
  },
  RETIRE: {
    statut: 'RETIRE',
    titre: 'Bien retiré de la vente',
    delaiPrevisionnelJours: 0,
    estTerminal: true,
  },
  CADUC: {
    statut: 'CADUC',
    titre: 'Mandat caduc ou expiré',
    delaiPrevisionnelJours: 0,
    estTerminal: true,
  },
  ECHEC: {
    statut: 'ECHEC',
    titre: 'Condition suspensive non réalisée',
    delaiPrevisionnelJours: 0,
    estTerminal: true,
  },
};

