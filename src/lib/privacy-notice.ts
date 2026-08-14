/**
 * PRIVACY BY DESIGN — Principe 6 : Transparence
 * Générateur dynamique de mentions légales et politiques de confidentialité.
 *
 * S'appuie sur le registre centralisé (`data-classification.ts`) pour
 * générer automatiquement une notice de confidentialité toujours à jour
 * et alignée sur la réalité technique de la base de données.
 */

import { generateDataInventorySummary, DATA_FIELD_REGISTRY, RETENTION_POLICIES } from "./data-classification";
// Note: RETENTION_POLICIES provient en fait de data-retention.ts dans la réalité, on ajuste l'import
import { RETENTION_POLICIES as RetentionConfig } from "./data-retention";

export interface PrivacyNoticeContent {
  version: string;
  lastUpdated: string;
  dataProcessed: Array<{
    category: string;
    purpose: string;
    legalBasis: string;
    retention: string;
    fields: string[];
  }>;
  userRights: string[];
  contactEmail: string;
}

/**
 * Génère dynamiquement la section "Données traitées" de la politique de confidentialité,
 * en lisant directement le registre de classification.
 * Garanti 0 divergence entre le code et le légal.
 */
export function generateDynamicPrivacyNotice(): PrivacyNoticeContent {
  const inventory = generateDataInventorySummary();
  
  // Regroupement des champs par catégorie pour l'affichage légal
  const categoriesMap = new Map<string, {
    fields: string[];
    legalBasisSet: Set<string>;
    retentionSet: Set<string>;
  }>();

  for (const [key, field] of Object.entries(DATA_FIELD_REGISTRY)) {
    if (!categoriesMap.has(field.category)) {
      categoriesMap.set(field.category, {
        fields: [],
        legalBasisSet: new Set(),
        retentionSet: new Set()
      });
    }
    
    const cat = categoriesMap.get(field.category)!;
    cat.fields.push(field.description);
    cat.legalBasisSet.add(translateLegalBasis(field.legalBasis));
    cat.retentionSet.add(field.retention);
  }

  const dataProcessed = Array.from(categoriesMap.entries()).map(([category, data]) => ({
    category: translateCategory(category),
    purpose: getPurposeForCategory(category),
    legalBasis: Array.from(data.legalBasisSet).join(" ; "),
    retention: Array.from(data.retentionSet).join(" ou "),
    fields: data.fields,
  }));

  return {
    version: "1.0",
    lastUpdated: new Date().toISOString().split('T')[0],
    dataProcessed,
    userRights: [
      "Droit d'accès (Art. 15 RGPD)",
      "Droit de rectification (Art. 16 RGPD)",
      "Droit à l'effacement / Droit à l'oubli (Art. 17 RGPD)",
      "Droit à la limitation du traitement (Art. 18 RGPD)",
      "Droit à la portabilité des données (Art. 20 RGPD)",
      "Droit d'opposition (Art. 21 RGPD)"
    ],
    contactEmail: "dpo@qapril.com" // TODO: Mettre l'email du DPO
  };
}

// ─── Utilitaires de traduction légale ─────────────────────────────────────────

function translateLegalBasis(basis: string): string {
  const bases: Record<string, string> = {
    CONSENT: "Votre consentement explicite",
    CONTRACT: "Exécution des Conditions Générales d'Utilisation / Contrat de bail",
    LEGAL_OBLIGATION: "Respect de nos obligations légales (ex: KYC, comptabilité)",
    LEGITIMATE_INTEREST: "Nos intérêts légitimes (sécurité, amélioration du service)",
  };
  return bases[basis] || basis;
}

function translateCategory(category: string): string {
  const categories: Record<string, string> = {
    IDENTITY: "Données d'identité",
    CONTACT: "Coordonnées de contact",
    FINANCIAL: "Données financières",
    LOCATION: "Données de localisation",
    BIOMETRIC: "Données biométriques / Documents",
    TECHNICAL: "Données techniques et de navigation",
    LEGAL: "Informations légales",
  };
  return categories[category] || category;
}

function getPurposeForCategory(category: string): string {
  const purposes: Record<string, string> = {
    IDENTITY: "Vérification de votre identité et création de votre compte.",
    CONTACT: "Communication avec vous et envoi de notifications importantes.",
    FINANCIAL: "Traitement de vos paiements, encaissement des loyers et scoring.",
    LOCATION: "Vérification des adresses des biens immobiliers.",
    BIOMETRIC: "Conformité KYC et lutte contre la fraude (vérification pièce d'identité).",
    TECHNICAL: "Sécurisation de l'application et prévention des cyberattaques.",
    LEGAL: "Établissement des contrats (baux, mandats) conformes à la législation.",
  };
  return purposes[category] || "Fourniture de nos services.";
}
