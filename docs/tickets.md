# QAPRIL — Tickets IC-01-R1, ventilés par couche et ordonnés

Référence : IC-01-R1 (QAPRIL/CDC/003/2026-IC-01-R1). Un ticket = une branche = une demande de fusion. Chaque ticket porte sa définition de « terminé » (DoD) : le test serveur, la preuve en base, le critère de recette. Les dépendances sont strictes : on ne commence pas un ticket dont une dépendance n'est pas fusionnée.

Conventions : `S` serveur / API / base · `L` libellés et enums · `D` documents et messages générés · `ML` mobile Locataire · `MB` mobile Bailleur · `MA` mobile Agence · `E` environnement et données. Priorité P0 = avant le 17 novembre 8 h · P1 = avant le 28 novembre · P2 = lot 1.

---

## Vague 0 — Environnement (avant tout, échéance 13 novembre)

| Ticket | Couche | Contenu | DoD |
|---|---|---|---|
| E-01 | E | Environnement `test` séparé de `prod` : base, API, stockage, SMS, canal OTA `simulation` | Un compte créé sur `test` est absent de `prod` ; URL et canal documentés |
| E-02 | E | Script `seed_section8` chargeant `data/section8/*.csv` (21 personas, 7 structures, 16 portes, 15 baux, quittances, 12 annonces, signalements, messages, mandat) | Recherche sans « Cornerstone » ; Mes biens sans « ciad » ; 12 annonces visibles |
| E-03 | E | Paiements Mobile Money fonctionnels sur `test` (bac à sable agrégateur ou portefeuilles rattachés) | Un paiement de 1 000 F aboutit et produit une quittance |
| E-04 | E | Accès lecture journaux + base `test` pour l'administrateur de données ; exports CSV baux, paiements, quittances, candidatures | Export produit le J-3 |
| E-05 | E | Sauvegarde / restauration de `test` en moins d'une heure | Test de restauration réussi |
| E-06 | E | Envoi réel des SMS (OTP, signature, relances) vers les 21 lignes du kit, plafond journalier | OTP reçu sur chaque ligne |
| E-07 | E | Gel de version : aucun déploiement sur `test` du 17 au 28 sans accord écrit ; numéro de version consigné | Procédure écrite ; pipeline bloqué |
| E-08 | E | Script `check_lexique` : grep des chaînes interdites (`config/lexique.json._interdits`, tirets bas, mots en capitales, anglais) dans les ressources des trois apps et les gabarits PDF/SMS ; exécuté en CI | Zéro résultat = vert ; sinon fusion bloquée |

## Vague 1 — Fondations serveur et libellés (P0, avant le 17)

| Ticket | Couche | Contenu | Dépend de | DoD |
|---|---|---|---|---|
| L-01 | L | Table de libellés `config/enums.json` servie par l'API (`GET /v1/config/enums`) et consommée par les trois apps ; aucun enum en dur | — | `check_lexique` vert ; capture de chaque liste et filtre (occupants, statuts, types, modes de paiement) en français |
| L-02 | L | `config/lexique.json` servi et consommé ; retrait des chaînes en dur dans les composants | L-01 | Diff montrant zéro chaîne utilisateur hors lexique |
| S-01 | S | Retrait complet de la tirelire : écrans, API, tables, tâches ; aucune logique de conservation de fonds. Idée consignée dans `docs/propositions.md` | — | Aucune table/route/chaîne « tirelire » ou « épargne » ; preuve par grep et schéma de base |
| S-02 | S | Migration identité : flux OTP (6 chiffres, 10 min, 3 essais) ; au prochain lancement d'un compte `PENDING`, demande du numéro + OTP ; e-mail conservé en contact ; numéro masqué dans l'API | E-06 | Export comptes : zéro `PENDING` après migration des comptes de test ; test automatisé du flux OTP ; SMS reçu |
| S-03 | S | Objet Candidature : contrainte d'unicité (locataire, annonce) tant que l'état ∉ {RETIREE, NON_RETENUE, EXPIREE} ; machine à états ENVOYEE → VUE → VISITE_PROPOSEE → RETENUE/NON_RETENUE ; RETIREE ; EXPIREE ; horodatage de chaque transition ; `POST /v1/annonces/{id}/candidater` renvoie 409 + `lexique.recherche.deja_envoyee` sur doublon | L-02 | Test : deux POST → une ligne, second = 409 ; export candidatures |
| S-04 | S | Écran Annonce côté API : `GET /v1/annonces/{id}` renvoie photos, prix et conditions, badge (niveau du bien), publiant (agence nommée ou « bailleur particulier »), disponibilité, négociable, score + raisons + manques, description, équipements, quartier (centre flou + rayon 300 m), jamais l'adresse ni la position exacte | — | Réponse JSON conforme ; test : aucun champ adresse/lat/lng exact pour un locataire |
| S-05 | S | Suppression des mentions simulées côté API : `enregistre` = droits DGI payés ; `certifie` = empreinte présente ; `verifie` = niveau ≥ 3 ; aucun champ écrit directement par un client | — | Bail du jour : `enregistre=false` ; test unitaire des trois calculs |

## Vague 2 — Écrans P0 (avant le 17)

| Ticket | Couche | Contenu | Dépend de | DoD |
|---|---|---|---|---|
| ML-01 | ML | Écran Annonce (section 4.1 IC-01-R1) ; la carte de liste l'ouvre ; suppression de « Candidater en 1 clic » dans la liste | S-04, L-02 | Toucher une carte ouvre la fiche ; le bouton de liste n'existe plus |
| ML-02 | ML | Écran de consentement avant candidature (ce qui sera transmis, ajustable) ; bouton « Candidater avec mon passeport » ; après envoi, état « Candidature envoyée le … » ; suivi dans « Mes candidatures » | S-03, ML-01 | Deux tentatives : message `deja_envoyee` ; statut visible |
| ML-03 | ML | Consommation des enums et du lexique (occupants, statuts, types) ; retrait des chaînes en dur | L-01, L-02 | `check_lexique` vert sur l'app Locataire |
| MB-01 / MA-01 | MB, MA | Consommation des enums et du lexique ; retrait des chaînes en dur | L-01, L-02 | `check_lexique` vert sur Bailleur et Agence |
| ML-04 / MB-02 / MA-02 | ML, MB, MA | Flux de migration OTP au lancement ; affichage du numéro masqué | S-02 | Aucun jeton `PENDING` affiché ; captures |

## Vague 3 — Serveur P1 (avant le 28)

| Ticket | Couche | Contenu | Dépend de | DoD |
|---|---|---|---|---|
| S-06 | S | Contrôles de bail : dépôt ≤ 2, avance ≤ 2, durée obligatoire (12/24/36) → 422 + messages lexique ; récapitulatif des droits d'enregistrement calculé avant signature | L-02 | Tests : 3 mois refusé ; bail sans durée refusé |
| S-07 | S | Échéance calculée : `prochaine_echeance_date`, `jours_restants`, `retard_jours` par bail depuis le jour limite ; suppression du champ « frais » hors mandat | — | Valeurs exactes sur 3 cas (avant, jour J, après) |
| S-08 | S | Référentiel `config/lieux.json` (commune → quartiers) ; migration des 27 saisies libres ; refus de toute saisie libre à la création d'un bien ; point d'intérêt + rayon pour la recherche | — | Zéro lieu hors référentiel en base ; filtre « Communes » exact |
| S-09 | S | Interrupteurs du passeport persistés (`tranche`, `badges`, `foyer`, `historique`) ; appliqués au dossier transmis au publiant ; tranches A–D | S-03 | Désactiver « foyer » → absent du dossier transmis (test) |
| S-10 | S | Signalement rattaché au bail : logement, destinataire réel (bailleur ou agence selon mandat), statuts (RECU, PLANIFIE, EN_COURS, RESOLU) visibles côté locataire | — | Signalement visible côté bailleur sur le bon bien sous 10 s |
| S-11 | S | Fils de messagerie par bail ; identité affichée calculée (prénom N. / « Bailleur (identité protégée) » / agence) ; verrouillage sous mandat agréé | — | Fil d'un bail masqué : aucun nom du bailleur dans la réponse API |
| S-12 | S | MaPoste : consentement persisté ; statut `NON_DEMANDEE / EN_CREATION / CREEE` ; identifiant renseigné uniquement par le traitement d'intégration ; suppression de la saisie manuelle | — | Aucun identifiant écrit par un client (test) |
| S-13 | S | Score de compatibilité : prise en compte de la date au plus tard (10 %) et des critères secondaires ; raisons et manques retournés | S-04 | Test sur l'annonce RCH-UAT-02 : score ≥ 85 avec raisons |
| S-14 | S | Confirmation idempotente des paiements déclarés (une quittance par paiement) ; contestation ; cas du montant inférieur (REFUSER / ACCEPTER / ACCEPTER_AVEC_PLAN) avec imputation | — | Deux confirmations → une quittance ; imputation 250 000 sur 3×100 000 = 2 quittances + 1 reçu + solde 50 000 |
| S-15 | S | RG-CONF effectif : le drapeau « identité masquée » par bail s'applique aux PDF, à la messagerie, aux annonces ; forcé sous mandat agréé | S-11 | Quittance PDF d'un bail masqué sans nom ; test |
| S-16 | S | Niveaux calculés : compte (1 : OTP ; 2 : pièce validée + Mobile Money rapproché) ; bien (3 : titre contrôlé ; 4 : rapport de visite) ; aucun champ de niveau écrit directement | — | Compte neuf = niveau 1 ; test de chaque transition |
| S-17 | S | Position du bien : GPS réel, `PROVISOIRE → CONFIRMEE → GELEE` sur captures concordantes ; demande de modification motivée | — | Deux captures concordantes gèlent (test) |
| S-18 | S | Diaspora : désactivé par défaut ; activation par paiement carte effectif ; `afficher_euro` conditionné | E-03 | Compte neuf : `diaspora=false` ; journal de paiement |
| S-19 | S | Déclaration de logement par le locataire et invitation du bailleur par SMS/WhatsApp (choix 1/2/3) ; création du bail `ACTIF_NON_ENREGISTRE` à la réponse 1 ; création du bien proposée si inexistant | S-02, E-06 | Parcours complet sur `test` avec un bailleur sans application |
| S-20 | S | Mandat agence : double signature SMS horodatée (mandant puis agence) ; honoraires ; périmètre par portes ; reversement : ordre généré et traçable, honoraires déduits | S-02 | Mandat avec deux horodatages ; journal de reversement |

## Vague 4 — Documents (avant le 28)

| Ticket | Couche | Contenu | Dépend de | DoD |
|---|---|---|---|---|
| D-01 | D | Quittance PDF : nom du mandant ou « identité protégée » selon RG-CONF, agence et agrément sous mandat, empreinte en pied avec la phrase du lexique, aucune mention technique ailleurs | S-05, S-15 | PDF de 3 cas (direct, masqué, mandat) |
| D-02 | D | Bail PDF : durée, dépôt, avance, droits d'enregistrement, mention de la loi 2019-576, clauses à risque retirées ; « Enregistré le … » seulement après paiement | S-06 | PDF bail du jour sans « enregistré » |
| D-03 | D | Modèles SMS / WhatsApp : invitation du bailleur (1/2/3), demande de confirmation de paiement (1/2), relances J+3/J+7/J+15 ; libellés du lexique | S-19, S-14 | Messages reçus sur les lignes du kit ; `check_lexique` vert sur les modèles |
| D-04 | D | Page publique `qapril.ci/verifier` : vérification d'une empreinte sans révéler le bailleur | D-01 | Une quittance vérifiée depuis un navigateur hors session |

## Vague 5 — Écrans P1 (avant le 28)

| Ticket | Couche | Contenu | Dépend de |
|---|---|---|---|
| ML-05 | ML | Navigation P0-08 : barre Accueil · Mon bail · Payer · Recherche · Moi ; onglet actif = écran ; un seul retour ; menu latéral réduit ; suppression de « Retour à l'accueil » | — |
| MB-03 | MB | Navigation : Accueil · Biens · Baux · Flux · Plus ; en-tête unique ; déconnexion dans le compte seulement | — |
| MA-03 | MA | Navigation : Accueil · Portefeuille · Mandants · Candidats · Plus | — |
| ML-06 / MB-04 / MA-04 | ML, MB, MA | Bouton micro : marge basse 80 px sur listes et formulaires ; masquage au défilement | — |
| ML-07 | ML | Carte Loyer : date et compte à rebours depuis `prochaine_echeance_date` ; suppression de « Frais » | S-07 |
| ML-08 | ML | Bloc Où sur le référentiel (communes multiples, quartiers, point d'intérêt + rayon) ; bloc Quand complet ; suppression des champs doublons ; double curseur budget par paliers de 5 000 ; unité « F » | S-08, S-13 |
| ML-09 | ML | Carte d'annonce IC-R3 (badge, dépôt, avance, publiant, disponibilité, négociable, caution consignée, quartier seul) ; images du jeu de données | S-04, E-02 |
| ML-10 | ML | Passeport : quatre interrupteurs « Je montre / Je ne montre pas » ; tranches A–D ; état vide avec action | S-09 |
| ML-11 | ML | Signalements rattachés au bail ; statuts côté locataire | S-10 |
| ML-12 / MB-05 / MA-05 | ML, MB, MA | Messagerie : bandeau d'identité, fil par bail, titre « Messages », retrait de « Sécurisée » et « EN DIRECT » | S-11 |
| ML-13 | ML | MaPoste : statut seul, aucune saisie ; consentement à l'inscription | S-12 |
| ML-14 | ML | Mes documents / Quittances : mentions conditionnelles (« Enregistré le … » / « Signé, en attente d'enregistrement ») ; retrait de « certifié », « séquestrés », « coffre-fort » | S-05 |
| ML-15 | ML | Accueil sans bail : état « Aucun logement déclaré », déclaration en 4 questions, invitation, statut d'attente ; retrait du bloc fluides tant qu'aucun bail | S-19 |
| MB-06 | MB | Carte « À confirmer » (déclarations) et carte « Paiements à confirmer » ; décision sur montant inférieur avec aperçu d'imputation | S-14, S-19 |
| MB-07 | MB | Nouveau bail : durée obligatoire, plafonds avec messages 422, échéance 1/5/15, récapitulatif DGI, clauses à risque signalées | S-06 |
| MB-08 | MB | Ajouter un bien en 3 étapes (structure → type → détails) ; lieux sur référentiel ; capture GPS réelle ; niveaux par bien avec action | S-08, S-16, S-17 |
| MB-09 | MB | Interrupteur « Masquer mon identité à ce locataire » ; verrouillé sous mandat avec explication | S-15 |
| MB-10 | MB | Diaspora : écran d'activation payant ; « Afficher en € » conditionné ; suppression de « Frais de gestion » hors mandat | S-18 |
| MA-06 | MA | Mandats : signature double, honoraires, reversements ; candidatures uniques avec tranche et badges ; réclamations avec délai 48 h | S-20, S-03, S-10 |

## Vague 6 — P2 (lot 1)

| Ticket | Couche | Contenu |
|---|---|---|
| ML-16 / MB-11 / MA-07 | ML, MB, MA | Ligne de version et OTA déplacée dans « À propos » ; carte « Manuel » déplacée dans « Aide » |
| ML-17 / MB-12 / MA-08 | ML, MB, MA | Boîtes de dialogue système remplacées par des messages dans l'application ; suppression des exclamations |
| ML-18 | ML | États vides avec action (quittances, passeport) ; double cloche supprimée ; casse des noms conservée ; statut d'occupant explicite |

---

## Ordre d'exécution recommandé (deux développeurs)

1. **Jours 1–2** : E-01 à E-08 (environnement) + L-01, L-02 (libellés) + S-01 (retrait tirelire). Ces tickets débloquent tout le reste.
2. **Jours 2–5** : S-02 (OTP), S-03 (candidature), S-04 (annonce API), S-05 (états calculés) en parallèle des écrans ML-01 à ML-04, MB-01/02, MA-01/02.
3. **17 novembre 8 h** : recette P0 sur `test`, gel de version.
4. **18–27 novembre** : S-06 à S-20 et D-01 à D-04 côté serveur ; les écrans ML-05 à MA-06 suivent chaque API livrée, sur une branche d'intégration non déployée sur `test`.
5. **28 novembre** : livraison P1 en une fois sur `test` après accord du chef de recette ; recette ; go / no-go le 1er décembre.
6. **Lot 1 IC-01** : vague 6.

Un ticket dont le test n'existe pas n'est pas commencé. Un ticket dont la preuve en base n'est pas jointe n'est pas fusionné.
