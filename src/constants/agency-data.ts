export const T = {
  navy: "#071A45",
  navyLight: "#0D2B6E",
  navyDark: "#030C1F",
  navyPale: "#F0F3F9",
  orange: "#E67E22",
  orangePale: "#FEF5ED",
  green: "#27AE60",
  greenPale: "#EDF7F1",
  red: "#C0392B",
  redPale: "#F9EDED",
  teal: "#16A085",
  tealPale: "#ECF6F5",
  gold: "#D4AF37",
  goldPale: "#FAF7ED",
  purple: "#8E44AD",
  purplePale: "#F4EDF7",
  grey1: "#F8FAFC",
  grey2: "#E2E8F0",
  grey3: "#94A3B8",
  white: "#FFFFFF",
  text: "#1E293B",
  textMid: "#475569",
  textLight: "#64748B",
};

export const biens = [
  { id: 1, adresse: "Villa 7 · Cocody Ambassades", type: "Villa F6", loyer: 2500000, statut: "occupé", paiement: "Encaissé", locataire: "Mme Bamba Fatou", proprio: "M. Kouassi" },
  { id: 2, adresse: "Appt 3B · Plateau Résidence", type: "Appt F4", loyer: 850000, statut: "occupé", paiement: "Encaissé", locataire: "M. Traoré Souleymane", proprio: "SCI Le Golfe" },
  { id: 3, adresse: "Studio A2 · Marcory Zone 4", type: "Studio meublé", loyer: 75000, statut: "vacant", paiement: "—", locataire: null, proprio: "M. Eto Konan" },
  { id: 4, adresse: "Cour Yopougon · Niangon Nord", type: "Chambre salon", loyer: 65000, statut: "occupé", paiement: "Impayé", locataire: "M. Gnahoré Eric", proprio: "Mme Koffi" },
  { id: 5, adresse: "Villa 12 · Riviera 3", type: "Villa F5", loyer: 1200000, statut: "occupé", paiement: "Encaissé", locataire: "M. Bakayoko", proprio: "M. Kouassi" },
];

export const candidats = [
  { id: 101, nom: "M. Diallo Moussa", emploi: "Cadre Orange CI", loyer_max: 450000, score: 785, statut: "Qualifié", docs: 5, tel: "07 08 09 10 11", autorisation: "accordée", autoDate: "20/03/2026" },
  { id: 102, nom: "Mme Yao Amenan", emploi: "Institutrice", loyer_max: 180000, score: 620, statut: "En cours", docs: 3, tel: "05 44 33 22 11", autorisation: "en attente", autoDate: null },
  { id: 103, nom: "M. Koffi Kouamé", emploi: "Entrepreneur", loyer_max: 900000, score: 340, statut: "Qualifié", docs: 4, tel: "01 02 03 04 05", autorisation: "refusée", autoDate: null },
];

export const modules = [
  { icon: "📸", code: "M-EDL",      label: "États des lieux",       sub: "Photos certifiées · comparatif entrée/sortie · retenues caution", score: 9,  color: T.green,     kpi: "3 EDL en cours",         kpiColor: T.green },
  { icon: "🔏", code: "M-SIGN",     label: "Signatures électroniques", sub: "Baux · Mandats · EDL · Avenants · Accords médiation",          score: 9,  color: T.teal,      kpi: "2 en attente",           kpiColor: T.orange },
  { icon: "🔧", code: "M-MAINT",    label: "Suivi maintenance",      sub: "Prestataires · tickets travaux · coûts · historique",            score: 8,  color: T.orange,    kpi: "1 ticket ouvert",        kpiColor: T.red },
  { icon: "💰", code: "M-CHARGES",  label: "Gestion des charges",    sub: "Calculs · régularisations annuelles · appels de charges",        score: 9,  color: T.navy,      kpi: "Régul. Avril due",       kpiColor: T.orange },
  { icon: "📒", code: "M-COMPTA",   label: "Comptabilité",           sub: "CRG mensuels · liasse fiscale · export comptable propriétaire",  score: 10, color: T.purple,    kpi: "Mars 2026 prêt",         kpiColor: T.green },
  { icon: "📅", code: "M-AGENDA",   label: "Agenda & CRM",           sub: "Visites · contacts · relances · historique client",              score: 8,  color: T.navyLight, kpi: "4 RDV cette semaine",    kpiColor: T.navy },
  { icon: "📣", code: "M-ANNONCES", label: "Annonces vacance",       sub: "Publication · photos · suivi diffusion · historique",            score: 7,  color: T.gold,      kpi: "1 bien vacant",          kpiColor: T.orange },
];
