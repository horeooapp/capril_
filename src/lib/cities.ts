/**
 * QAPRIL - Référentiel des Villes et Communes de Côte d'Ivoire
 * 20 principales villes de Côte d'Ivoire et communes associées.
 */

export const VILLES_PRINCIPALES_CI = [
    "Abidjan",
    "Bouaké",
    "Daloa",
    "Korhogo",
    "Yamoussoukro",
    "San-Pédro",
    "Gagnoa",
    "Man",
    "Divo",
    "Soubré",
    "Anyama",
    "Bingerville",
    "Grand-Bassam",
    "Abengourou",
    "Agboville",
    "Dabou",
    "Bondoukou",
    "Séguéla",
    "Ferkessédougou",
    "Dimbokro"
] as const;

export type VillePrincipaleCI = (typeof VILLES_PRINCIPALES_CI)[number];

export const COMMUNES_ABIDJAN = [
    "Cocody",
    "Marcory",
    "Plateau",
    "Treichville",
    "Yopougon",
    "Abobo",
    "Koumassi",
    "Adjamé",
    "Attécoubé",
    "Port-Bouët",
    "Bingerville",
    "Songon",
    "Anyama"
] as const;

export const COMMUNES_PAR_VILLE: Record<string, string[]> = {
    "Abidjan": [...COMMUNES_ABIDJAN],
    "Bouaké": ["Bouaké Centre", "Air France", "Commerce", "Koko", "Nimbo", "Belleville", "Ahougnansou", "Kennedy"],
    "Yamoussoukro": ["Yamoussoukro Centre", "Habitat", "Dioulakro", "Morofé", "N'zuessy", "Assabou", "Kokrenou"],
    "San-Pédro": ["San-Pédro Centre", "Cité", "Bardot", "Séwéké", "Balmer", "Zone Industrielle"],
    "Grand-Bassam": ["Grand-Bassam Centre", "Quartier France", "Mockeyville", "Impérial", "Cafop", "Phare"],
    "Daloa": ["Daloa Centre", "Tazibouo", "Lobia", "Gbeuliville", "Commerce", "Kennedy", "Marais"],
    "Korhogo": ["Korhogo Centre", "Soba", "Koko", "Sinistré", "Tchékélé", "Air France", "Résidentiel"],
    "Gagnoa": ["Gagnoa Centre", "Babré", "Dioulabougou", "Garahio", "Zapakah", "Barouhio"],
    "Man": ["Man Centre", "Grand Gbapleu", "Domoraud", "Koko", "Libreville", "Doyagouiné"],
    "Divo": ["Divo Centre", "Grémian", "Bada", "Libertè", "Boudoukou"],
    "Soubré": ["Soubré Centre", "Gbakro", "Camp Militaire", "Madinani"],
    "Abengourou": ["Abengourou Centre", "Plateau", "Agnikro", "Café-Cacao", "Château d'Eau"],
    "Agboville": ["Agboville Centre", "Artisanal", "Samba", "Commerce"],
    "Dabou": ["Dabou Centre", "Kpass", "Bédi", "Armebé"],
    "Bondoukou": ["Bondoukou Centre", "Zanzan", "Donzossan", "Malan"],
    "Séguéla": ["Séguéla Centre", "Bakayoko", "Binzala"],
    "Ferkessédougou": ["Ferkessédougou Centre", "Bromakoté", "Résidentiel"],
    "Dimbokro": ["Dimbokro Centre", "Bocabo", "Commerce", "Dioulakro"]
};
