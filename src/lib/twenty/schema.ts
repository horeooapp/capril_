/**
 * Twenty CRM Metadata schema definitions and mappings.
 * Maps QAPRIL Prisma models to Twenty CRM custom objects.
 */

export interface FieldDefinition {
  name: string;
  type: string; // TEXT, NUMBER, CURRENCY, SELECT, DATE, DATETIME, BOOLEAN, RELATION
  label: string;
  description: string;
  options?: string[]; // for SELECT type
}

export interface CustomObjectDefinition {
  nameSingular: string;
  namePlural: string;
  labelSingular: string;
  labelPlural: string;
  description: string;
  icon: string;
  fields: FieldDefinition[];
}

export const TWENTY_SCHEMA_DEFINITIONS: Record<string, CustomObjectDefinition> = {
  BienImmobilier: {
    nameSingular: "bienImmobilier",
    namePlural: "bienImmobiliers",
    labelSingular: "Bien Immobilier",
    labelPlural: "Biens Immobiliers",
    description: "Bien immobilier géré dans QAPRIL",
    icon: "IconBuilding",
    fields: [
      { name: "externalQaprilId", type: "TEXT", label: "ID Externe QAPRIL", description: "ID de l'enregistrement dans QAPRIL" },
      { name: "codeLogement", type: "TEXT", label: "Code Logement", description: "Référence unique du bien" },
      {
        name: "typeLogement",
        type: "SELECT",
        label: "Type Logement",
        description: "Type de bien immobilier",
        options: ["APARTMENT", "HOUSE", "STUDIO", "VILLA", "ROOM", "COMMERCIAL"]
      },
      { name: "commune", type: "TEXT", label: "Commune", description: "Commune d'implantation (ex: Cocody, Yopougon...)" },
      { name: "adresse", type: "TEXT", label: "Adresse", description: "Adresse physique complète" },
      { name: "nombrePieces", type: "NUMBER", label: "Nombre de Pièces", description: "Nombre total de pièces du logement" },
      { name: "loyerDeclare", type: "CURRENCY", label: "Loyer Déclaré (XOF)", description: "Montant mensuel du loyer hors charges en XOF" },
      { name: "superficieM2", type: "NUMBER", label: "Superficie (m²)", description: "Superficie habitable en mètres carrés" },
      {
        name: "statutBien",
        type: "SELECT",
        label: "Statut du Bien",
        description: "Statut d'occupation ou disponibilité du bien",
        options: ["DRAFT", "PENDING_VERIFICATION", "ACTIVE", "RENTED", "SUSPENDED", "REJECTED", "ARCHIVED", "AVAILABLE"]
      },
      { name: "gpsLatitude", type: "NUMBER", label: "Latitude GPS", description: "Coordonnée Latitude" },
      { name: "gpsLongitude", type: "NUMBER", label: "Longitude GPS", description: "Coordonnée Longitude" },
      {
        name: "typeStructure",
        type: "SELECT",
        label: "Structure",
        description: "Type structure du bien",
        options: ["INDEPENDANT", "PARENT", "UNIT"]
      },
      {
        name: "modeGestion",
        type: "SELECT",
        label: "Mode Gestion",
        description: "Mode de gestion du bien",
        options: ["DIRECT", "AGENCY", "MIXED"]
      }
    ]
  },

  Bail: {
    nameSingular: "bail",
    namePlural: "bails",
    labelSingular: "Bail",
    labelPlural: "Bails",
    description: "Contrat de location (Bail numérique ou déclaratif)",
    icon: "IconFileText",
    fields: [
      { name: "externalQaprilId", type: "TEXT", label: "ID Externe QAPRIL", description: "ID de l'enregistrement dans QAPRIL" },
      { name: "referenceBail", type: "TEXT", label: "Référence du Bail", description: "Référence unique du contrat" },
      {
        name: "typeBail",
        type: "SELECT",
        label: "Type de Bail",
        description: "Format du contrat",
        options: ["ECRIT", "DECLARATIF_BDQ", "DECLARATIF_EN_COURS_FORMALISATION"]
      },
      {
        name: "statutBail",
        type: "SELECT",
        label: "Statut du Bail",
        description: "Statut du cycle de vie du bail",
        options: [
          "DRAFT", "PENDING_SIGNATURE", "PENDING_CONFIRMATION", "PENDING_DEPOSIT", 
          "ACTIVE", "ACTIVE_DECLARATIF", "LOYER_IMPAYE", "MISE_EN_DEMEURE", 
          "CLEMENCE_EN_COURS", "REPRISE_PROCEDURE", "DEMANDE_RESILIATION", 
          "TERMINATED", "CANCELLED", "ARCHIVED"
        ]
      },
      { name: "dateDebut", type: "DATE", label: "Date de Début", description: "Date de prise d'effet du bail" },
      { name: "dateFin", type: "DATE", label: "Date de Fin", description: "Date de fin du bail si applicable" },
      { name: "dureeMois", type: "NUMBER", label: "Durée (Mois)", description: "Durée contractuelle en mois" },
      { name: "montantLoyer", type: "CURRENCY", label: "Loyer Mensuel", description: "Loyer mensuel hors charges" },
      { name: "montantCharges", type: "CURRENCY", label: "Montant Charges", description: "Charges locatives mensuelles" },
      { name: "montantCaution", type: "CURRENCY", label: "Montant Caution", description: "Dépôt de garantie versé" },
      { name: "avanceLoyer", type: "CURRENCY", label: "Avance Loyer", description: "Montant d'avance sur loyer payé" },
      { name: "jourPaiement", type: "NUMBER", label: "Jour de Paiement", description: "Jour d'échéance mensuelle (ex: 5)" },
      {
        name: "statutFiscal",
        type: "SELECT",
        label: "Statut Fiscal DGI",
        description: "Statut d'enregistrement et paiement fiscal DGI",
        options: ["NON_CALCULE", "CALCULE", "EN_ATTENTE_DECLARATION", "NOTIFIE", "EN_COURS_PAIEMENT", "PAYE_CONFIRME", "ENREGISTRE", "ECHEC_PAIEMENT"]
      }
    ]
  },

  Paiement: {
    nameSingular: "paiement",
    namePlural: "paiements",
    labelSingular: "Paiement",
    labelPlural: "Paiements",
    description: "Transaction de paiement (Mobile Money, Virement, Espèces)",
    icon: "IconCreditCard",
    fields: [
      { name: "externalQaprilId", type: "TEXT", label: "ID Externe QAPRIL", description: "ID de l'enregistrement dans QAPRIL" },
      { name: "reference", type: "TEXT", label: "Référence Paiement", description: "Référence unique de quittance ou de transaction" },
      { name: "moisConcerne", type: "TEXT", label: "Mois Concerné", description: "Période quittancée au format YYYY-MM" },
      { name: "montant", type: "CURRENCY", label: "Montant (XOF)", description: "Montant payé en XOF" },
      {
        name: "canal",
        type: "SELECT",
        label: "Canal de Paiement",
        description: "Opérateur ou moyen utilisé",
        options: ["ORANGE", "MTN", "WAVE", "MOOV", "CINETPAY_M17", "SMS_DECLARATIF", "SMS", "WHATSAPP", "EMAIL", "PUSH", "APP_CHAT", "CASH", "BANK_TRANSFER"]
      },
      {
        name: "statut",
        type: "SELECT",
        label: "Statut",
        description: "Statut du paiement",
        options: ["INITIEE", "EN_ATTENTE_PAIEMENT", "CONFIRMEE", "ECHEC", "EXPIREE", "DECLAREE", "PENDING", "PAID", "CANCELLED", "DISPUTED"]
      },
      { name: "datePaiement", type: "DATE", label: "Date de Paiement", description: "Date effective de la transaction" }
    ]
  },

  Mandat: {
    nameSingular: "mandat",
    namePlural: "mandats",
    labelSingular: "Mandat",
    labelPlural: "Mandats",
    description: "Mandat de gestion locative immobilière",
    icon: "IconAward",
    fields: [
      { name: "externalQaprilId", type: "TEXT", label: "ID Externe QAPRIL", description: "ID de l'enregistrement dans QAPRIL" },
      { name: "referenceMandat", type: "TEXT", label: "Référence Mandat", description: "Référence du mandat" },
      {
        name: "typeMandat",
        type: "SELECT",
        label: "Type de Mandat",
        description: "Exclusivité du mandat",
        options: ["EXCLUSIVE", "SIMPLE", "CO_EXCLUSIVE", "DIRECT"]
      },
      {
        name: "statutMandat",
        type: "SELECT",
        label: "Statut Mandat",
        description: "Statut de validité",
        options: ["ACTIVE", "SUSPENDED", "CANCELLED", "EXPIRED", "DRAFT"]
      },
      { name: "tauxCommission", type: "NUMBER", label: "Commission (%)", description: "Pourcentage de commission agence" },
      { name: "dateDebut", type: "DATE", label: "Date de Début", description: "Date de prise d'effet" },
      { name: "dateFin", type: "DATE", label: "Date de Fin", description: "Date d'expiration" }
    ]
  },

  LitigeMediation: {
    nameSingular: "litigeMediation",
    namePlural: "litigeMediations",
    labelSingular: "Litige & Médiation",
    labelPlural: "Litiges & Médiations",
    description: "Conflits et dossiers de conciliation",
    icon: "IconAlertTriangle",
    fields: [
      { name: "externalQaprilId", type: "TEXT", label: "ID Externe QAPRIL", description: "ID de l'enregistrement dans QAPRIL" },
      { name: "titre", type: "TEXT", label: "Titre du Litige", description: "Sujet ou objet de la dispute" },
      {
        name: "typeLitige",
        type: "SELECT",
        label: "Type",
        description: "Catégorie de litige",
        options: ["DEFAUT_PAIEMENT", "DEGRADATION_LOURDE", "SOUS_LOCATION_ILLICITE", "TROUBLES_VOISINAGE", "AUTRE"]
      },
      {
        name: "severite",
        type: "SELECT",
        label: "Sévérité",
        description: "Urgence ou sévérité du dossier",
        options: ["NORMALE", "HAUTE", "CRITIQUE"]
      },
      {
        name: "statutLitige",
        type: "SELECT",
        label: "Statut",
        description: "Statut actuel de résolution",
        options: ["OPEN", "WAITING_RESPONSE", "IN_MEDIATION", "RESOLVED", "ESCALATED", "CLOSED"]
      },
      { name: "montantEnJeu", type: "CURRENCY", label: "Montant en Jeu", description: "Montant litigieux en XOF" },
      { name: "resolution", type: "TEXT", label: "Résolution", description: "Notes de clôture ou accord trouvé" }
    ]
  }
};
