# -*- coding: utf-8 -*-
"""
Génération du Manuel d'Utilisation Officiel QAPRIL v2.0 (Novembre 2026)
Couvre l'intégralité des 29 Addendums (ADD-01 à ADD-29), Loi 2019-576 et Catalogue Fonctionnel v1.0.
"""

import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def create_manuel_docx(output_path):
    doc = docx.Document()

    # Marges 2 cm
    for section in doc.sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)

    # Styles & Couleurs QAPRIL
    C_FOREST = RGBColor(27, 77, 62)     # #1B4D3E
    C_ORANGE = RGBColor(255, 130, 0)     # #FF8200
    C_NAVY = RGBColor(15, 23, 42)        # #0F172A
    C_MUTED = RGBColor(100, 116, 139)    # #64748B

    def set_cell_background(cell, hex_color):
        shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
        cell._tc.get_or_add_tcPr().append(shd)

    def set_cell_margins(cell, top=120, bottom=120, left=150, right=150):
        tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
        cell._tc.get_or_add_tcPr().append(tcMar)

    def add_title(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_after = Pt(4)
        run = p.add_run(text)
        run.font.name = "Arial"
        run.font.size = Pt(22)
        run.font.bold = True
        run.font.color.rgb = C_FOREST
        return p

    def add_subtitle(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_after = Pt(16)
        run = p.add_run(text)
        run.font.name = "Arial"
        run.font.size = Pt(12)
        run.font.bold = True
        run.font.color.rgb = C_ORANGE
        return p

    def add_h1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(18)
        p.paragraph_format.space_after = Pt(6)
        run = p.add_run(text)
        run.font.name = "Arial"
        run.font.size = Pt(15)
        run.font.bold = True
        run.font.color.rgb = C_FOREST
        return p

    def add_h2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(12)
        p.paragraph_format.space_after = Pt(4)
        run = p.add_run(text)
        run.font.name = "Arial"
        run.font.size = Pt(12)
        run.font.bold = True
        run.font.color.rgb = C_NAVY
        return p

    def add_h3(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(8)
        p.paragraph_format.space_after = Pt(2)
        run = p.add_run(text)
        run.font.name = "Arial"
        run.font.size = Pt(10.5)
        run.font.bold = True
        run.font.color.rgb = C_ORANGE
        return p

    def add_body(text, bold_prefix=None, italic=False):
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            r_pre = p.add_run(bold_prefix + " ")
            r_pre.font.name = "Arial"
            r_pre.font.size = Pt(9.5)
            r_pre.font.bold = True
            r_pre.font.color.rgb = C_NAVY
        run = p.add_run(text)
        run.font.name = "Arial"
        run.font.size = Pt(9.5)
        run.font.italic = italic
        run.font.color.rgb = RGBColor(30, 41, 59)
        return p

    def add_bullet(text, bold_prefix=None):
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            r_pre = p.add_run(bold_prefix + " ")
            r_pre.font.name = "Arial"
            r_pre.font.size = Pt(9.5)
            r_pre.font.bold = True
            r_pre.font.color.rgb = C_NAVY
        run = p.add_run(text)
        run.font.name = "Arial"
        run.font.size = Pt(9.5)
        run.font.color.rgb = RGBColor(30, 41, 59)
        return p

    def add_callout(text, title="NOTE IMPORTANTE", is_alert=False):
        tbl = doc.add_table(rows=1, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        cell = tbl.cell(0, 0)
        bg = "FFF5EB" if is_alert else "F0FDF4"
        b_color = "EA580C" if is_alert else "1B4D3E"
        set_cell_background(cell, bg)
        set_cell_margins(cell, top=140, bottom=140, left=180, right=180)
        
        tcPr = cell._tc.get_or_add_tcPr()
        borders = parse_xml(f'<w:tcBorders {nsdecls("w")}><w:left w:val="single" w:sz="24" w:space="0" w:color="{b_color}"/><w:top w:val="none"/><w:right w:val="none"/><w:bottom w:val="none"/></w:tcBorders>')
        tcPr.append(borders)

        p = cell.paragraphs[0]
        p.paragraph_format.space_after = Pt(2)
        r_title = p.add_run(f"[{title}] ")
        r_title.font.name = "Arial"
        r_title.font.size = Pt(9.5)
        r_title.font.bold = True
        r_title.font.color.rgb = RGBColor(194, 65, 12) if is_alert else C_FOREST

        r_text = p.add_run(text)
        r_text.font.name = "Arial"
        r_text.font.size = Pt(9)
        r_text.font.color.rgb = RGBColor(30, 41, 59)

        doc.add_paragraph().paragraph_format.space_after = Pt(2)

    def add_custom_table(headers, rows_data):
        tbl = doc.add_table(rows=len(rows_data) + 1, cols=len(headers))
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        tbl.autofit = False

        # Header row
        hdr_cells = tbl.rows[0].cells
        for idx, header_text in enumerate(headers):
            hdr_cells[idx].text = header_text
            set_cell_background(hdr_cells[idx], "1B4D3E")
            set_cell_margins(hdr_cells[idx], top=100, bottom=100, left=120, right=120)
            p = hdr_cells[idx].paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            for r in p.runs:
                r.font.name = "Arial"
                r.font.size = Pt(9)
                r.font.bold = True
                r.font.color.rgb = RGBColor(255, 255, 255)

        # Data rows
        for r_idx, row_data in enumerate(rows_data):
            row_cells = tbl.rows[r_idx + 1].cells
            bg_color = "F8FAFC" if (r_idx % 2 == 1) else "FFFFFF"
            for c_idx, cell_value in enumerate(row_data):
                row_cells[c_idx].text = str(cell_value)
                set_cell_background(row_cells[c_idx], bg_color)
                set_cell_margins(row_cells[c_idx], top=80, bottom=80, left=120, right=120)
                p = row_cells[c_idx].paragraphs[0]
                p.paragraph_format.line_spacing = 1.1
                for r in p.runs:
                    r.font.name = "Arial"
                    r.font.size = Pt(8.5)
                    r.font.color.rgb = RGBColor(15, 23, 42)

        doc.add_paragraph().paragraph_format.space_after = Pt(4)

    # ==================== EN-TÊTE DU DOCUMENT ====================
    add_title("QAPRIL — MANUEL D'UTILISATION OFFICIEL")
    add_subtitle("GUIDE COMPLET DES FONCTIONNALITÉS PAR RÔLE · VERSION 2.0 (NOVEMBRE 2026)")

    # Fiche Documentaire
    meta_headers = ["Paramètre", "Détail Officiel"]
    meta_rows = [
        ["Référence", "QAPRIL/MAN/2026-v2.0 · Édition Complète Consolidée"],
        ["Périmètre", "CDC Global v3.0 (ADD-01 à ADD-20) + Addendums 2026 (ADD-21 à ADD-29) + PATCH-07 (Loi 2019-576)"],
        ["Acteurs couverts", "Locataire · Bailleur Propriétaire · Agence Immobilière Agréée · Agence Non Agréée & Intermédiaire"],
        ["Canaux officiels", "Application Web (qapril.net) · Applications Mobiles Android/iOS · WhatsApp Business · SMS · USSD *144#"],
        ["Modèle économique", "100 % GRATUIT pour tous les utilisateurs (locataires, bailleurs, agences). Seul l'enregistrement fiscal du bail à la DGI et le package diaspora sont facturés."],
        ["Éditeur & Partenaires", "AUXX SAS / QAPRIL Technologies · En partenariat avec La Poste CI, DGI, CPRAIMA-CI"]
    ]
    add_custom_table(meta_headers, meta_rows)

    add_body("Ce manuel d'utilisation explique concrètement, pas à pas et dans un langage clair, comment utiliser chaque fonctionnalité de la plateforme QAPRIL selon votre profil. Il prend en compte l'ensemble des 29 addendums fonctionnels et les récentes mises à jour sur la géolocalisation avec résolution automatique Ville/Commune/Quartier, le paiement partiel avec plan d'apurement, les attestations de résidence et le passeport locatif.")

    # ==================== SECTION 1 : VUE D'ENSEMBLE ====================
    add_h1("1. LES 4 RÈGLES D'OR IMMUABLES DE QAPRIL")
    add_bullet("Quatre opérateurs de paiement Mobile Money sont toujours présents et au même niveau : Wave, Orange Money, MTN Mobile Money et Moov Money.", "1. Liberté de paiement :")
    add_bullet("QAPRIL ne détient jamais de fonds (RG-ADD07-01). Les loyers transitent directement du locataire vers le compte du bailleur ou du mandataire via l'agrégateur agréé. Pour les ventes, les prix et arrhes sont obligatoirement sous séquestre notarial.", "2. Zéro détention de fonds :")
    add_bullet("Le locataire ne voit jamais l'identité du propriétaire d'un bien géré sous mandat d'agence agréée (RG-CONF-01). L'agence est l'interlocutrice unique et légale.", "3. Confidentialité absolue sous mandat :")
    add_bullet("Aucun acte à conséquence juridique (signature de bail, congé, résiliation, vente) ne peut être engagé par la seule voix ou par interprétation automatique (RG-AST-01). L'utilisateur doit toujours confirmer expressément par un clic ou code OTP.", "4. Sécurité des actes juridiques :")

    add_callout("Conformément à la Loi ivoirienne n° 2019-576, QAPRIL bloque informatiquement toute exigence supérieure à 2 mois de loyer d'avance et 2 mois de dépôt de garantie. Aucun contrat illégal ne peut être produit sur la plateforme.", "CONFORMITÉ LÉGALE STRICTE", is_alert=True)

    # ==================== SECTION 2 : LE LOCATAIRE ====================
    add_h1("2. LE GUIDE COMPLET DU LOCATAIRE")
    add_body("Le locataire est au centre de QAPRIL. L'application lui permet de valoriser son sérieux, de prouver son domicile et d'accéder aux meilleurs logements sans risque d'arnaque.")

    add_h2("2.1 Inscription, Niveaux d'Identité et Boîte MaPoste")
    add_bullet("Inscription gratuite en moins de 2 minutes avec son numéro de téléphone (Orange, MTN, Wave, Moov) depuis l'application, le site qapril.net ou par simple message WhatsApp.", "Création de compte :")
    add_bullet("Niveau 0 (numéro vérifié par SMS), Niveau 1 (CNI/Passeport + NNI validé), Niveau 2 (rapprochement d'identité avec le compte Mobile Money).", "Niveaux d'identité certifiés :")
    add_bullet("Lors de votre inscription, une boîte postale digitale MaPoste est créée automatiquement pour vous sans démarche supplémentaire. Vous y recevez vos quittances officielles et attestations sécurisées.", "Boîte postale MaPoste (ADD-28) :")

    add_h2("2.2 Gestion du Bail et du Logement")
    add_bullet("Accédez à tout moment à votre contrat PDF certifié, sécurisé par une empreinte numérique SHA-256 infalsifiable et revêtu du reçu officiel de la DGI.", "Consultation du bail :")
    add_bullet("Signez votre bail en un geste depuis l'application ou par code secret OTP reçu par SMS/WhatsApp, avec pleine valeur légale (Loi 2013-546).", "Signature électronique :")
    add_bullet("À votre domicile, appuyez sur 'Localiser mon logement'. Si votre position coïncide avec celle déclarée par le bailleur, le badge officiel 'Logement localisé' est activé.", "Géolocalisation concordante (ADD-28) :")
    add_bullet("Besoin de déménager ? L'application calcule le délai de préavis légal et transmet votre lettre de congé horodatée à votre bailleur ou agence.", "Donner congé :")

    add_h2("2.3 Payer son Loyer et Obtenir ses Quittances")
    add_bullet("Choisissez Wave, Orange Money, MTN ou Moov. Le paiement est instantané et crédite directement le bailleur.", "Paiement direct 4 opérateurs :")
    add_bullet("Vous pouvez régler de 1 à 6 mois d'avance en choisissant librement cette option. Une quittance distincte est émise pour chaque mois soldé.", "Paiement de plusieurs mois :")
    add_bullet("Si vous avez payé en espèces ou par transfert direct, appuyez sur 'Déclarer un paiement hors QAPRIL'. Le bailleur reçoit une alerte et confirme par OUI. La quittance officielle est alors émise.", "Déclaration hors plateforme :")
    add_bullet("En cas de difficulté passagère, proposez le montant dont vous disposez. Vos fonds soldent d'abord les loyers les plus anciens (règle FIFO) avec quittances correspondantes. Sur le reliquat, un Reçu d'acompte officiel est généré et un plan d'apurement vous protège de toute résiliation abusive tant que vous le respectez.", "Paiements partiels & Plan d'apurement (ADD-24) :")

    add_h2("2.4 Attestations de Résidence et d'Hébergement (ADD-29)")
    add_bullet("Générez en 10 secondes votre attestation de domicile reconnue par les banques, ambassades et administrations, avec QR code de vérification publique (/verif/attestation) et validité de 3 mois.", "Attestation de Résidence :")
    add_bullet("Vous pouvez déclarer jusqu'à 10 personnes vivant avec vous (conjoint, enfants, parents). Chacune peut obtenir son attestation Niveau B.", "Déclaration des occupants :")
    add_bullet("Délivrez une attestation officielle pour un proche de passage (jusqu'à 5 invités simultanés, valable 90 jours renouvelables), adossée à votre bail enregistré.", "Hébergement d'invités :")

    add_h2("2.5 Le Passeport Locatif (ADD-21) et Recherche de Logement")
    add_bullet("Construisez votre crédibilité locative. Votre historique de paiement régulier définit votre Indice de Confiance Locative (Tranches A, B, C, D). Seule la tranche est visible des bailleurs, votre score numérique reste privé.", "Passeport Locatif & ICL :")
    add_bullet("Postulez en un clic sur les logements vacants certifiés, sans caution réclamée avant la signature et avec consignation sécurisée jusqu'à la remise des clés.", "Candidature 1-clic sécurisée :")

    # ==================== SECTION 3 : LE BAILLEUR PROPRIÉTAIRE ====================
    add_h1("3. LE GUIDE COMPLET DU BAILLEUR PROPRIÉTAIRE")
    add_body("QAPRIL permet au bailleur de sécuriser ses revenus, de valoriser son patrimoine et d'automatiser sa gestion sans aucun coût.")

    add_h2("3.1 Ajout et Structuration d'un Bien Immobilier")
    add_bullet("Étape 1 : Choisissez la structure parente (Maison indépendante, Résidence, Cour commune, Immeuble). Étape 2 : Type de logement (Appartement, Villa, Studio, Chambre, Local commercial). Étape 3 : Conditions financières.", "Création par structure (ADD-05) :")
    add_bullet("À la création du bien, l'application capture votre position GPS satellite et résout automatiquement le nom officiel de la Ville, de la Commune et du Quartier & Repère géographique, tout en générant le code d'adressage numérique La Poste CI.", "Géolocalisation certifiée (ADD-28) :")
    add_bullet("Du niveau 1 (déclaratif) au niveau 4 (visite terrain d'une agence partenaire agréée). Le badge 'Bien vérifié' certifie votre titre ACD / Titre foncier.", "Niveaux de vérification du bien :")

    add_h2("3.2 Création du Contrat de Bail et Enregistrement DGI")
    add_bullet("Sélectionnez le bien vacant, entrez le téléphone du locataire, fixez le loyer et la date d'échéance (1er, 5 ou 15 du mois).", "Création en 4 étapes simples :")
    add_bullet("L'interface verrouille automatiquement le dépôt de garantie à 2 mois maximum et le loyer d'avance à 2 mois maximum. Les clauses illégales sont bannies.", "Encadrement Loi 2019-576 :")
    add_bullet("En un clic, télé-déclarez le bail à la DGI. L'application calcule les droits fiscaux (2,5 % × loyer annuel × durée + timbres) et délivre le reçu officiel dématérialisé remis au locataire.", "Enregistrement fiscal DGI (ADD-23) :")

    add_h2("3.3 Encaissement, Quittances et Gestion des Impayés")
    add_bullet("À chaque échéance, une quittance est automatiquement émise et transmise dès réception des fonds.", "Quittances automatiques scellées :")
    add_bullet("Si le locataire paie hors application, vous recevez un SMS/WhatsApp : répondez simplement 'OUI' pour valider et émettre la quittance.", "Validation par SMS / WhatsApp :")
    add_bullet("Alertes graduées automatiques : Rappel doux à J+3, SMS de relance à J+7, Mise en demeure avec preuve de délivrance à J+15.", "Relances automatiques :")
    add_bullet("Si votre locataire propose un règlement partiel, l'application vous présente la simulation : acceptez pour solder les échéances anciennes et fixer un échéancier d'apurement, ou refusez d'un clic.", "Décision sur paiement partiel (ADD-24) :")

    add_h2("3.4 Vente de Biens et Terrains (ADD-25)")
    add_bullet("Mettez en vente vos villas, appartements ou terrains nus/ruraux avec références cadastrales (Lot, Îlot, Titre Foncier, ACD).", "Publication de vente certifiée :")
    add_bullet("Le système contrôle l'antériorité du titre foncier et interdit toute double mise en vente sur le territoire ivoirien.", "Contrôle anti-double vente (RG-VTE-05) :")
    add_bullet("Tous les versements d'arrhes ou de prix s'effectuent obligatoirement sur le compte séquestre du notaire instrumentaire.", "Séquestre notarial obligatoire :")

    add_h2("3.5 Package Diaspora (ADD-16)")
    add_bullet("Pour les bailleurs résidant à l'étranger : rapports bimensuels en Euros et FCFA (taux officiel BCE), alertes SMS/WhatsApp internationales et représentation administrative sécurisée pour 7 €/mois.", "Gestion à distance sécurisée :")

    # ==================== SECTION 4 : L'AGENCE IMMOBILIÈRE AGRÉÉE ====================
    add_h1("4. LE GUIDE DE L'AGENCE IMMOBILIÈRE AGRÉÉE")
    add_body("L'agence agréée est l'acteur institutionnel de référence. Elle bénéficie de la substitution totale pour gérer le portefeuille de ses mandants en toute conformité.")

    add_h2("4.1 Agrément, Équipe et Rôles Collaborateurs")
    add_bullet("Enregistrez votre numéro d'agrément ministériel officiel et votre adhésion CPRAIMA-CI pour débloquer la gestion multi-mandants.", "Conformité légale (Art. 419 CCH) :")
    add_bullet("Créez vos comptes Chef d'agence, Gestionnaires de biens et Négociateurs avec permissions granulaires.", "Gestion des collaborateurs (RBAC) :")
    add_bullet("Le Chef d'agence peut masquer l'identité réelle des bailleurs à ses collaborateurs, qui visualisent un code immuable BAI-NNN sur tous les dossiers.", "Confidentialité codes BAI-NNN :")

    add_h2("4.2 Mandats, Baux et Enregistrement DGI")
    add_bullet("Invitez vos propriétaires mandants. Dès qu'ils activent le mandat, leurs biens basculent sous votre gestion opérationnelle complète.", "Activation de mandat :")
    add_bullet("Tous les contrats et quittances générés portent automatiquement la mention légale : '[Bailleur] représenté par [Votre Agence], mandataire agréé n°..., mandat réf. ...'.", "Mention automatique de mandat :")
    add_bullet("Enregistrez les baux rédigés en dehors de QAPRIL (baux papier, autres logiciels) sur le canal officiel DGI pour vos clients.", "Enregistrement des baux externes (ADD-23) :")

    add_h2("4.3 Encaissements, Reversements et Compte-Rendu (CRG)")
    add_bullet("Suivez l'ensemble des loyers perçus sur les comptes de gestion de l'agence.", "Encaissement pour compte de tiers :")
    add_bullet("Générez en 1 clic le compte-rendu de gestion mensuel déduisant vos honoraires de gérance et frais autorisés, avec justificatif de reversement net par virement ou Mobile Money.", "Bordereau de reversement net (CrgMensuel) :")
    add_bullet("Monétisez vos compétences en réalisant les vérifications physiques sur le terrain pour certifier les biens au Niveau 4.", "Visites de vérification Niveau 4 :")

    # ==================== SECTION 5 : AGENCES NON AGRÉÉES & INTERMÉDIAIRES ====================
    add_h1("5. LE GUIDE DES AGENCES NON AGRÉÉES ET INTERMÉDIAIRES")
    add_body("QAPRIL encadre rigoureusement le rôle des gérants de confiance et intermédiaires sans agrément ministériel (ADD-08 / ADD-09).")
    add_bullet("Le propriétaire vous délègue explicitement des droits bien par bien (créer un bail, émettre les quittances, relancer). Vous ne pouvez jamais modifier le bail sans accord du propriétaire.", "Délégation partielle de gestion :")
    add_bullet("Les quittances portent votre nom en tant que mandataire émetteur pour compte.", "Émission sous mandat :")
    add_bullet("Le propriétaire peut révoquer vos accès en un clic. Vos sessions sont invalidées informatiquement sous 60 secondes (RG-DEL-03).", "Révocation instantanée :")

    # ==================== SECTION 6 : FONCTIONS TRANSVERSALES ====================
    add_h1("6. ASSISTANT VOCAL, SÉCURITÉ ET VÉRIFICATION PUBLIQUE")
    add_h2("6.1 Pilotage Vocal Déclaratif (ADD-27)")
    add_bullet("Dictez simplement votre demande : 'Je veux ajouter un locataire', 'Générer mon attestation de résidence', 'Déclarer mon paiement'. L'assistant ouvre immédiatement le formulaire adéquat.", "Navigation à la voix :")
    add_bullet("L'assistant remplit les champs dictés mais exige systématiquement votre validation manuelle sur l'écran avant toute validation juridique.", "Validation obligatoire :")

    add_h2("6.2 Vérification Publique Universelle (/verif)")
    add_bullet("Scannez le QR code présent sur tout bail, quittance ou attestation QAPRIL pour afficher instantanément sa validité juridique, son horodatage et son empreinte cryptographique SHA-256.", "Contrôle anti-fraude immédiat :")
    add_bullet("Banques, commissariats, ambassades et administrations peuvent vérifier l'authenticité d'une attestation sans créer de compte.", "Accès tiers et administrations :")

    # Enregistrer le fichier
    doc.save(output_path)
    print(f"Document généré avec succès : {output_path}")

if __name__ == "__main__":
    out_file = r"QAPRIL_Manuel_Utilisation_v2.0.docx"
    create_manuel_docx(out_file)
