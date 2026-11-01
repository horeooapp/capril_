/**
 * Référentiel des Villes, Communes et Quartiers de Côte d'Ivoire
 * Utilisé pour le profil public locataire, les filtres de recherche et la matching machine.
 */

export interface LocationGroup {
    ville: string;
    commune?: string;
    nomAffiche: string;
    quartiers: string[];
}

export const CI_LOCATIONS: LocationGroup[] = [
    // ── ABIDJAN (10 Communes + Périphéries Directes) ──
    {
        ville: "Abidjan",
        commune: "Cocody",
        nomAffiche: "Abidjan · Cocody",
        quartiers: [
            "Angré (8e Tranche, Djibi, Soleil)",
            "Angré Château",
            "Angré 7e & 9e Tranche",
            "Deux Plateaux (Vallon, Aghien, ENA)",
            "Deux Plateaux 7e Tranche / Polyclinique",
            "Riviera Palmeraie",
            "Riviera Bonoumin",
            "Riviera Faya",
            "Riviera Golf / Ambassades",
            "Riviera 2 & 3",
            "Riviera M'Badon / M'Pouto",
            "Riviera Beverly Hills",
            "Danga",
            "Saint-Jean",
            "Blokhauss",
            "Cité des Arts",
            "Corniche / Mermoz"
        ]
    },
    {
        ville: "Abidjan",
        commune: "Yopougon",
        nomAffiche: "Abidjan · Yopougon",
        quartiers: [
            "Niangon Nord / Sud / Lokoa",
            "Yopougon Maroc",
            "Toits Rouges",
            "Selmer",
            "Sogefiha",
            "Port-Bouët 2",
            "Sicogi",
            "Millionnaire",
            "Gesco",
            "Kouté",
            "Bel Air / Cité Verte",
            "Sideci",
            "Zone Industrielle Yopougon",
            "Banco 2"
        ]
    },
    {
        ville: "Abidjan",
        commune: "Marcory",
        nomAffiche: "Abidjan · Marcory",
        quartiers: [
            "Zone 4 (C / Biétry)",
            "Biétry Village / Résidentiel",
            "Marcory Résidentiel",
            "Remblais",
            "Sicogi / Mille Maquis",
            "Anoumabo",
            "Sainte-Thérèse",
            "Aliodan",
            "Hibiscus"
        ]
    },
    {
        ville: "Abidjan",
        commune: "Koumassi",
        nomAffiche: "Abidjan · Koumassi",
        quartiers: [
            "Koumassi Remblais",
            "Bia Sud",
            "Progrès",
            "Sicogi",
            "Sopim",
            "Grand Campement",
            "Inch'Allah",
            "Zone Industrielle Koumassi",
            "05 / Djo 6"
        ]
    },
    {
        ville: "Abidjan",
        commune: "Le Plateau",
        nomAffiche: "Abidjan · Le Plateau",
        quartiers: [
            "Plateau Centre / Affaires",
            "Cité Administrative",
            "Commerce / Rue du Commerce",
            "Avenue Chardy / République",
            "Postel 2001 / Indénié",
            "Pyramide"
        ]
    },
    {
        ville: "Abidjan",
        commune: "Treichville",
        nomAffiche: "Abidjan · Treichville",
        quartiers: [
            "Avenue 16 à 21",
            "Arrah",
            "Quartier France",
            "Biafra",
            "Belleville",
            "Habiba",
            "Zone 3 / Portuaire"
        ]
    },
    {
        ville: "Abidjan",
        commune: "Port-Bouët",
        nomAffiche: "Abidjan · Port-Bouët",
        quartiers: [
            "Gonzagueville (Terre Rouge, Corlay)",
            "Vridi (Canal, Cité, SIR)",
            "Adjouffou",
            "Jean Folly",
            "Derrière Rail",
            "Phare / Aéroport",
            "Anani / Route de Bassam"
        ]
    },
    {
        ville: "Abidjan",
        commune: "Adjamé",
        nomAffiche: "Abidjan · Adjamé",
        quartiers: [
            "220 Logements",
            "Williamsville",
            "Liberté",
            "Mirador / Marché",
            "Bracodi",
            "Paillet",
            "Fraternité",
            "Agban Gendarmerie"
        ]
    },
    {
        ville: "Abidjan",
        commune: "Abobo",
        nomAffiche: "Abidjan · Abobo",
        quartiers: [
            "Abobo PK18",
            "Abobo Dokui",
            "Abobo Avocatier",
            "Abobo Baoulé",
            "Abobo Sagbé / Belle-Ville",
            "Abobo Anador",
            "Abobo Kennedy",
            "Abobo Clouetcha / Samaké",
            "Abobo Gare / Marché",
            "Plaque 1 & 2"
        ]
    },
    {
        ville: "Abidjan",
        commune: "Attécoubé",
        nomAffiche: "Abidjan · Attécoubé",
        quartiers: [
            "Locodjro",
            "Santé 3",
            "Sebroko",
            "Boribana",
            "Agban Village",
            "Abobodoumé"
        ]
    },
    {
        ville: "Abidjan",
        commune: "Bingerville",
        nomAffiche: "Abidjan · Bingerville",
        quartiers: [
            "Feh Kessé",
            "Akandjé",
            "Carrefour CHU Bingerville",
            "Eloka",
            "Sechbi",
            "Gbagba / Marché",
            "Cité Blanche",
            "Adjamé-Bingerville"
        ]
    },
    {
        ville: "Abidjan",
        commune: "Anyama",
        nomAffiche: "Abidjan · Anyama",
        quartiers: [
            "Anyama Centre",
            "Cité Verte",
            "Palmeraie Anyama",
            "Belle-Ville Anyama",
            "Stade Ebimpé",
            "Christianoi"
        ]
    },
    {
        ville: "Abidjan",
        commune: "Songon",
        nomAffiche: "Abidjan · Songon",
        quartiers: [
            "Songon Dagbé",
            "Songon Kassemblé",
            "Songon Agban",
            "Songon Bimbresso"
        ]
    },

    // ── PRINCIPALES VILLES & COMMUNES DE CÔTE D'IVOIRE ──
    {
        ville: "Grand-Bassam",
        nomAffiche: "Grand-Bassam",
        quartiers: [
            "Quartier France (UNESCO)",
            "Mockeyville",
            "Cité Rosiers 1 & 2",
            "Impérial",
            "Azuretti / Phare",
            "Cité CAFOP",
            "Moossou",
            "Modeste",
            "Grand-Bassam Centre"
        ]
    },
    {
        ville: "Assinie",
        nomAffiche: "Assinie & Sud-Comoé",
        quartiers: [
            "Assinie Mafia",
            "Assouindé",
            "Assinie PK 0 à 15",
            "Bord de Lagune Aby",
            "Bord de Mer (Plage)"
        ]
    },
    {
        ville: "Yamoussoukro",
        nomAffiche: "Yamoussoukro (Capitale)",
        quartiers: [
            "220 Logements",
            "Habitat",
            "Sopim",
            "Millionnaire",
            "Morofé",
            "Assabou (Près Fondation)",
            "N'Gokro",
            "Kokrenou",
            "Zone INP-HB",
            "Kodiakro"
        ]
    },
    {
        ville: "Bouaké",
        nomAffiche: "Bouaké (Gbêkê)",
        quartiers: [
            "Commerce",
            "Air France 1 & 2",
            "Kennedy",
            "Nimbo",
            "Dar-es-Salam",
            "Ahougnansou",
            "Broukro",
            "Belleville",
            "Koko",
            "N'Gattakro",
            "Zone Industrielle Bouaké"
        ]
    },
    {
        ville: "San-Pédro",
        nomAffiche: "San-Pédro (Bas-Sassandra)",
        quartiers: [
            "Cité Portuaire",
            "Balmer (Bord de Mer)",
            "Bardot",
            "Séwéké 1 & 2",
            "Lac",
            "Nitoro",
            "Zone Industrielle San-Pédro"
        ]
    },
    {
        ville: "Korhogo",
        nomAffiche: "Korhogo (Savanes)",
        quartiers: [
            "Koko",
            "Soba",
            "Petit Paris",
            "Sinistré",
            "Belle-Ville",
            "Haoussa",
            "Air France Korhogo",
            "Zone Université Péléforo"
        ]
    },
    {
        ville: "Daloa",
        nomAffiche: "Daloa (Haut-Sassandra)",
        quartiers: [
            "Commerce",
            "Tazibouo (Université)",
            "Labia",
            "Lobia 1 & 2",
            "Kennedy",
            "Huberson",
            "Gbeuliville",
            "Marais"
        ]
    },
    {
        ville: "Man",
        nomAffiche: "Man (Tonkpi)",
        quartiers: [
            "Grand Gbapleu",
            "Sari",
            "Libreville",
            "Doyagouiné 1 & 2",
            "Koko",
            "Domoraud",
            "Campus Man"
        ]
    },
    {
        ville: "Gagnoa",
        nomAffiche: "Gagnoa (Gôh)",
        quartiers: [
            "Commerce",
            "Babré",
            "Dioulabougou",
            "Gbobouo",
            "Soleil",
            "Zapora",
            "Garahio"
        ]
    },
    {
        ville: "Abengourou",
        nomAffiche: "Abengourou (Indénié-Djuablin)",
        quartiers: [
            "Plateau",
            "Agnikro",
            "Cafetou",
            "Adaou",
            "Château",
            "Kobenakro"
        ]
    },
    {
        ville: "Divo",
        nomAffiche: "Divo (Lôh-Djiboua)",
        quartiers: [
            "Bada",
            "Dougako",
            "Konankro",
            "Grémian",
            "Libreville Divo",
            "Plateau Divo"
        ]
    },
    {
        ville: "Soubré",
        nomAffiche: "Soubré (Nawa)",
        quartiers: [
            "Soubré Centre",
            "Campement",
            "Cité Barrage",
            "Gbakro",
            "Kouassi-Krom"
        ]
    }
];

export const STATUTS_PRO = [
    { value: "SALARIE_CDI", label: "Salarié CDI (Secteur privé formel)" },
    { value: "FONCTIONNAIRE", label: "Fonctionnaire / Agent de l'État" },
    { value: "SALARIE_CDD", label: "Salarié CDD / Intérim / Mission" },
    { value: "LIBERAL", label: "Profession Libérale (Médecin, Avocat, Consultant...)" },
    { value: "CHEF_ENTREPRISE", label: "Chef d'entreprise / Commerçant formel" },
    { value: "INDEPENDANT", label: "Indépendant / Freelance / Prestataire" },
    { value: "INFORMEL", label: "Activité commerciale / Secteur informel" },
    { value: "RETRAITE", label: "Retraité (CNPS / CGRAE)" },
    { value: "ETUDIANT", label: "Étudiant / Stagiaire rémunéré" },
    { value: "DIASPORA", label: "Diaspora / Salarié international" }
];

export const FOURCHETTES_REVENU = [
    { value: "MOINS_100K", label: "Moins de 100 000 XOF" },
    { value: "100K_250K", label: "100 000 — 250 000 XOF" },
    { value: "250K_500K", label: "250 000 — 500 000 XOF" },
    { value: "500K_1M", label: "500 000 — 1 000 000 XOF" },
    { value: "1M_2M", label: "1 000 000 — 2 000 000 XOF" },
    { value: "PLUS_2M", label: "Plus de 2 000 000 XOF" }
];

export const PERIODES_EMMENAGEMENT = [
    { value: "IMMEDIAT", label: "⚡ Immédiat (Moins de 15 jours)", days: 0 },
    { value: "MOIS_1", label: "📅 Dans 1 mois", days: 30 },
    { value: "MOIS_2", label: "📅 Dans 2 mois", days: 60 },
    { value: "MOIS_3_PLUS", label: "📅 Dans 3 mois ou plus", days: 90 },
    { value: "CUSTOM", label: "🗓️ Date spécifique", days: 0 }
];

export const TYPES_LOGEMENT_OPTIONS = [
    "Studio (1 pièce)",
    "2 Pièces (1 chambre)",
    "3 Pièces (2 chambres)",
    "4 Pièces et plus",
    "Villa basse",
    "Villa duplex / Triplex",
    "Meublé"
];

export const CRITERES_LOCALISATION_RAPIDES = [
    "Bordure de goudron / Voie bitumée",
    "Zone haute non inondable",
    "Accès direct VTC & Taxis",
    "Arrêt SOTRA / Gare accessible",
    "Proximité Écoles & Lycées",
    "Marché & Commerces à proximité",
    "Proximité Clinique / CHU",
    "Cité fermée avec vigile 24h/7j",
    "Environnement calme / Résidentiel",
    "Compteur CIE & SODECI individuel"
];

