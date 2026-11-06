# QAPRIL — Plateforme de gestion immobilière numérique — Côte d’Ivoire
## ADDENDUM ADD-25
### Transactions — vente de biens bâtis et de terrains par les agences
**Règles de gestion RG-VTE-01 à RG-VTE-26**

---

| Champ | Valeur |
| :--- | :--- |
| **Référence** | `QAPRIL/SPEC/001/2026 — ADD-25` |
| **Version** | 1.0 — 6 novembre 2026 — projet soumis à validation |
| **Éditeur** | AUXX SAS · Éditeur de QAPRIL |
| **Direction technique** | Achille M’Besso |
| **Modules impactés** | ADD-05 Biens (extension aux terrains et immeubles entiers) · ADD-06 Agences agréées · ADD-12 GED · ADD-13 Notifications · ADD-18 Analytique · ADD-21 Vivier (extension aux acquéreurs) · ADD-22 Vérification · ADD-23 Canal DGI (extension aux mutations) · module agence |
| **Textes de référence** | • Loi n° 2019-576 (CCH), art. 419 et s. (agents immobiliers agréés)<br>• Ordonnance n° 2013-481 et décret n° 2013-482 (acquisition de la propriété des terrains urbains, ACD)<br>• Loi n° 98-750 modifiée (domaine foncier rural, certificat foncier)<br>• CGI, droits d’enregistrement des mutations immobilières (taux en vigueur)<br>• Loi n° 2013-546 (transactions électroniques)<br>• Loi n° 2013-450 (protection des données personnelles) |
| **Positionnement** | Spécifié maintenant parce qu’il conditionne l’adhésion des agences ; développé après la mise en production du module locatif (décision de séquencement, voir § 9). |

---

## 1. Objet

Les agences immobilières agréées exercent deux activités :
1. **La gestion locative**, couverte par les addendums ADD-01 à ADD-24.
2. **La transaction** — vente de maisons, d’appartements, d’immeubles et de terrains — qui constitue l’essentiel de leur marge.

Une agence ne tiendra pas ses ventes dans un outil et ses locations dans un autre. L’**ADD-25** étend le module agence à la transaction, avec un **principe constant** : 

> **Principe Cardinal RG-VTE-16** :  
> QAPRIL suit, documente, vérifie et calcule ; il ne détient **jamais** le prix, ni les arrhes, ni l’acompte, qui relèvent exclusivement du notaire instrumentaire.

Le module a trois fonctions :
- **Sécuriser** : vérification du titre et du vendeur, prévention absolue de la double vente.
- **Fluidifier** : mandat, publication, offres, compromis, suivi notarial et fiscal.
- **Rendre compte** : au vendeur mandant, à l’agence, à l’administration pour la mutation foncière.

---

## 2. Biens à la vente — extension d’ADD-05

### RG-VTE-01 — Typologie à la vente
Un bien mis en vente appartient obligatoirement à l’une des catégories suivantes :
- Terrain urbain nu
- Terrain rural
- Maison (villa basse, duplex, triplex)
- Appartement
- Immeuble entier
- Local commercial / Professionnel
- Cour commune entière

*La structure parente d’ADD-05 est conservée ; un terrain est une structure à part entière, sans « portes ».*

### RG-VTE-02 — Fiche terrain
Un terrain est obligatoirement décrit par :
- Commune et quartier (ou village / sous-préfecture).
- Superficie en mètres carrés ($m^2$).
- Nature du titre juridique (RG-VTE-03).
- Numéro et date d'établissement du titre.
- Numéro de lot et d’îlot le cas échéant.
- Plan de situation ou croquis de bornage scanné.
- Coordonnées GPS des bornes si disponibles.
- Servitudes déclarées ou connues.
- Viabilisation : eau courante (SODECI), électricité (CIE), voirie d'accès.

*Ces champs sont obligatoires pour autoriser la publication de l'annonce.*

### RG-VTE-03 — Nature du titre
Valeurs admises dans le système :
1. **Arrêté de Concession Définitive (ACD) / Titre Foncier** *(Niveau de sécurité juridique maximal)*.
2. **Lettre d’attribution** *(Document d'attente vers l'ACD)*.
3. **Attestation villageoise** *(Document coutumier nécessitant régularisation)*.
4. **Certificat foncier rural** *(Loi n° 98-750)*.
5. **Acte notarié de vente antérieur**.
6. **Autre** *(Libellé libre, non publiable publiquement)*.

*Chaque valeur porte un niveau de sécurité juridique affiché à l’acquéreur en langage clair et intelligible : seul l’ACD confère la pleine propriété inattaquable ; les autres documents sont des étapes préalables.*

### RG-VTE-04 — Vérification à la vente (extension ADD-22)
Niveaux de vérification attribués à un bien mis en vente :
- **Niveau 0** : Déclaratif pur par l'agence.
- **Niveau 1** : Identité du vendeur vérifiée (CNI / Passeport ONECI).
- **Niveau 2** : Rapprochement identité du vendeur $\leftrightarrow$ titulaire du titre (ou mandat / succession notariée documentés).
- **Niveau 3** : Titre contrôlé auprès du service étatique compétent (Conservation foncière, Guichet Unique du Foncier Urbain, Sous-Préfecture pour le rural) avec copie scannée de l'état des droits réels.
- **Niveau 4** : Visite physique de vérification sur site et constat de bornage contradictoire par une agence agréée partenaire ou géomètre assermenté.

> **Règle de publication** : La publication est strictement impossible en dessous du **Niveau 2**. Le badge officiel « **Bien vérifié** » exige impérativement le **Niveau 3**.

### RG-VTE-05 — Unicité et prévention de la double vente
Un titre foncier (combinaison `titre_type` + `titre_numero` + `commune`) ne peut être rattaché qu’à un **seul bien actif** sur la plateforme QAPRIL.  
- Toute tentative de création d’un bien portant un titre déjà enregistré déclenche un **blocage immédiat**, une alerte de sécurité adressée aux deux agences concernées et un signalement interne à l'équipe conformité.
- Un bien vendu est définitivement archivé avec son acte notarié ; sa remise ultérieure en vente exige impérativement le **nouveau titre délivré au nom de l’acquéreur**.

---

## 3. Mandat de vente — extension d’ADD-06

### RG-VTE-06 — Mandat écrit obligatoire
Toute mise en vente par une agence passe obligatoirement par un mandat de vente écrit, signé électroniquement par le vendeur (ou ses représentants légaux dûment habilités : procuration notariée, acte de notoriété, décision d’indivision) et l’agence immobilière agréée.  
*Sans mandat validé, aucune publication d'annonce et aucune offre d'achat ne peuvent être émises.*

### RG-VTE-07 — Contenu du mandat
Le mandat comprend obligatoirement :
- Identité complète et qualité du vendeur.
- Désignation cadastrale exacte du bien et de son titre juridique.
- Prix net vendeur et prix de présentation public.
- Caractère **exclusif** ou **simple**.
- Durée de validité (maximum 12 mois, renouvelable expressément).
- Commission d'agence (montant forfaitaire ou pourcentage, et partie débitrice).
- Conditions d'accès et modalités des visites.
- Obligations de diligence de l’agence.
- Faculté et clauses de résiliation anticipée.
- Numérotation officielle normalisée : `MV-AAAA-NNN`.
- Empreinte cryptographique SHA-256 et archivage légal en GED.

### RG-VTE-08 — Exclusivité
- **Mandat exclusif** : Bloque techniquement toute création d’un second mandat sur le même bien pendant toute sa durée de validité.
- **Mandat simple** : Autorise plusieurs agences agréées à détenir un mandat, chacune ne voyant que ses propres offres et visites. La règle d’unicité du titre (RG-VTE-05) s’applique : un même bien sous-jacent, plusieurs mandats concurrents, mais jamais plusieurs biens dupliqués.

### RG-VTE-09 — Vendeur masqué (RG-CONF-01 à 05)
Les règles de confidentialité souveraines s’appliquent au vendeur :
- L’acquéreur potentiel ne voit **jamais** l'identité du vendeur avant la signature du compromis de vente.
- Les collaborateurs d'agence voient un identifiant opaque de type `VEN-NNN` selon le paramétrage du bien.
- Le chef d’agence agréée voit toujours l'identité réelle.
- L’identité du vendeur est officiellement révélée aux deux parties lors du compromis, sous l'égide du notaire.

### RG-VTE-10 — Reporting au vendeur
Le vendeur mandant dispose d’un espace digital dédié en temps réel :
- Nombre de vues de l’annonce.
- Nombre de visites physiques réalisées et comptes rendus associés.
- Offres d’achat reçues (montants, conditions de paiement et délais).
- Étape en cours dans le pipeline de vente.
- Documents contractuels scellés.
- Un rapport récapitulatif est généré automatiquement à chaque offre et le 1er de chaque mois.

---

## 4. Publication et vivier acquéreurs — extension d’ADD-21

### RG-VTE-11 — Annonce de vente
L'annonce est publiée sous la raison sociale de l’agence agréée avec :
- Le badge officiel de niveau de vérification.
- La nature exacte du titre juridique en clair.
- Le prix de vente affiché en XOF (FCFA) et la mention « négociable » ou « non négociable ».
- Photographies réelles horodatées et géolocalisées.
- *Condition stricte : Mandat validé et niveau de vérification $\ge 2$.*

### RG-VTE-12 — Profil acquéreur
Tout utilisateur QAPRIL peut déclarer un projet d’achat immobilier :
- Type de bien recherché (terrain, villa, appartement, immeuble).
- Communes ciblées.
- Budget minimum et maximum.
- Mode de financement : fonds propres disponibles, crédit bancaire en cours d’instruction, ou mixte.
- Horizon d'achat (immédiat, sous 3 mois, sous 6 mois).
- *L'identité de l'acquéreur est vérifiée avant toute visite ou formulation d'offre. L'agence voit des badges vérifiés (« Identité confirmée », « Financement documenté »), sans accès indiscret aux pièces privées.*

### RG-VTE-13 — Visites
- Demande de visite effectuée directement dans l'application.
- Confirmation et assignation d'un collaborateur par l'agence.
- Horodatage et géolocalisation du collaborateur sur les lieux lors de la visite.
- Rédaction d'un compte rendu de visite numérisé, rattaché au dossier de vente et transmis au vendeur.

---

## 5. Offres, compromis et pipeline de transaction

### RG-VTE-14 — Offre d’achat
L'offre d'achat contient :
- Montant proposé en FCFA.
- Conditions suspensives (accord de prêt, délais de paiement).
- Durée de validité de l'offre (de 1 à 15 jours calendaires).
- Transmission immédiate au vendeur.
- Le vendeur peut : **Accepter**, **Refuser**, ou **Contre-proposer** dans l’application.
- Une offre acceptée place automatiquement les autres offres concurrentes en « liste d’attente » jusqu'à réitération du compromis.

### RG-VTE-15 — Compromis de vente
Généré par QAPRIL à partir des données du mandat et de l’offre acceptée :
- Identification des parties, désignation du bien, prix convenu.
- Conditions suspensives (obtention de prêt bancaire, purge de préemption, obtention de l'ACD définitif pour un terrain en cours).
- Délai de réitération par acte authentique.
- Désignation de l'étude notariale instrumentaire et séquestre.
- Signature électronique certifiée avec empreinte SHA-256.
- *Si le notaire rédige lui-même son propre acte de compromis, QAPRIL enregistre le document scanné scellé du notaire comme document maître.*

### RG-VTE-16 — Maniement des fonds — Règle Absolue & Inviolable
> **ATTENTION — RÈGLE NON PARAMÉTRABLE :**  
> QAPRIL ne détient, ne séquestre, ni n’achemine **JAMAIS** le prix de vente, les arrhes, l'acompte ou le dépôt de garantie d’une vente immobilière.  
> Le compromis désigne obligatoirement le notaire comme séquestre légal.  
> L’application affiche les coordonnées complètes de l’étude notariale et son relevé d'identité bancaire officiel (RIB d'étude).  
> Tout paiement du prix ou des arrhes est exécuté directement par l’acquéreur à l’étude du notaire.  
> L’agence immobilière agréée encaisse uniquement sa propre commission d'intermédiation (RG-VTE-21).

### RG-VTE-17 — Pipeline de transaction
Les étapes du cycle de vente sont strictement séquencées :
1. `MANDAT` : Mandat de vente signé.
2. `PUBLIÉ` : Annonce publique vérifiée active.
3. `VISITES` : Visites en cours de réalisation.
4. `OFFRE_ACCEPTÉE` : Accord vendeur-acquéreur sur le prix.
5. `COMPROMIS_SIGNÉ` : Avant-contrat scellé.
6. `CONDITIONS_EN_COURS` : Levée des conditions suspensives (crédit, DGI, etc.).
7. `ACTE_SIGNÉ` : Signature de l'acte authentique chez le notaire.
8. `MUTATION_ENREGISTRÉE` : Enregistrement de la mutation foncière à la Conservation.
9. `CLÔTURÉ` : Dossier archivé et finalisé.

*Statuts de sortie : `RETIRÉ`, `CADUC` (mandat expiré sans vente), `ÉCHEC` (condition suspensive non réalisée).*  
*Chaque transition est horodatée avec auteur identifié. La date prévisionnelle de l’étape suivante génère des alertes de rappel à J-7.*

### RG-VTE-18 — Dossier notaire
Dès acceptation de l'offre, QAPRIL génère automatiquement un **dossier notarial complet** :
- Pièces d’identité des parties certifiées.
- Titre de propriété scanné et contrôle de conservation foncière.
- Mandat de vente et offre d'achat acceptée.
- Compromis scellé et plans cadastraux / bornage.
- État hypothécaire s'il existe.
- Transmission au notaire par **lien sécurisé HMAC** (validité 30 jours, sans création obligatoire de compte).
- Si le notaire possède un compte QAPRIL (espace Notaire ADD-19), il actualise directement les jalons d'avancement.

---

## 6. Fiscalité, enregistrement et commission

### RG-VTE-19 — Droits de mutation
Dès l'offre acceptée, QAPRIL calcule et affiche la décomposition fiscale et financière :
1. **Droits d’enregistrement de la mutation** : calculés selon le CGI en vigueur (4 % du prix de vente pour les mutations à titre onéreux).
2. **Frais de publication foncière** : émoluments de conservation foncière.
3. **Émoluments du notaire** : estimation conforme au barème officiel réglementé en Côte d'Ivoire.
4. **Commission d'agence** : honoraires prévus au mandat.

*L'affichage distingue clairement la part revenant à l'État (DGI/Trésor), au Notaire, et à l'Agence.*

### RG-VTE-20 — Canal DGI — extension ADD-23
L’enregistrement officiel de l'acte authentique demeure de la compétence du notaire.  
Le canal DGI d'ADD-23 permet de :
- Recevoir la déclaration de mutation et le reçu officiel DGI dématérialisé.
- Tracer le reçu fiscal obtenu hors canal pour conformité.
- Apporter à l'administration fiscale une visibilité certifiée sur les prix réels de transaction du marché ivoirien.

### RG-VTE-21 — Commission d'agence
- Fixée dans le mandat de vente écrit.
- Exigible **uniquement** à la signature de l’acte authentique (ou selon les stipulations exécutoires du mandat), jamais avant le compromis.
- Facturée par l’agence via QAPRIL (facture normalisée numérotée, TVA applicable le cas échéant).
- Règlement par Mobile Money (Wave, Orange, MTN, Moov), virement ou carte bancaire vers le compte bancaire de l’agence.
- *QAPRIL ne prélève aucun pourcentage sur la commission de vente de l'agence.*

### RG-VTE-22 — Barème professionnel
Si la CPRAIMA-CI ou les autorités adoptent un barème officiel ou des plafonds d'honoraires, les paramètres sont appliqués par la plateforme et tout mandat prévoyant une commission hors barème fait l'objet d'un avertissement au chef d'agence avant signature.

---

## 7. Sécurité, fraude et traçabilité

### RG-VTE-23 — Signaux d'alerte de fraude
Déclenchement automatique d'alertes internes et vérification renforcée dans les cas suivants :
- Titre foncier déjà présent sur la plateforme.
- Vendeur différent du titulaire sans acte de procuration ou de notoriété valide.
- Prix proposé inférieur de plus de 40 % à la médiane observée de la commune (`M-INTELLIGENCE`).
- Signalement de pressions pour verser des arrhes en direct hors notaire.
- Demande de visite sans accès effectif au bien.
- Métadonnées des pièces jointes incohérentes ou altérées.

*Les signaux d'alerte sont visibles uniquement par le chef d’agence et les auditeurs internes, jamais sous forme accusatoire vis-à-vis du public.*

### RG-VTE-24 — Signalement et liste de vigilance
Tout bien immobilier ou vendeur signalé par **deux agences agréées distinctes** est immédiatement placé en **liste de vigilance** :
- Suspension conservatoire de la publication.
- Revue d'audit par l'équipe QAPRIL sous 48 heures.
- Information confidentielle de la CPRAIMA-CI.

### RG-VTE-25 — Journal d'audit légal
Chaque opération (création, vérification, signature de mandat, publication, visite, offre, décision, compromis, étape du pipeline, facturation de commission) est consignée dans un journal immuable avec horodatage certifié, adresse IP, identité de l'auteur et collaborateur d'agence sous code masqué. Export du dossier de transaction disponible en PDF scellé et JSON en cas de procédure judiciaire.

### RG-VTE-26 — Conservation
Les dossiers complets de transaction sont conservés pendant **dix (10) ans** à compter de la clôture définitive. Les actes notariés scannés sont conservés avec leur empreinte cryptographique d'origine sans altération.

---

## 8. Parcours agence agréée

- **Onglet « Ventes »** : Suivi du pipeline par statut, volume financier des mandats en cours, commissions prévisionnelles, alertes critiques (mandats proches de l'expiration, offres sans réponse, conditions suspensives à échéance, signaux de fraude).
- **Création de mandat** : Choix du type de bien $\rightarrow$ saisie de la fiche (terrain : titre, superficie, bornage) $\rightarrow$ identification du vendeur et contrôle du titre $\rightarrow$ conditions de vente et commission $\rightarrow$ signature électronique OTP.
- **Fiche de transaction** : Synthèse du bien et niveau de vérification, vendeur (masqué ou non), mandat actif, offres reçues, étape courante du pipeline, dossier notaire, calcul des droits DGI et frais, commission due.
- **Vivier acquéreurs** : Rapprochement automatique des acquéreurs potentiels compatibles, planification des visites, réception des offres.
- **Espace Vendeur** : Reporting en direct (RG-VTE-10), validation ou contre-proposition sur les offres d'achat, signature électronique du compromis.
- **Espace Acquéreur** : Dossier de recherche d'achat, découverte des biens vérifiés, demandes de visite, formulation d'offres d'achat, suivi notarial.

---

## 9. Séquencement et hors périmètre v1

### Séquencement de déploiement :
1. **Étape 1** : Biens à la vente, fiches terrains et moteur de vérification (Niveaux 0 à 4, unicité des titres).
2. **Étape 2** : Mandat de vente numérisé et publication des annonces vérifiées.
3. **Étape 3** : Offres d'achat horodatées et compromis de vente scellé.
4. **Étape 4** : Constitution du dossier notaire dématérialisé et pipeline de transaction.
5. **Étape 5** : Décompte fiscal (droits de mutation CGI 4%), facturation des commissions et extension du canal DGI.

### Hors périmètre v1 :
| Hors périmètre v1 | Motif d'exclusion |
| :--- | :--- |
| **Promotion immobilière & VEFA (Vente sur plan)** | Régime juridique et garanties financières spécifiques ; fera l'objet d'un produit dédié. |
| **Lotissement et vente de parcelles par aménageur** | Relève du métier exclusif d’aménageur foncier ; relèvera d'un module AUXX spécialisé. |
| **Courtage de crédit immobilier** | Activité financière réglementée ; se limite en v1 au badge « Financement documenté ». |
| **Estimation algorithmique automatique des prix** | Données de transactions insuffisantes ; la médiane de quartier `M-INTELLIGENCE` ne sert que de signal interne anti-fraude. |
| **Séquestre ou maniement de fonds d'achat** | **Règle absolue RG-VTE-16** : Relève exclusivement du notaire. |

---

*Fin du document de spécification ADD-25 — QAPRIL Technologies SA / AUXX SAS.*

