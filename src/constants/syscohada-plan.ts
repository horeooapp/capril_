/**
 * Plan Comptable Général SYSCOHADA Révisé adapté aux Agences Immobilières
 * Conforme aux normes OHADA / UEMOA applicables en Côte d'Ivoire.
 */

export interface CompteSyscohada {
    numero: string;
    intitule: string;
    classe: number;
    categorie: 'ACTIF' | 'PASSIF' | 'CHARGE' | 'PRODUIT';
    description: string;
    sensNormal: 'DEBITEUR' | 'CREDITEUR';
}

export const PLAN_COMPTABLE_SYSCOHADA: CompteSyscohada[] = [
    // ══════════════════════════════════════════════════════════════════════
    // CLASSE 1 : COMPTES DE RESSOURCES DURABLES (Capitaux propres & Dettes)
    // ══════════════════════════════════════════════════════════════════════
    {
        numero: "101000",
        intitule: "Capital social",
        classe: 1,
        categorie: "PASSIF",
        description: "Capital social souscrit et libéré de l'agence immobilière",
        sensNormal: "CREDITEUR"
    },
    {
        numero: "111000",
        intitule: "Réserve légale",
        classe: 1,
        categorie: "PASSIF",
        description: "Réserve obligatoire légale (10% du bénéfice jusqu'à 20% du capital)",
        sensNormal: "CREDITEUR"
    },
    {
        numero: "121000",
        intitule: "Report à nouveau créditeur",
        classe: 1,
        categorie: "PASSIF",
        description: "Bénéfices des exercices antérieurs non distribués",
        sensNormal: "CREDITEUR"
    },
    {
        numero: "131000",
        intitule: "Résultat net de l'exercice (Bénéfice)",
        classe: 1,
        categorie: "PASSIF",
        description: "Bénéfice net comptable de la période",
        sensNormal: "CREDITEUR"
    },
    {
        numero: "139000",
        intitule: "Résultat net de l'exercice (Perte)",
        classe: 1,
        categorie: "PASSIF",
        description: "Perte nette comptable de la période",
        sensNormal: "DEBITEUR"
    },
    {
        numero: "165100",
        intitule: "Dépôts de garantie reçus des locataires",
        classe: 1,
        categorie: "PASSIF",
        description: "Cautions et dépôts locatifs détenus sous mandat séquestre (Fonds mandants)",
        sensNormal: "CREDITEUR"
    },

    // ══════════════════════════════════════════════════════════════════════
    // CLASSE 2 : COMPTES D'ACTIF IMMOBILISÉ (Investissements de l'agence)
    // ══════════════════════════════════════════════════════════════════════
    {
        numero: "215000",
        intitule: "Matériel de transport",
        classe: 2,
        categorie: "ACTIF",
        description: "Véhicules et motos de l'agence pour visites de biens et états des lieux",
        sensNormal: "DEBITEUR"
    },
    {
        numero: "218300",
        intitule: "Matériel informatique et télécoms",
        classe: 2,
        categorie: "ACTIF",
        description: "Serveurs, ordinateurs, imprimantes et tablettes d'inspection",
        sensNormal: "DEBITEUR"
    },
    {
        numero: "218400",
        intitule: "Mobilier et matériel de bureau",
        classe: 2,
        categorie: "ACTIF",
        description: "Bureaux, fauteuils d'accueil et mobilier du siège",
        sensNormal: "DEBITEUR"
    },
    {
        numero: "275100",
        intitule: "Dépôts et cautionnements versés par l'agence",
        classe: 2,
        categorie: "ACTIF",
        description: "Garantie financière agence immobilière agréée & caution bail siège",
        sensNormal: "DEBITEUR"
    },

    // ══════════════════════════════════════════════════════════════════════
    // CLASSE 4 : COMPTES DE TIERS (Mandants, Locataires, Fournisseurs, État)
    // ══════════════════════════════════════════════════════════════════════
    {
        numero: "401100",
        intitule: "Fournisseurs d'exploitation",
        classe: 4,
        categorie: "PASSIF",
        description: "Prestataires, artisans travaux, abonnements logiciels, CIE/SODECI siège",
        sensNormal: "CREDITEUR"
    },
    {
        numero: "411100",
        intitule: "Clients - Locataires (Créances d'honoraires)",
        classe: 4,
        categorie: "ACTIF",
        description: "Frais de dossier, honoraires d'agence et quittances réclamés aux locataires",
        sensNormal: "DEBITEUR"
    },
    {
        numero: "419100",
        intitule: "Clients - Avances et acomptes reçus",
        classe: 4,
        categorie: "PASSIF",
        description: "Avances de loyers reçues des locataires avant échéance",
        sensNormal: "CREDITEUR"
    },
    {
        numero: "421100",
        intitule: "Personnel - Rémunérations dues",
        classe: 4,
        categorie: "PASSIF",
        description: "Salaires et commissions à verser aux collaborateurs et négociateurs",
        sensNormal: "CREDITEUR"
    },
    {
        numero: "443100",
        intitule: "État - TVA facturée sur prestations (18%)",
        classe: 4,
        categorie: "PASSIF",
        description: "TVA collectée sur honoraires de gestion et commissions d'agence (DGI CI)",
        sensNormal: "CREDITEUR"
    },
    {
        numero: "445200",
        intitule: "État - TVA récupérable sur achats et services",
        classe: 4,
        categorie: "ACTIF",
        description: "TVA déductible payée sur les charges de fonctionnement de l'agence",
        sensNormal: "DEBITEUR"
    },
    {
        numero: "447100",
        intitule: "État - Impôts retenus à la source (AIRSI & BNC)",
        classe: 4,
        categorie: "PASSIF",
        description: "Retenues à la source sur honoraires démarcheurs et prestataires",
        sensNormal: "CREDITEUR"
    },
    {
        numero: "467100",
        intitule: "Bailleurs Mandants - Compte de gestion locative",
        classe: 4,
        categorie: "PASSIF",
        description: "Fonds mandants : Loyers nets encaissés à reverser aux propriétaires",
        sensNormal: "CREDITEUR"
    },
    {
        numero: "467200",
        intitule: "Locataires Mandats - Cautions et provisions",
        classe: 4,
        categorie: "PASSIF",
        description: "Dépôts de garantie et provisions sur charges reçus des locataires",
        sensNormal: "CREDITEUR"
    },
    {
        numero: "467300",
        intitule: "Mandants - Avances sur débours et travaux",
        classe: 4,
        categorie: "ACTIF",
        description: "Frais engagés ou avancés par l'agence pour le compte des bailleurs",
        sensNormal: "DEBITEUR"
    },

    // ══════════════════════════════════════════════════════════════════════
    // CLASSE 5 : COMPTES DE TRÉSORERIE (Banques Séquestre, Caisse, Mobile Money)
    // ══════════════════════════════════════════════════════════════════════
    {
        numero: "521100",
        intitule: "Banque - Compte d'exploitation agence",
        classe: 5,
        categorie: "ACTIF",
        description: "Compte courant professionnel pour les honoraires et charges de l'agence",
        sensNormal: "DEBITEUR"
    },
    {
        numero: "521200",
        intitule: "Banque - Compte Séquestre / Mandants (Obligation Légale)",
        classe: 5,
        categorie: "ACTIF",
        description: "Compte bancaire dédié exclusivement aux loyers et cautions des propriétaires",
        sensNormal: "DEBITEUR"
    },
    {
        numero: "531100",
        intitule: "Caisse principale de l'agence",
        classe: 5,
        categorie: "ACTIF",
        description: "Espèces et liquidités détenues au guichet de l'agence",
        sensNormal: "DEBITEUR"
    },
    {
        numero: "571100",
        intitule: "Portefeuille Mobile Money Agence (Wave, OM, MoMo)",
        classe: 5,
        categorie: "ACTIF",
        description: "Encaissements directs de loyers par Mobile Money certifié",
        sensNormal: "DEBITEUR"
    },
    {
        numero: "585000",
        intitule: "Virements internes de fonds",
        classe: 5,
        categorie: "ACTIF",
        description: "Compte tampon de passage entre Mobile Money, Caisse et Banques",
        sensNormal: "DEBITEUR"
    },

    // ══════════════════════════════════════════════════════════════════════
    // CLASSE 6 : COMPTES DE CHARGES (Frais de fonctionnement de l'agence)
    // ══════════════════════════════════════════════════════════════════════
    {
        numero: "605100",
        intitule: "Fournitures de bureau et consommables",
        classe: 6,
        categorie: "CHARGE",
        description: "Papier quittances, cartouches, chemises de baux et fournitures",
        sensNormal: "DEBITEUR"
    },
    {
        numero: "613100",
        intitule: "Loyer du local / siège de l'agence",
        classe: 6,
        categorie: "CHARGE",
        description: "Bail commercial des bureaux d'exploitation de l'agence",
        sensNormal: "DEBITEUR"
    },
    {
        numero: "622100",
        intitule: "Commissions versées aux intermédiaires & démarcheurs",
        classe: 6,
        categorie: "CHARGE",
        description: "Rétrocommissions d'apport de mandats et candidatures locataires",
        sensNormal: "DEBITEUR"
    },
    {
        numero: "622200",
        intitule: "Honoraires juridiques, huissiers et avocats",
        classe: 6,
        categorie: "CHARGE",
        description: "Frais de recouvrement, actes extrajudiciaires et conseils légaux",
        sensNormal: "DEBITEUR"
    },
    {
        numero: "624100",
        intitule: "Frais de transport et carburant (Visites & EDL)",
        classe: 6,
        categorie: "CHARGE",
        description: "Frais de déplacement des agents de terrain et gestionnaires",
        sensNormal: "DEBITEUR"
    },
    {
        numero: "627100",
        intitule: "Publicité, annonces immobilières et marketing",
        classe: 6,
        categorie: "CHARGE",
        description: "Panneaux 'À Louer', annonces en ligne, réseaux sociaux et print",
        sensNormal: "DEBITEUR"
    },
    {
        numero: "628100",
        intitule: "Frais de télécommunications & accès internet",
        classe: 6,
        categorie: "CHARGE",
        description: "Flotte mobile agents, fibre optique et notifications SMS/WhatsApp",
        sensNormal: "DEBITEUR"
    },
    {
        numero: "631100",
        intitule: "Primes d'assurance RC Pro & Garantie Financière",
        classe: 6,
        categorie: "CHARGE",
        description: "Assurances professionnelles obligatoires pour l'agrément d'agence",
        sensNormal: "DEBITEUR"
    },
    {
        numero: "641100",
        intitule: "Impôts et taxes directs (Patente & Taxes)",
        classe: 6,
        categorie: "CHARGE",
        description: "Patente d'agence immobilière, impôts locaux et taxes d'activité",
        sensNormal: "DEBITEUR"
    },
    {
        numero: "661100",
        intitule: "Rémunération du personnel agence",
        classe: 6,
        categorie: "CHARGE",
        description: "Salaires des négociateurs, comptables et personnel administratif",
        sensNormal: "DEBITEUR"
    },
    {
        numero: "664100",
        intitule: "Charges sociales et cotisations CNPS",
        classe: 6,
        categorie: "CHARGE",
        description: "Cotisations de sécurité sociale pour les employés déclarés",
        sensNormal: "DEBITEUR"
    },

    // ══════════════════════════════════════════════════════════════════════
    // CLASSE 7 : COMPTES DE PRODUITS (Chiffre d'affaires & Honoraires Agence)
    // ══════════════════════════════════════════════════════════════════════
    {
        numero: "706100",
        intitule: "Honoraires de gestion locative récurrente",
        classe: 7,
        categorie: "PRODUIT",
        description: "Commissions d'agence prélevées sur les loyers encaissés (ex: 8% à 10%)",
        sensNormal: "CREDITEUR"
    },
    {
        numero: "706200",
        intitule: "Honoraires de transaction & négociation (Ventes)",
        classe: 7,
        categorie: "PRODUIT",
        description: "Commissions d'entremise sur ventes immobilières et cessions",
        sensNormal: "CREDITEUR"
    },
    {
        numero: "706300",
        intitule: "Honoraires de rédaction de baux & formalités DGI",
        classe: 7,
        categorie: "PRODUIT",
        description: "Frais de dossier et timbrage légal facturés lors de l'entrée du locataire",
        sensNormal: "CREDITEUR"
    },
    {
        numero: "706400",
        intitule: "Honoraires de réalisation d'états des lieux (EDL)",
        classe: 7,
        categorie: "PRODUIT",
        description: "Prestations d'inspection d'entrée et de sortie certifiées",
        sensNormal: "CREDITEUR"
    },
    {
        numero: "706500",
        intitule: "Honoraires de syndic de copropriété",
        classe: 7,
        categorie: "PRODUIT",
        description: "Rémunérations d'administration des parties communes et copropriétés",
        sensNormal: "CREDITEUR"
    },
    {
        numero: "706800",
        intitule: "Autres produits et prestations annexes immobilières",
        classe: 7,
        categorie: "PRODUIT",
        description: "Prestations diverses (avis de valeur, relances contentieuses, etc.)",
        sensNormal: "CREDITEUR"
    }
];

export const JOURNAUX_COMPTABLES = [
    { code: "BQ_MAND", libelle: "Journal de Banque Mandants (Loyers & Cautions)", compteTresorerie: "521200" },
    { code: "BQ_EXPL", libelle: "Journal de Banque Exploitation (Agence)", compteTresorerie: "521100" },
    { code: "CAISSE", libelle: "Journal de Caisse Principale", compteTresorerie: "531100" },
    { code: "MOMO", libelle: "Journal Mobile Money (Wave, OM, MoMo)", compteTresorerie: "571100" },
    { code: "GESTION", libelle: "Journal des Opérations de Gestion Locative", compteTresorerie: null },
    { code: "ACHATS", libelle: "Journal des Achats & Fournisseurs", compteTresorerie: null },
    { code: "OD", libelle: "Journal des Opérations Diverses", compteTresorerie: null }
];

