const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, VerticalAlign, LevelFormat, PageBreak
} = require('docx');
const fs = require('fs');

// ─── Palette ──────────────────────────────────────────────────────
const C = {
  noir:       "0D0D0D",
  blueDark:   "0D2B4E",
  blueMid:    "1A5FA8",
  blueLight:  "C8DCF0",
  bluePale:   "EBF3FA",
  or:         "B8892A",
  orLight:    "FDF6E3",
  vert:       "1A6B3C",
  vertLight:  "E3F5EA",
  rouge:      "B91C1C",
  rougeLight: "FEE2E2",
  violet:     "5B2D8E",
  violetLight:"F0EBF8",
  gris1:      "1F2937",
  gris2:      "4B5563",
  gris3:      "9CA3AF",
  gris4:      "F3F4F6",
  gris5:      "E5E7EB",
  blanc:      "FFFFFF",
};

// ─── Helpers de base ──────────────────────────────────────────────
const bdr = (style, color="CCCCCC", size=1) => ({ style, size, color });
const bAll  = (c="CCCCCC") => ({ top:bdr(BorderStyle.SINGLE,c), left:bdr(BorderStyle.SINGLE,c), bottom:bdr(BorderStyle.SINGLE,c), right:bdr(BorderStyle.SINGLE,c) });
const bNone = () => ({ top:bdr(BorderStyle.NONE,"FFFFFF"), left:bdr(BorderStyle.NONE,"FFFFFF"), bottom:bdr(BorderStyle.NONE,"FFFFFF"), right:bdr(BorderStyle.NONE,"FFFFFF") });
// OOXML order: top, left, bottom, right
const bLeft = (color, size=20) => ({ top:bdr(BorderStyle.NONE,"FFFFFF"), left:{style:BorderStyle.SINGLE,size,color}, bottom:bdr(BorderStyle.NONE,"FFFFFF"), right:bdr(BorderStyle.NONE,"FFFFFF") });
const bBottom = (color, size=8) => ({ top:bdr(BorderStyle.NONE,"FFFFFF"), left:bdr(BorderStyle.NONE,"FFFFFF"), bottom:{style:BorderStyle.SINGLE,size,color}, right:bdr(BorderStyle.NONE,"FFFFFF") });

function run(text, {bold=false,italic=false,color=C.gris1,size=20,font="Arial"}={}) {
  return new TextRun({text,bold,italics:italic,color,size,font});
}

function cell(text, {bold=false,color=C.gris1,bg=C.blanc,w=2340,align=AlignmentType.LEFT,size=19,italic=false,vTop=false,colspan}={}) {
  const cfg = {
    borders: bAll("DDDDDD"),
    width:{size:w,type:WidthType.DXA},
    shading:{fill:bg,type:ShadingType.CLEAR},
    margins:{top:90,bottom:90,left:130,right:130},
    verticalAlign: vTop ? VerticalAlign.TOP : VerticalAlign.CENTER,
    children:[new Paragraph({alignment:align, children:[run(text,{bold,color,size,italic})]})]
  };
  if(colspan) cfg.columnSpan=colspan;
  return new TableCell(cfg);
}

const ch = (text,w=2340,bg=C.blueDark,fg=C.blanc) =>
  cell(text,{bold:true,color:fg,bg,w,size:19});

const tbl = (cols,rows) => new Table({
  width:{size:9026,type:WidthType.DXA}, columnWidths:cols, rows
});
const row = (...cells) => new TableRow({children:cells});

// ─── Éléments typographiques ──────────────────────────────────────
const h1 = (text) => new Paragraph({
  heading:HeadingLevel.HEADING_1,
  spacing:{before:520,after:200},
  border: bBottom(C.blueMid,10),
  children:[run(text,{bold:true,size:38,color:C.blueDark})]
});
const h2 = (text) => new Paragraph({
  heading:HeadingLevel.HEADING_2,
  spacing:{before:360,after:140},
  children:[run(text,{bold:true,size:28,color:C.blueMid})]
});
const h3 = (text,color=C.or) => new Paragraph({
  spacing:{before:220,after:100},
  children:[run(text,{bold:true,size:24,color})]
});
const h4 = (text,color=C.gris1) => new Paragraph({
  spacing:{before:140,after:60},
  children:[run(text,{bold:true,size:21,color})]
});
const p = (text,{color=C.gris1,size=20,italic=false,indent=0}={}) => new Paragraph({
  spacing:{before:60,after:80},
  indent:indent?{left:indent}:undefined,
  children:[run(text,{color,size,italic})]
});
const bl = (text,{bold=false,color=C.gris1,size=20}={},lvl=0) => new Paragraph({
  numbering:{reference:"bl",level:lvl},
  spacing:{before:40,after:40},
  children:[run(text,{bold,color,size})]
});
const sp = (h=120) => new Paragraph({spacing:{before:h,after:0},children:[run("")]});
const pb = () => new Paragraph({children:[new PageBreak()]});

// Boîte colorée avec bordure gauche
const box = (text,borderColor=C.blueMid,bg=C.bluePale,{bold=false,size=20,italic=true}={}) =>
  new Paragraph({
    spacing:{before:100,after:100},
    shading:{fill:bg,type:ShadingType.CLEAR},
    border:bLeft(borderColor,20),
    indent:{left:360,right:180},
    children:[run(text,{color:C.gris1,size,bold,italic})]
  });

// Boîte pleine (surlignée)
const boxFull = (text,bg=C.blueDark,color=C.blanc,{size=21,bold=true}={}) =>
  new Paragraph({
    spacing:{before:80,after:80},
    shading:{fill:bg,type:ShadingType.CLEAR},
    indent:{left:320,right:180},
    children:[run(text,{color,size,bold})]
  });

// Ligne de séparateur
const sep = (color=C.gris5) => new Paragraph({
  spacing:{before:60,after:60},
  border:bBottom(color,4),
  children:[run("")]
});

// ═══════════════════════════════════════════════════════
// PAGE DE COUVERTURE
// ═══════════════════════════════════════════════════════
const cover = [
  sp(1200),
  new Paragraph({
    alignment:AlignmentType.CENTER, spacing:{before:0,after:40},
    children:[run("qapril",{bold:true,size:96,color:C.blueDark})]
  }),
  new Paragraph({
    alignment:AlignmentType.CENTER, spacing:{before:0,after:60},
    children:[run("Plateforme Locative Ivoirienne",{size:26,color:C.gris2,italic:true})]
  }),
  new Paragraph({
    alignment:AlignmentType.CENTER, spacing:{before:0,after:0},
    border:{top:bdr(BorderStyle.SINGLE,C.or,12), left:bdr(BorderStyle.NONE,"FFFFFF"), bottom:bdr(BorderStyle.SINGLE,C.or,12), right:bdr(BorderStyle.NONE,"FFFFFF")},
    children:[run(" ",{size:8})]
  }),
  sp(160),
  new Paragraph({
    alignment:AlignmentType.CENTER, spacing:{before:0,after:80},
    children:[run("NOUVEAU MODÈLE ÉCONOMIQUE",{bold:true,size:52,color:C.blueDark})]
  }),
  new Paragraph({
    alignment:AlignmentType.CENTER, spacing:{before:0,after:50},
    children:[run("Enregistrement du Bail + Capitalisation des Données",{bold:true,size:30,color:C.blueMid})]
  }),
  new Paragraph({
    alignment:AlignmentType.CENTER, spacing:{before:0,after:40},
    children:[run("Note Stratégique & Plan d'Exécution",{size:22,color:C.gris2,italic:true})]
  }),
  sp(400),
  tbl([1800,5426,1800],[
    row(cell("Statut",{w:1800,bold:true,bg:C.gris4}), cell("Document de travail interne — Confidentiel",{w:5426,bold:true,color:C.rouge}), cell("Juin 2026",{w:1800,align:AlignmentType.RIGHT})),
    row(cell("Version",{w:1800,bold:true,bg:C.gris4}), cell("v2.0 — Pivot stratégique",{w:5426}), cell("Fondateur",{w:1800,align:AlignmentType.RIGHT})),
    row(cell("Objet",{w:1800,bold:true,bg:C.gris4}), cell("Redéfinition du modèle de revenus autour de deux leviers structurants",{w:5426}), cell("qapril",{w:1800,align:AlignmentType.RIGHT,bold:true,color:C.blueDark})),
  ]),
  pb(),
];

// ═══════════════════════════════════════════════════════
// SECTION 1 — LE DIAGNOSTIC : POURQUOI LE PIVOT
// ═══════════════════════════════════════════════════════
const s1 = [
  h1("1. LE DIAGNOSTIC : POURQUOI CE PIVOT"),
  h2("1.1 Ce que le marché nous enseigne"),
  p("Après analyse approfondie du marché locatif ivoirien et des tentatives de monétisation observées chez les acteurs en présence, une conviction s'impose : la monétisation par l'accès à la plateforme est structurellement inadaptée au contexte ivoirien."),
  p("Les raisons sont simples et irréfutables :"),
  sp(40),
  bl("La majorité des propriétaires gèrent 1 à 3 biens — leur sensibilité au prix est élevée, leur tolérance à l'abonnement est faible"),
  bl("Les agences, bien que plus solvables, n'adoptent une solution SaaS que si elle remplace un outil existant — or qapril est un marché nouveau"),
  bl("Le locataire est le maillon le plus mobile et le plus motivé à payer au moment précis où il accède à un logement"),
  bl("La donnée produite par chaque bail a une valeur croissante dans le temps — c'est un actif qui s'apprécie, pas un service qui se consomme"),
  sp(60),
  h2("1.2 Le problème du modèle précédent"),
  tbl([3400,2813,2813],[
    row(ch("Levier envisagé",3400), ch("Problème structurel",2813), ch("Verdict",2813)),
    row(cell("Abonnement propriétaire/agence",{w:3400}), cell("Friction à l'adoption, résistance culturelle au SaaS immobilier",{w:2813}), cell("Abandonner",{w:2813,bold:true,color:C.rouge})),
    row(cell("Commission sur flux de loyer",{w:3400,bg:C.gris4}), cell("Nécessite un agrément BCEAO + négociation opérateurs complexe",{w:2813,bg:C.gris4}), cell("Différer",{w:2813,bold:true,color:C.or,bg:C.gris4})),
    row(cell("Float sur dépôts de garantie",{w:3400}), cell("Délai réglementaire 12-18 mois, dépend d'un partenaire bancaire",{w:2813}), cell("Différer",{w:2813,bold:true,color:C.or})),
    row(cell("Assurance loyer impayé",{w:3400,bg:C.gris4}), cell("Nécessite masse critique de données avant de devenir crédible",{w:2813,bg:C.gris4}), cell("Préparer",{w:2813,bold:true,color:C.blueMid,bg:C.gris4})),
    row(cell("Frais d'enregistrement du bail",{w:3400,bg:C.vertLight}), cell("Moment naturel de paiement, besoin réel, friction nulle",{w:2813,bg:C.vertLight}), cell("PRIORITÉ 1",{w:2813,bold:true,color:C.vert,bg:C.vertLight})),
    row(cell("Capitalisation et vente de données",{w:3400,bg:C.vertLight}), cell("Actif qui se construit automatiquement à chaque bail enregistré",{w:2813,bg:C.vertLight}), cell("PRIORITÉ 2",{w:2813,bold:true,color:C.vert,bg:C.vertLight})),
  ]),
  sp(80),
  h2("1.3 La nouvelle équation"),
  box(
    "Le nouveau modèle repose sur deux leviers uniquement : (1) un revenu transactionnel immédiat sur l'enregistrement du bail, payé par le locataire ; (2) un revenu récurrent et croissant issu de la valorisation des données agrégées auprès de trois classes d'acheteurs institutionnels. Tout le reste est secondaire et différé.",
    C.blueDark, C.bluePale, {bold:false,size:21,italic:false}
  ),
  pb(),
];

// ═══════════════════════════════════════════════════════
// SECTION 2 — LEVIER 1 : L'ENREGISTREMENT DU BAIL
// ═══════════════════════════════════════════════════════
const s2 = [
  h1("2. LEVIER 1 — L'ENREGISTREMENT DU BAIL"),
  box("Principe : chaque bail formalisé sur qapril donne lieu à des frais d'enregistrement payés par le locataire. C'est le seul moment où la motivation à payer est maximale des deux côtés — le locataire veut sa protection légale, le propriétaire veut sa garantie.", C.or, C.orLight, {italic:false}),
  sp(80),

  h2("2.1 Pourquoi le locataire et pas le propriétaire"),
  p("Ce choix n'est pas arbitraire. Il repose sur une lecture précise des comportements de marché :"),
  sp(40),
  tbl([4513,4513],[
    row(ch("Si le propriétaire paie",4513,C.rougeLight,C.rouge), ch("Si le locataire paie",4513,C.vertLight,C.vert)),
    row(cell("Résistance forte — il perçoit qapril comme un outil de contrôle de ses pratiques",{w:4513}), cell("Acceptation naturelle — il paye pour obtenir un droit : la sécurité juridique de son bail",{w:4513})),
    row(cell("Le propriétaire peut contourner en restant informel",{w:4513,bg:C.gris4}), cell("Le locataire est le demandeur — il a besoin du bail signé pour son dossier bancaire, visa, employeur",{w:4513,bg:C.gris4})),
    row(cell("Adoption lente — il faut convaincre le propriétaire de changer ses habitudes",{w:4513}), cell("Adoption rapide — le locataire tire le propriétaire vers la formalisation",{w:4513})),
    row(cell("Sensible au prix : payer pour un outil qu'il n'a pas demandé",{w:4513,bg:C.gris4}), cell("Insensible au prix : c'est un coût d'entrée dans un logement, intégré dans son budget de déménagement",{w:4513,bg:C.gris4})),
  ]),
  sp(80),

  h2("2.2 Structure des frais d'enregistrement"),
  p("Les frais sont proportionnels au montant du loyer mensuel, afin de s'adapter à tous les segments du marché — du studio à 60 000 FCFA à la villa à 800 000 FCFA."),
  sp(50),
  tbl([2800,1557,1557,1557,1555],[
    row(ch("Segment locatif",2800), ch("Loyer mensuel",1557), ch("Frais d'enreg.",1557), ch("Taux effectif",1557), ch("Remarque",1555)),
    row(cell("Entrée de gamme",{w:2800}), cell("< 80 000 FCFA",{w:1557,align:AlignmentType.CENTER}), cell("5 000 FCFA",{w:1557,align:AlignmentType.CENTER,bold:true}), cell("~6%",{w:1557,align:AlignmentType.CENTER}), cell("Quartiers populaires, Yopougon, Abobo",{w:1555,italic:true,size:18})),
    row(cell("Milieu de gamme",{w:2800,bg:C.gris4}), cell("80 – 200 000 FCFA",{w:1557,align:AlignmentType.CENTER,bg:C.gris4}), cell("10 000 FCFA",{w:1557,align:AlignmentType.CENTER,bold:true,bg:C.gris4}), cell("5–12%",{w:1557,align:AlignmentType.CENTER,bg:C.gris4}), cell("Cocody, Marcory, Treichville",{w:1555,italic:true,size:18,bg:C.gris4})),
    row(cell("Haut de gamme",{w:2800}), cell("200 000 – 500 000 FCFA",{w:1557,align:AlignmentType.CENTER}), cell("25 000 FCFA",{w:1557,align:AlignmentType.CENTER,bold:true}), cell("5–12%",{w:1557,align:AlignmentType.CENTER}), cell("Plateau, Riviera, Zone 4",{w:1555,italic:true,size:18})),
    row(cell("Premium / Villa",{w:2800,bg:C.gris4}), cell("> 500 000 FCFA",{w:1557,align:AlignmentType.CENTER,bg:C.gris4}), cell("50 000 FCFA",{w:1557,align:AlignmentType.CENTER,bold:true,bg:C.gris4}), cell("< 10%",{w:1557,align:AlignmentType.CENTER,bg:C.gris4}), cell("Villas, duplex expatriés, diaspora",{w:1555,italic:true,size:18,bg:C.gris4})),
  ]),
  sp(60),
  p("Note de positionnement : ces frais sont présentés au locataire comme « frais de formalisation et de protection juridique du bail » — jamais comme « frais de plateforme ». La valeur perçue est concrète : un document légal, un QR code de vérification, une preuve horodatée.", {italic:true,color:C.gris2,size:18}),
  sp(80),

  h2("2.3 Ce que le locataire reçoit en échange"),
  p("Les frais d'enregistrement ne sont pas un ticket d'entrée — ils déclenchent un bouquet de valeur tangible qui justifie le paiement et différencie qapril de tout autre outil :"),
  sp(40),
  tbl([400,3200,5426],[
    row(ch("",400), ch("Ce que le locataire reçoit",3200), ch("Valeur perçue",5426)),
    row(
      cell("01",{w:400,bold:true,bg:C.blueDark,color:C.blanc,align:AlignmentType.CENTER}),
      cell("Bail numérique signé électroniquement et horodaté",{w:3200,bold:true}),
      cell("Pièce justificative légale pour banque, employeur, ambassade, CAF — valeur inestimable pour le locataire formel",{w:5426})
    ),
    row(
      cell("02",{w:400,bold:true,bg:C.blueMid,color:C.blanc,align:AlignmentType.CENTER}),
      cell("Quittance de loyer automatique chaque mois",{w:3200,bold:true,bg:C.gris4}),
      cell("Preuve de paiement mensuelle — utilisable pour demandes de crédit, dossiers administratifs",{w:5426,bg:C.gris4})
    ),
    row(
      cell("03",{w:400,bold:true,bg:C.or,color:C.blanc,align:AlignmentType.CENTER}),
      cell("Passeport Locatif qapril (score de fiabilité)",{w:3200,bold:true}),
      cell("Historique de paiement certifié — accélère les futures recherches de logement, crée une réputation locative portable",{w:5426})
    ),
    row(
      cell("04",{w:400,bold:true,bg:C.vert,color:C.blanc,align:AlignmentType.CENTER}),
      cell("Protection légale : accès à la médiation et aux procédures",{w:3200,bold:true,bg:C.gris4}),
      cell("En cas de litige avec le propriétaire, le locataire dispose d'un dossier complet et d'une voie de recours intégrée",{w:5426,bg:C.gris4})
    ),
    row(
      cell("05",{w:400,bold:true,bg:C.violet,color:C.blanc,align:AlignmentType.CENTER}),
      cell("Alertes et rappels de loyer automatiques",{w:3200,bold:true}),
      cell("Évite les oublis, les retards involontaires et les pénalités — service perçu comme un assistant personnel",{w:5426})
    ),
  ]),
  sp(80),

  h2("2.4 Projection financière — Levier 1"),
  sp(40),
  tbl([3200,1957,1957,1912],[
    row(ch("Paramètre",3200), ch("An 1",1957), ch("An 2",1957), ch("An 3",1912)),
    row(cell("Nouveaux baux enregistrés/mois",{w:3200}), cell("300",{w:1957,align:AlignmentType.CENTER}), cell("900",{w:1957,align:AlignmentType.CENTER}), cell("2 500",{w:1912,align:AlignmentType.CENTER})),
    row(cell("Frais moyen pondéré par bail",{w:3200,bg:C.gris4}), cell("10 000 FCFA",{w:1957,align:AlignmentType.CENTER,bg:C.gris4}), cell("12 000 FCFA",{w:1957,align:AlignmentType.CENTER,bg:C.gris4}), cell("15 000 FCFA",{w:1912,align:AlignmentType.CENTER,bg:C.gris4})),
    row(cell("Revenu mensuel",{w:3200}), cell("3 M FCFA",{w:1957,align:AlignmentType.CENTER}), cell("10,8 M FCFA",{w:1957,align:AlignmentType.CENTER}), cell("37,5 M FCFA",{w:1912,align:AlignmentType.CENTER})),
    row(cell("Revenu annuel estimé",{w:3200,bold:true,bg:C.vertLight}), cell("36 M FCFA",{w:1957,align:AlignmentType.CENTER,bold:true,color:C.vert,bg:C.vertLight}), cell("130 M FCFA",{w:1957,align:AlignmentType.CENTER,bold:true,color:C.vert,bg:C.vertLight}), cell("450 M FCFA",{w:1912,align:AlignmentType.CENTER,bold:true,color:C.vert,bg:C.vertLight})),
    row(cell("Cumulé 3 ans",{w:3200,bold:true,bg:C.blueDark,color:C.blanc}), cell("",{w:1957,bg:C.blueDark}), cell("",{w:1957,bg:C.blueDark}), cell("~616 M FCFA",{w:1912,align:AlignmentType.CENTER,bold:true,bg:C.blueDark,color:C.blanc})),
  ]),
  sp(60),
  p("Ces projections reposent sur une adoption initiale concentrée sur Abidjan (communes de Cocody, Yopougon, Marcory, Plateau), avec une extension progressive vers Bouaké, San-Pédro et les villes secondaires en année 3.", {italic:true,color:C.gris2,size:18}),
  sp(80),

  h2("2.5 Mécanisme d'adoption : comment atteindre 300 baux/mois dès l'An 1"),
  h3("Canal 1 — Les agences immobilières (effet levier immédiat)",C.blueMid),
  p("Une agence qui signe 10 baux par mois génère automatiquement 10 enregistrements qapril. L'agence n'est pas le payeur — elle est le prescripteur. Elle a intérêt à utiliser qapril car le bail numérique valorise son professionnalisme auprès des clients."),
  bl("Objectif An 1 : 30 agences partenaires à Abidjan × 10 baux/mois = 300 baux/mois"),
  bl("Incentive agence : badge « Agence certifiée qapril » + profil vérifié dans l'annuaire = outil commercial gratuit"),
  bl("Modèle de commission agence : l'agence collecte les frais et reverse à qapril — elle peut prendre 10-15% de commission de collecte"),
  sp(60),
  h3("Canal 2 — La prescription locataire directe (croissance organique)",C.blueMid),
  p("Un locataire qui a obtenu son Passeport Locatif qapril est incité à l'utiliser pour son prochain bail. Le score de fiabilité ne vaut que s'il est mis à jour — c'est un mécanisme de rétention naturel."),
  bl("Chaque locataire enregistré devient un ambassadeur potentiel auprès de ses proches"),
  bl("Le Passeport Locatif est partageable (QR code) — il circule sur WhatsApp, crée de la visibilité organique"),
  sp(60),
  h3("Canal 3 — Partenariats institutionnels (CDC/ANAH comme prescripteurs)",C.blueMid),
  p("Si la CDC ou l'ANAH recommande officiellement l'enregistrement des baux sur qapril, chaque acteur du marché qui veut être en conformité sera naturellement dirigé vers la plateforme."),
  bl("Ce canal transforme une décision réglementaire en moteur d'acquisition massif et peu coûteux"),
  bl("C'est l'argument central à porter dans toute discussion avec les institutions"),
  pb(),
];

// ═══════════════════════════════════════════════════════
// SECTION 3 — LEVIER 2 : CAPITALISATION DES DONNÉES
// ═══════════════════════════════════════════════════════
const s3 = [
  h1("3. LEVIER 2 — LA CAPITALISATION DES DONNÉES"),
  box("Principe : chaque bail enregistré produit des données structurées sur le marché locatif ivoirien. Agrégées, anonymisées et structurées, ces données constituent un actif unique vendable à trois classes d'acheteurs — des institutions qui n'ont accès à aucune autre source de cette qualité.", C.violet, C.violetLight, {italic:false}),
  sp(80),

  h2("3.1 Comprendre la nature de l'actif"),
  p("Il faut d'abord comprendre ce que qapril produit réellement. Ce n'est pas une application immobilière. C'est une machine à produire de la donnée structurée sur le marché locatif formel et informel de Côte d'Ivoire."),
  sp(50),
  tbl([3000,6026],[
    row(ch("Donnée produite par qapril",3000), ch("Ce qu'elle permet de calculer",6026)),
    row(cell("Montant de loyer + commune + type de bien",{w:3000,bold:true}), cell("Loyer médian par quartier, par type de bien, par superficie — l'équivalent d'un indice de référence des loyers (inexistant en CI)",{w:6026})),
    row(cell("Statut de paiement mensuel du locataire",{w:3000,bold:true,bg:C.gris4}), cell("Taux d'impayé réel par commune, par profil socio-économique, par saison — donnée actuarielle unique pour les assureurs",{w:6026,bg:C.gris4})),
    row(cell("Score de fiabilité locataire (fraudScore)",{w:3000,bold:true}), cell("Capacité de remboursement locatif — indicateur de solvabilité alternatif exploitable par les banques pour le crédit habitat",{w:6026})),
    row(cell("Durée des baux + motifs de rupture",{w:3000,bold:true,bg:C.gris4}), cell("Taux de rotation locative par zone — signal d'attractivité pour les promoteurs et investisseurs",{w:6026,bg:C.gris4})),
    row(cell("Géolocalisation des biens loués",{w:3000,bold:true}), cell("Cartographie du parc locatif actif — donnée de planification urbaine pour l'État, l'ANAH, les collectivités",{w:6026})),
    row(cell("Délais et issues des médiations",{w:3000,bold:true,bg:C.gris4}), cell("Indicateur de conflictualité locative par quartier — donnée juridique et sociale pour les régulateurs",{w:6026,bg:C.gris4})),
  ]),
  sp(80),

  h2("3.2 Les trois marchés de la donnée"),
  sp(50),

  // MARCHÉ A
  h3("MARCHÉ A — Institutions Financières : Banques & Assureurs", C.blueMid),
  box("C'est le marché le plus immédiat et le plus solvable. Les banques et assureurs cherchent des signaux de solvabilité alternatifs pour les populations non bancarisées. qapril détient le seul historique de paiement locatif structuré de Côte d'Ivoire.", C.blueMid, C.bluePale, {italic:false,size:19}),
  sp(50),
  tbl([3000,3013,3013],[
    row(ch("Produit de donnée",3000), ch("Acheteur cible",3013), ch("Modèle tarifaire",3013)),
    row(cell("Score de solvabilité locataire",{w:3000,bold:true}), cell("Banques (BNI, SGBCI, Ecobank, Coris) pour crédit habitat et microfinance",{w:3013}), cell("1 000 – 3 000 FCFA / appel API",{w:3013,bold:true,color:C.vert})),
    row(cell("Taux d'impayé par commune et profil",{w:3000,bold:true,bg:C.gris4}), cell("Assureurs (NSIA, Allianz CI, Saham) pour calibrer les primes d'assurance loyer",{w:3013,bg:C.gris4}), cell("Licence annuelle : 5 – 15 M FCFA",{w:3013,bold:true,color:C.vert,bg:C.gris4})),
    row(cell("Données de sinistralité locative",{w:3000,bold:true}), cell("Réassureurs et fonds de garantie régionaux (CAARAMA, ZEP-RE)",{w:3013}), cell("Rapport semestriel : 2 – 5 M FCFA",{w:3013,bold:true,color:C.vert})),
  ]),
  sp(70),
  h4("Condition de déclenchement"),
  p("Ce marché devient accessible à partir de 3 000 baux actifs avec au moins 12 mois d'historique de paiement. Cible : fin An 1 / début An 2."),
  sp(80),

  // MARCHÉ B
  h3("MARCHÉ B — État & Régulateurs : CDC, ANAH, Collectivités", C.or),
  box("Ce marché est le plus stratégique sur le long terme. L'État ivoirien n'a aucune vision chiffrée du marché locatif informel. qapril peut devenir l'outil de connaissance et de régulation de ce marché — en échange d'une légitimité institutionnelle.", C.or, C.orLight, {italic:false,size:19}),
  sp(50),
  tbl([3000,3013,3013],[
    row(ch("Produit de donnée",3000), ch("Acheteur cible",3013), ch("Modèle tarifaire",3013)),
    row(cell("Cartographie du parc locatif actif par commune",{w:3000,bold:true}), cell("ANAH (planification du logement), Ministère de la Construction",{w:3013}), cell("Contrat de données annuel : 20 – 50 M FCFA",{w:3013,bold:true,color:C.vert})),
    row(cell("Indice de référence des loyers Abidjan",{w:3000,bold:true,bg:C.gris4}), cell("CDC, Trésor public, régulateurs UEMOA",{w:3013,bg:C.gris4}), cell("Publication officielle co-brandée : 10 M FCFA/an",{w:3013,bold:true,color:C.vert,bg:C.gris4})),
    row(cell("Tableaux de bord locatif temps réel",{w:3000,bold:true}), cell("Collectivités locales (mairies d'Abidjan, Bouaké)",{w:3013}), cell("Licence SaaS institutionnelle : 5 – 10 M FCFA/an",{w:3013,bold:true,color:C.vert})),
  ]),
  sp(70),
  h4("Valeur stratégique additionnelle"),
  p("Ce marché génère autre chose que du revenu : il génère de la légitimité. Une CDC ou un Ministère qui cite qapril comme source de données sur le marché locatif CI rend toute concurrence structurellement impossible. C'est une barrière réglementaire naturelle."),
  sp(80),

  // MARCHÉ C
  h3("MARCHÉ C — Investisseurs & Promoteurs Immobiliers", C.vert),
  box("Les promoteurs, foncières et fonds d'investissement immobilier opérant en CI ont un besoin critique d'intelligence de marché. Ils paient aujourd'hui pour des études de marché réalisées par des cabinets de conseil — qapril peut leur offrir mieux, en temps réel.", C.vert, C.vertLight, {italic:false,size:19}),
  sp(50),
  tbl([3000,3013,3013],[
    row(ch("Produit de donnée",3000), ch("Acheteur cible",3013), ch("Modèle tarifaire",3013)),
    row(cell("Rendement locatif brut par quartier et type de bien",{w:3000,bold:true}), cell("Foncières, SCI, family offices ivoiriens et diaspora",{w:3013}), cell("Rapport annuel : 500 000 – 2 M FCFA",{w:3013,bold:true,color:C.vert})),
    row(cell("Taux d'occupation et durée de vacance",{w:3000,bold:true,bg:C.gris4}), cell("Promoteurs (SICOGI, Côte d'Ivoire Habitat, groupes privés)",{w:3013,bg:C.gris4}), cell("Abonnement data : 3 – 8 M FCFA/an",{w:3013,bold:true,color:C.vert,bg:C.gris4})),
    row(cell("Analyse de la demande locative par zone",{w:3000,bold:true}), cell("Fonds d'investissement régionaux (AIF, IFC, fonds BRVM)",{w:3013}), cell("Due diligence spécifique : 5 – 15 M FCFA",{w:3013,bold:true,color:C.vert})),
  ]),
  sp(80),

  h2("3.3 Architecture de la donnée : comment structurer l'actif"),
  p("La donnée ne vaut rien si elle n'est pas structurée, anonymisée et packagée correctement. Voici l'architecture recommandée en trois couches :"),
  sp(50),
  tbl([600,2600,3000,2826],[
    row(ch("Couche",600), ch("Nom",2600), ch("Contenu",3000), ch("Maturité requise",2826)),
    row(
      cell("L1",{w:600,bold:true,bg:C.blueDark,color:C.blanc,align:AlignmentType.CENTER}),
      cell("Raw Data Layer",{w:2600,bold:true}),
      cell("Données brutes anonymisées : baux, loyers, paiements, scores. Accès réservé usage interne.",{w:3000}),
      cell("Dès le premier bail",{w:2826,italic:true})
    ),
    row(
      cell("L2",{w:600,bold:true,bg:C.blueMid,color:C.blanc,align:AlignmentType.CENTER}),
      cell("Aggregated Insights Layer",{w:2600,bold:true,bg:C.gris4}),
      cell("Statistiques agrégées par commune, période, profil. Exportables en JSON/CSV via API sécurisée.",{w:3000,bg:C.gris4}),
      cell("À partir de 500 baux actifs",{w:2826,italic:true,bg:C.gris4})
    ),
    row(
      cell("L3",{w:600,bold:true,bg:C.violet,color:C.blanc,align:AlignmentType.CENTER}),
      cell("Market Intelligence Products",{w:2600,bold:true}),
      cell("Rapports packagés, indices publiés, dashboards institutionnels — produits commerciaux finalisés.",{w:3000}),
      cell("À partir de 3 000 baux et 12 mois d'historique",{w:2826,italic:true})
    ),
  ]),
  sp(80),

  h2("3.4 Projection financière — Levier 2"),
  tbl([3500,1842,1842,1842],[
    row(ch("Source de revenu données",3500), ch("An 1",1842), ch("An 2",1842), ch("An 3",1842)),
    row(cell("API scoring bancaire (appels)",{w:3500}), cell("—",{w:1842,align:AlignmentType.CENTER}), cell("15 – 30 M",{w:1842,align:AlignmentType.CENTER}), cell("40 – 80 M",{w:1842,align:AlignmentType.CENTER})),
    row(cell("Licence données assureurs",{w:3500,bg:C.gris4}), cell("—",{w:1842,align:AlignmentType.CENTER,bg:C.gris4}), cell("5 – 15 M",{w:1842,align:AlignmentType.CENTER,bg:C.gris4}), cell("20 – 50 M",{w:1842,align:AlignmentType.CENTER,bg:C.gris4})),
    row(cell("Contrat données État/ANAH/CDC",{w:3500}), cell("—",{w:1842,align:AlignmentType.CENTER}), cell("20 – 50 M",{w:1842,align:AlignmentType.CENTER}), cell("50 – 100 M",{w:1842,align:AlignmentType.CENTER})),
    row(cell("Rapports promoteurs / investisseurs",{w:3500,bg:C.gris4}), cell("—",{w:1842,align:AlignmentType.CENTER,bg:C.gris4}), cell("3 – 10 M",{w:1842,align:AlignmentType.CENTER,bg:C.gris4}), cell("10 – 30 M",{w:1842,align:AlignmentType.CENTER,bg:C.gris4})),
    row(cell("TOTAL Levier 2",{w:3500,bold:true,bg:C.violetLight}), cell("0",{w:1842,align:AlignmentType.CENTER,bold:true,bg:C.violetLight}), cell("43 – 105 M",{w:1842,align:AlignmentType.CENTER,bold:true,color:C.violet,bg:C.violetLight}), cell("120 – 260 M",{w:1842,align:AlignmentType.CENTER,bold:true,color:C.violet,bg:C.violetLight})),
  ]),
  p("Montants en millions FCFA. An 1 = construction de l'actif. An 2 = premières ventes. An 3 = marché mature.", {italic:true,color:C.gris2,size:18}),
  pb(),
];

// ═══════════════════════════════════════════════════════
// SECTION 4 — VISION CONSOLIDÉE DU MODÈLE
// ═══════════════════════════════════════════════════════
const s4 = [
  h1("4. VISION CONSOLIDÉE DU MODÈLE"),
  h2("4.1 Le modèle en un schéma"),
  sp(40),
  tbl([9026],[
    row(cell("NIVEAU 1 — ACQUISITION (Gratuit pour tous)",{w:9026,bold:true,bg:C.blueDark,color:C.blanc,size:22,align:AlignmentType.CENTER})),
    row(cell("Propriétaires · Agences · Locataires · Intermédiaires · Syndics — accès 100% gratuit à toutes les fonctionnalités de gestion du bail",{w:9026,align:AlignmentType.CENTER,italic:true,color:C.gris2})),
  ]),
  sp(20),
  new Paragraph({alignment:AlignmentType.CENTER, spacing:{before:0,after:0}, children:[run("▼  point de monétisation unique et naturel  ▼",{bold:true,size:18,color:C.or})]}),
  sp(10),
  tbl([9026],[
    row(cell("NIVEAU 2 — MONÉTISATION PRIMAIRE (Levier 1)",{w:9026,bold:true,bg:C.or,color:C.blanc,size:22,align:AlignmentType.CENTER})),
    row(cell("Frais d'enregistrement du bail payés par le locataire — 5 000 à 50 000 FCFA selon le segment — revenu immédiat, récurrent, prévisible",{w:9026,align:AlignmentType.CENTER,italic:true,color:C.gris2})),
  ]),
  sp(20),
  new Paragraph({alignment:AlignmentType.CENTER, spacing:{before:0,after:0}, children:[run("▼  chaque bail enregistré produit de la donnée  ▼",{bold:true,size:18,color:C.violet})]}),
  sp(10),
  tbl([9026],[
    row(cell("NIVEAU 3 — ACTIF DONNÉES (Construction)",{w:9026,bold:true,bg:C.violet,color:C.blanc,size:22,align:AlignmentType.CENTER})),
    row(cell("Score locataire · Indice des loyers · Taux d'impayé · Cartographie du parc · Données de sinistralité",{w:9026,align:AlignmentType.CENTER,italic:true,color:C.gris2})),
  ]),
  sp(20),
  new Paragraph({alignment:AlignmentType.CENTER, spacing:{before:0,after:0}, children:[run("▼  vendue à trois classes d'acheteurs  ▼",{bold:true,size:18,color:C.vert})]}),
  sp(10),
  tbl([3008,3009,3009],[
    row(
      ch("MARCHÉ A\nBanques & Assureurs",3008,C.blueMid),
      ch("MARCHÉ B\nÉtat & Régulateurs",3009,C.or),
      ch("MARCHÉ C\nPromoteurs & Investisseurs",3009,C.vert)
    ),
    row(
      cell("Score solvabilité locataire\nTaux d'impayé actuariel\nDonnées sinistralité",{w:3008,vTop:true}),
      cell("Cartographie parc locatif\nIndice loyers officiel\nDashboard planification",{w:3009,vTop:true}),
      cell("Rendement locatif par zone\nTaux d'occupation\nDemande par quartier",{w:3009,vTop:true})
    ),
    row(
      cell("Revenu An 3 : 60 – 130 M FCFA",{w:3008,bold:true,color:C.blueMid}),
      cell("Revenu An 3 : 60 – 110 M FCFA",{w:3009,bold:true,color:C.or}),
      cell("Revenu An 3 : 10 – 30 M FCFA",{w:3009,bold:true,color:C.vert})
    ),
  ]),
  sp(80),

  h2("4.2 Projection consolidée sur 3 ans"),
  tbl([3500,1842,1842,1842],[
    row(ch("Source de revenu",3500), ch("An 1",1842), ch("An 2",1842), ch("An 3",1842)),
    row(cell("Levier 1 — Enregistrement des baux",{w:3500,bold:true}), cell("36 M",{w:1842,align:AlignmentType.CENTER}), cell("130 M",{w:1842,align:AlignmentType.CENTER}), cell("450 M",{w:1842,align:AlignmentType.CENTER})),
    row(cell("Levier 2 — Vente de données",{w:3500,bold:true,bg:C.gris4}), cell("0",{w:1842,align:AlignmentType.CENTER,bg:C.gris4}), cell("43 – 105 M",{w:1842,align:AlignmentType.CENTER,bg:C.gris4}), cell("120 – 260 M",{w:1842,align:AlignmentType.CENTER,bg:C.gris4})),
    row(cell("Revenus secondaires (diaspora, syndic, B2B agences)",{w:3500}), cell("5 – 10 M",{w:1842,align:AlignmentType.CENTER}), cell("15 – 30 M",{w:1842,align:AlignmentType.CENTER}), cell("40 – 80 M",{w:1842,align:AlignmentType.CENTER})),
    row(cell("TOTAL FCFA",{w:3500,bold:true,bg:C.blueDark,color:C.blanc}), cell("41 – 46 M",{w:1842,align:AlignmentType.CENTER,bold:true,bg:C.blueDark,color:C.blanc}), cell("188 – 265 M",{w:1842,align:AlignmentType.CENTER,bold:true,bg:C.blueDark,color:C.blanc}), cell("610 – 790 M",{w:1842,align:AlignmentType.CENTER,bold:true,bg:C.blueDark,color:C.blanc})),
    row(cell("Équivalent EUR (1€ = 655 FCFA)",{w:3500,italic:true,color:C.gris2}), cell("63 – 70 K€",{w:1842,align:AlignmentType.CENTER,italic:true,color:C.gris2}), cell("287 – 404 K€",{w:1842,align:AlignmentType.CENTER,italic:true,color:C.gris2}), cell("931 K€ – 1,2 M€",{w:1842,align:AlignmentType.CENTER,italic:true,color:C.gris2})),
  ]),
  sp(60),
  box("Ce modèle présente une caractéristique rare : le coût d'acquisition de la donnée est nul — elle est produite gratuitement par l'activité principale de la plateforme. Chaque bail enregistré est à la fois une source de revenu immédiat (Levier 1) et un investissement dans un actif dont la valeur croît de façon non-linéaire (Levier 2).", C.vert, C.vertLight, {italic:false,bold:false,size:20}),
  pb(),
];

// ═══════════════════════════════════════════════════════
// SECTION 5 — PLAN D'EXÉCUTION
// ═══════════════════════════════════════════════════════
const s5 = [
  h1("5. PLAN D'EXÉCUTION"),
  h2("5.1 Priorités techniques immédiates"),
  p("Le pivot stratégique implique de concentrer les développements sur deux objectifs : rendre l'enregistrement du bail irréprochable (UX, légalité, valeur perçue) et poser l'architecture de collecte et de structuration des données."),
  sp(50),
  tbl([600,3200,3226,2000],[
    row(ch("",600), ch("Action technique",3200), ch("Description",3226), ch("Délai",2000)),
    row(
      cell("T1",{w:600,bold:true,bg:C.rouge,color:C.blanc,align:AlignmentType.CENTER}),
      cell("Tunnel d'enregistrement du bail avec paiement intégré",{w:3200,bold:true}),
      cell("Flux complet : saisie bail → validation → paiement Mobile Money → génération PDF + QR code → notification WhatsApp locataire + propriétaire",{w:3226,vTop:true}),
      cell("Semaines 1 – 3",{w:2000,bold:true,color:C.rouge})
    ),
    row(
      cell("T2",{w:600,bold:true,bg:C.rouge,color:C.blanc,align:AlignmentType.CENTER}),
      cell("Passeport Locatif v1",{w:3200,bold:true,bg:C.gris4}),
      cell("Génération du score de fiabilité à partir de l'historique de paiement. Page publique (QR) consultable par tout propriétaire.",{w:3226,vTop:true,bg:C.gris4}),
      cell("Semaines 2 – 4",{w:2000,bold:true,color:C.rouge,bg:C.gris4})
    ),
    row(
      cell("T3",{w:600,bold:true,bg:C.or,color:C.blanc,align:AlignmentType.CENTER}),
      cell("Data Layer L1 & L2",{w:3200,bold:true}),
      cell("Schéma Prisma : nouveaux modèles BailDataPoint, MarketIndex, ScoringSnapshot. Anonymisation automatique. ETL interne.",{w:3226,vTop:true}),
      cell("Semaines 3 – 6",{w:2000,bold:true,color:C.or})
    ),
    row(
      cell("T4",{w:600,bold:true,bg:C.or,color:C.blanc,align:AlignmentType.CENTER}),
      cell("Module agence prescripteur",{w:3200,bold:true,bg:C.gris4}),
      cell("Interface agence pour enregistrer les baux de leurs clients, collecter les frais et reverser à qapril. Badge agence certifiée.",{w:3226,vTop:true,bg:C.gris4}),
      cell("Semaines 4 – 7",{w:2000,bold:true,color:C.or,bg:C.gris4})
    ),
    row(
      cell("T5",{w:600,bold:true,bg:C.blueMid,color:C.blanc,align:AlignmentType.CENTER}),
      cell("API institutionnelle v1 (banques)",{w:3200,bold:true}),
      cell("Endpoint GET /score/{tenantHash} avec authentification par clé API. Rate limiting. Logging facturation.",{w:3226,vTop:true}),
      cell("Semaines 8 – 12",{w:2000,bold:true,color:C.blueMid})
    ),
    row(
      cell("T6",{w:600,bold:true,bg:C.blueMid,color:C.blanc,align:AlignmentType.CENTER}),
      cell("Dashboard Intelligence de Marché",{w:3200,bold:true,bg:C.gris4}),
      cell("Interface admin + version institutionnelle : indice des loyers, taux d'impayé, carte thermique. Exportable PDF/Excel.",{w:3226,vTop:true,bg:C.gris4}),
      cell("Semaines 10 – 16",{w:2000,bold:true,color:C.blueMid,bg:C.gris4})
    ),
  ]),
  sp(80),

  h2("5.2 Priorités commerciales et partenariales"),
  tbl([600,3200,5226],[
    row(ch("",600), ch("Action commerciale",3200), ch("Détail & objectif",5226)),
    row(
      cell("C1",{w:600,bold:true,bg:C.rouge,color:C.blanc,align:AlignmentType.CENTER}),
      cell("Signer 30 agences partenaires à Abidjan",{w:3200,bold:true}),
      cell("Priorité absolue. Ces 30 agences génèrent le flux initial de baux. Proposition : accès premium gratuit à vie pour les 30 premières agences signataires.",{w:5226})
    ),
    row(
      cell("C2",{w:600,bold:true,bg:C.rouge,color:C.blanc,align:AlignmentType.CENTER}),
      cell("Négocier la recommandation CDC/ANAH",{w:3200,bold:true,bg:C.gris4}),
      cell("Obtenir une lettre de recommandation officielle ou un MOU avec la CDC. Cela transforme l'adoption de volontaire à quasi-obligatoire pour les acteurs qui veulent être en conformité.",{w:5226,bg:C.gris4})
    ),
    row(
      cell("C3",{w:600,bold:true,bg:C.or,color:C.blanc,align:AlignmentType.CENTER}),
      cell("Premier contrat de données (banque pilote)",{w:3200,bold:true}),
      cell("Approcher BNI ou Coris Bank avec une démonstration du score locataire sur 500 profils anonymisés. Objectif : contrat pilote à 5 M FCFA. C'est la preuve de concept du Levier 2.",{w:5226})
    ),
    row(
      cell("C4",{w:600,bold:true,bg:C.or,color:C.blanc,align:AlignmentType.CENTER}),
      cell("Premier contrat de données (assureur pilote)",{w:3200,bold:true,bg:C.gris4}),
      cell("Approcher NSIA Assurances avec les taux d'impayé anonymisés par commune. Démontrer la valeur pour calibrer les primes. Objectif : partenariat de distribution assurance loyer.",{w:5226,bg:C.gris4})
    ),
    row(
      cell("C5",{w:600,bold:true,bg:C.blueMid,color:C.blanc,align:AlignmentType.CENTER}),
      cell("Publication Indice des Loyers Abidjan (co-brandé CDC)",{w:3200,bold:true}),
      cell("Publier un premier rapport semestriel sur les loyers à Abidjan, co-signé avec la CDC. Distribué aux médias, promoteurs, institutions. C'est l'acte de naissance de qapril comme référence du marché.",{w:5226})
    ),
  ]),
  sp(80),

  h2("5.3 Jalons critiques"),
  tbl([1600,3813,3613],[
    row(ch("Jalon",1600), ch("Description",3813), ch("Indicateur de succès",3613)),
    row(cell("J1 — Mois 1",{w:1600,bold:true,color:C.rouge}), cell("Tunnel enregistrement bail en production avec paiement Mobile Money",{w:3813}), cell("Premier bail enregistré et payé",{w:3613,bold:true,color:C.vert})),
    row(cell("J2 — Mois 2",{w:1600,bold:true,color:C.rouge,bg:C.gris4}), cell("30 agences partenaires signées à Abidjan",{w:3813,bg:C.gris4}), cell("300 baux/mois en rythme de croisière",{w:3613,bold:true,color:C.vert,bg:C.gris4})),
    row(cell("J3 — Mois 4",{w:1600,bold:true,color:C.or}), cell("MOU signé avec la CDC",{w:3813}), cell("Lettre de recommandation officielle publiée",{w:3613,bold:true,color:C.vert})),
    row(cell("J4 — Mois 6",{w:1600,bold:true,color:C.or,bg:C.gris4}), cell("500 baux actifs — Data Layer L2 opérationnel",{w:3813,bg:C.gris4}), cell("Premier rapport de marché interne validé",{w:3613,bold:true,color:C.vert,bg:C.gris4})),
    row(cell("J5 — Mois 9",{w:1600,bold:true,color:C.blueMid}), cell("Premier contrat de données signé (banque ou assureur)",{w:3813}), cell("Revenu données > 0 — validation du Levier 2",{w:3613,bold:true,color:C.vert})),
    row(cell("J6 — Mois 12",{w:1600,bold:true,color:C.blueMid,bg:C.gris4}), cell("3 000 baux actifs — Indice des loyers publié",{w:3813,bg:C.gris4}), cell("qapril cité comme référence marché par un média ou institution",{w:3613,bold:true,color:C.vert,bg:C.gris4})),
    row(cell("J7 — Mois 18",{w:1600,bold:true,color:C.violet}), cell("Expansion hors Abidjan (Bouaké, San-Pédro)",{w:3813}), cell("5 000 baux actifs — 3 contrats institutionnels signés",{w:3613,bold:true,color:C.vert})),
  ]),
  pb(),
];

// ═══════════════════════════════════════════════════════
// SECTION 6 — CE QU'IL NE FAUT PAS FAIRE
// ═══════════════════════════════════════════════════════
const s6 = [
  h1("6. LES GARDE-FOUS STRATÉGIQUES"),
  h2("6.1 Ce qu'il ne faut surtout pas faire"),
  box("Un bon modèle stratégique ne définit pas seulement ce qu'on fait — il définit ce qu'on refuse de faire, même quand c'est tentant.", C.gris1, C.gris4, {italic:true}),
  sp(60),
  tbl([4513,4513],[
    row(ch("Tentation à éviter",4513,C.rougeLight,C.rouge), ch("Pourquoi c'est dangereux",4513,C.rougeLight,C.rouge)),
    row(cell("Facturer les propriétaires ou les agences pour l'accès",{w:4513,bold:true}), cell("Brise l'adoption. Un seul acteur du marché qui ne paie pas attire tous les autres. La gratuité est la stratégie d'acquisition la moins chère qui soit.",{w:4513})),
    row(cell("Multiplier les leviers de revenus avant d'avoir la masse critique",{w:4513,bold:true,bg:C.gris4}), cell("Disperser les efforts commerciaux avant d'avoir 1 000 baux actifs est une erreur. Chaque levier secondaire activé trop tôt mobilise des ressources sur un marché non encore prouvé.",{w:4513,bg:C.gris4})),
    row(cell("Vendre des données avant d'en avoir le droit contractuel",{w:4513,bold:true}), cell("Les CGU doivent prévoir explicitement l'usage des données à des fins commerciales. Un acheteur institutionnel exigera un DPA conforme. Préparer cela dès l'enregistrement du premier bail.",{w:4513})),
    row(cell("Dépendre d'un seul canal d'acquisition (ex. : CDC seulement)",{w:4513,bold:true,bg:C.gris4}), cell("Si la CDC tarde ou change de priorité, la croissance s'arrête. Les agences partenaires sont le moteur primaire — la CDC est l'accélérateur, pas le moteur.",{w:4513,bg:C.gris4})),
    row(cell("Brûler du cash en marketing avant product-market fit",{w:4513,bold:true}), cell("300 baux/mois ne nécessitent pas de publicité payante. 30 agences bien choisies suffisent. Le marketing vient après — quand le produit tourne seul.",{w:4513})),
  ]),
  sp(80),

  h2("6.2 La règle des deux temps"),
  p("Toute décision stratégique ou commerciale doit être filtrée par cette question en deux temps :"),
  sp(40),
  tbl([4513,4513],[
    row(ch("Temps 1 — Est-ce que ça génère des baux enregistrés ?",4513,C.or), ch("Temps 2 — Est-ce que ça enrichit la donnée ?",4513,C.violet)),
    row(cell("Si OUI → priorité maximale.",{w:4513,bold:true,color:C.vert}), cell("Si OUI → intégrer dans la roadmap.",{w:4513,bold:true,color:C.vert})),
    row(cell("Si NON → différer ou abandonner.",{w:4513,bold:true,color:C.rouge,bg:C.gris4}), cell("Si NON → évaluer l'effort vs le retour long terme.",{w:4513,bold:true,color:C.orange,bg:C.gris4})),
  ]),
  sp(120),

  sep(C.gris5),
  sp(60),
  boxFull("RÉSUMÉ EXÉCUTIF DU MODÈLE", C.blueDark, C.blanc, {size:22,bold:true}),
  sp(30),
  tbl([400,8626],[
    row(cell("1",{w:400,bold:true,bg:C.or,color:C.blanc,align:AlignmentType.CENTER}), cell("L'enregistrement du bail est le seul point de monétisation primaire — payé par le locataire, entre 5 000 et 50 000 FCFA selon le segment. C'est le seul moment où tout le monde est aligné pour payer.",{w:8626,bold:true})),
    row(cell("2",{w:400,bold:true,bg:C.violet,color:C.blanc,align:AlignmentType.CENTER}), cell("Chaque bail enregistré produit un actif donnée. Cet actif est vendu à trois marchés : banques/assureurs, État/régulateurs, promoteurs/investisseurs. Il se valorise de façon non-linéaire avec le volume.",{w:8626,bold:true,bg:C.gris4})),
    row(cell("3",{w:400,bold:true,bg:C.vert,color:C.blanc,align:AlignmentType.CENTER}), cell("Tout le reste est gratuit, secondaire, ou différé. La gratuité n'est pas un coût — c'est le moteur d'adoption qui alimente les deux leviers.",{w:8626,bold:true})),
    row(cell("4",{w:400,bold:true,bg:C.blueMid,color:C.blanc,align:AlignmentType.CENTER}), cell("La priorité immédiate est simple : 30 agences partenaires + tunnel de paiement en production + MOU CDC. Tout le reste découle de ces trois actions.",{w:8626,bold:true,bg:C.gris4})),
  ]),
  sp(100),
  new Paragraph({alignment:AlignmentType.CENTER, spacing:{before:60,after:60}, children:[run("— Fin du document —",{size:20,color:C.gris3,italic:true})]}),
  new Paragraph({alignment:AlignmentType.CENTER, spacing:{before:40,after:40}, children:[run("qapril · Note Stratégique Interne v2.0 · Confidentiel · Juin 2026",{size:17,color:C.gris3})]}),
];

// ═══════════════════════════════════════════════════════
// ASSEMBLAGE
// ═══════════════════════════════════════════════════════
const doc = new Document({
  numbering:{config:[{
    reference:"bl",
    levels:[
      {level:0,format:LevelFormat.BULLET,text:"–",alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:480,hanging:240}}}},
      {level:1,format:LevelFormat.BULLET,text:"·",alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:960,hanging:240}}}},
    ]
  }]},
  styles:{
    default:{document:{run:{font:"Arial",size:20,color:C.gris1}}},
    paragraphStyles:[
      {id:"Heading1",name:"Heading 1",basedOn:"Normal",next:"Normal",quickFormat:true,
        run:{size:38,bold:true,font:"Arial",color:C.blueDark},
        paragraph:{spacing:{before:520,after:200},outlineLevel:0}},
      {id:"Heading2",name:"Heading 2",basedOn:"Normal",next:"Normal",quickFormat:true,
        run:{size:28,bold:true,font:"Arial",color:C.blueMid},
        paragraph:{spacing:{before:360,after:140},outlineLevel:1}},
    ]
  },
  sections:[{
    properties:{page:{size:{width:11906,height:16838},margin:{top:1080,right:1080,bottom:1080,left:1080}}},
    headers:{
      default:new Header({
        children:[
          new Paragraph({
            spacing:{before:0,after:80},
            border:{top:bdr(BorderStyle.NONE,"FFFFFF"),left:bdr(BorderStyle.NONE,"FFFFFF"),bottom:bdr(BorderStyle.SINGLE,C.gris5,4),right:bdr(BorderStyle.NONE,"FFFFFF")},
            children:[run("qapril — Note Stratégique v2.0",{size:16,color:C.gris3,italic:true})]
          })
        ]
      })
    },
    footers:{
      default:new Footer({
        children:[
          new Paragraph({
            alignment:AlignmentType.CENTER,
            spacing:{before:80,after:0},
            border:{top:bdr(BorderStyle.SINGLE,C.gris5,4),left:bdr(BorderStyle.NONE,"FFFFFF"),bottom:bdr(BorderStyle.NONE,"FFFFFF"),right:bdr(BorderStyle.NONE,"FFFFFF")},
            children:[run("Document de travail interne — Strictement confidentiel",{size:16,color:C.gris3})]
          })
        ]
      })
    },
    children: [
      ...cover,
      ...s1,
      ...s2,
      ...s3,
      ...s4,
      ...s5,
      ...s6
    ]
  }]
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync("Note_Strategique_qapril_v2.docx", buffer);
  console.log("Document généré avec succès sous 'Note_Strategique_qapril_v2.docx'");
});
