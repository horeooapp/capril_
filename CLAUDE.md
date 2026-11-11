# QAPRIL — Règles de travail pour les agents de code

Ce fichier s'applique à tout agent (Claude Code, Antigravity ou autre) et à tout humain qui modifie ce dépôt.
Référence normative : CDC Global v3.0, addendums ADD-01 à ADD-29, instruction corrective IC-01 et sa révision IC-01-R1 (dossier `docs/spec/`).
En cas de doute entre ce fichier et la spécification, la spécification l'emporte. En cas de doute entre la spécification et une idée, l'idée attend une décision écrite.

## 1. Les cinq règles qui ne se discutent pas

**M1 — Aucune règle métier nouvelle.**
Tu n'ajoutes aucune fonction, aucun écran, aucun flux financier, aucun champ qui ne figure pas dans la spécification ou dans un ticket validé. Si une fonction te paraît utile ou « naturelle » (épargne, crédit, assurance, abonnement, option payante, notification non prévue), tu l'écris dans `docs/propositions.md` et tu t'arrêtes. Tu ne la codes pas, même désactivée, même derrière un drapeau.

**M2 — Aucune fonction simulée.**
Tu n'affiches jamais un état que le serveur ne calcule pas ou n'enregistre pas : niveau de vérification, statut « enregistré », « certifié », « vérifié », « partagé », identifiant MaPoste, position capturée, reversement effectué, mandat signé. Si le calcul ou l'intégration n'existe pas encore, l'écran affiche « non vérifié », « disponible prochainement » ou rien. Jamais une saisie manuelle à la place d'une intégration. Jamais une valeur par défaut qui ressemble à un résultat.

**M3 — Aucune énumération brute.**
Aucune valeur d'énumération (`ACTIF`, `ENFANT_MAJEUR`, `ORANGE_MONEY`, `A_TRAITER`…) n'atteint un écran, un PDF, un SMS ou un message WhatsApp. Tout passe par `config/enums.json`. Si une valeur manque, tu l'ajoutes au fichier avec son libellé français, tu ne l'affiches pas en dur.

**M4 — Recevabilité en base.**
Une correction est terminée quand : (1) le test automatisé qui prouve son effet côté serveur passe ; (2) la preuve (extrait de base, journal, export) est jointe à la demande de fusion ; (3) le critère de recette du ticket est reproduit sur l'environnement de test. Un écran qui « a l'air de marcher » n'est pas une preuve.

**M5 — Socle commun.**
Toute modification de libellé, d'énumération, de navigation, d'identité ou de document généré est appliquée dans les trois applications (Locataire, Bailleur, Agence) et dans les clients web s'ils existent, dans la même demande de fusion. Tu listes, dans la description de la fusion, chaque client touché.

## 2. Vocabulaire

- Tous les libellés utilisateur viennent de `config/lexique.json`. Tu ne rédiges pas de texte utilisateur en dur dans un composant.
- Interdits dans tout texte visible par un utilisateur : codes de règles (`RG-`), numéros d'addendum (`ADD-`), termes techniques (`SHA-256`, `HMAC`, `OTA`, `preview`, `build`, `hash`, `webhook`, `KYC`, `OTP` seul), numéros de loi, capitales entières, tirets bas, anglais (`APARTMENT`, `BUILDING`, `VILLA`).
- Le mot « certifié » est réservé aux documents qui portent une empreinte vérifiable sur `qapril.ci/verifier`. « Enregistré » est réservé à un bail dont les droits d'enregistrement sont payés. « Vérifié » est réservé à un bien de niveau 3 ou plus.
- Une phrase par libellé, sujet « vous » ou « je », pas de point d'exclamation, pas de parenthèse de référence.
- Test obligatoire : `scripts/check_lexique` (grep des chaînes interdites dans les ressources des trois applications et les gabarits PDF/SMS) passe à zéro résultat avant toute fusion.

## 3. Identité et sécurité

- L'identifiant d'un compte est le numéro de téléphone vérifié par code SMS (6 chiffres, 10 minutes, 3 essais). L'e-mail est un champ optionnel de contact. Aucun compte ne reste au statut `PENDING` après migration ; un compte sans numéro vérifié ne peut ni recevoir ni émettre de SMS.
- Le numéro national d'identification (NNI) ne quitte jamais le serveur et n'est jamais affiché, même masqué.
- Un bailleur masqué (RG-CONF) n'apparaît par son nom nulle part côté locataire : ni écran, ni PDF, ni message, ni annonce. Sous mandat d'agence agréée, le masquage est forcé et non modifiable (RG-MAN-02).
- QAPRIL ne détient aucun fonds de particulier : ni caution, ni épargne, ni avance (ADD-13). Toute logique qui conserve, bloque ou fait fructifier de l'argent est interdite.

## 4. Règles métier à contrôler côté serveur (jamais seulement côté client)

| Règle | Contrôle serveur | Réponse |
|---|---|---|
| Dépôt de garantie ≤ 2 mois de loyer | Refus à la création et à la modification du bail | 422 + message `lexique.bail.depot_max` |
| Avance exigée ≤ 2 mois | Idem | 422 + `lexique.bail.avance_max` |
| Durée de bail obligatoire (12 / 24 / 36 mois) | Refus si absente | 422 + `lexique.bail.duree_requise` |
| Une candidature par (locataire, annonce) tant que l'état n'est pas Retirée, Non retenue ou Expirée | Contrainte d'unicité + vérification | 409 + `lexique.candidature.deja_envoyee` (avec la date) |
| Une confirmation par paiement déclaré | Idempotence sur l'identifiant du paiement | 409, aucune seconde quittance |
| Proposition de loyer entre 80 et 100 % si négociable | Refus hors bornes | 422 + `lexique.annonce.proposition_bornes` |
| Annonce publiable seulement si dépôt ≤ 2 et avance ≤ 2 | Refus à la publication | 422 + explication article 415 |
| Niveaux de vérification | Calculés à partir des objets (pièce validée, Mobile Money rapproché, titre contrôlé, rapport de visite) ; jamais écrits directement | — |
| Position d'un bien | Capturée par GPS réel ; `provisoire` → `confirmée` (1 locataire) → `gelée` (2 captures concordantes) | — |

## 5. Données et environnements

- Trois environnements : `dev`, `test` (recette et simulation Phase 0), `prod`. Aucune donnée fictive en `prod`. Aucun déploiement sur `test` entre le 17 et le 28 novembre 2026 sans accord écrit du chef de recette.
- Le jeu de données de référence est `data/section8/*.csv` (21 personas, 7 structures, 16 portes, 15 baux, quittances 12 mois, 12 annonces). Il est chargé sur `test` par `scripts/seed_section8`. Aucune autre donnée de démonstration (« Cornerstone », « BUILDING », « ciad », images de synthèse).
- Les lieux viennent du référentiel `config/lieux.json` (commune → quartiers). Aucune saisie libre de commune ou de quartier.
- Les documents générés (quittance, bail, lettre de congé, attestation) portent l'empreinte numérique en pied avec la phrase du lexique ; l'empreinte n'apparaît nulle part ailleurs.

## 6. Comment tu travailles

1. Tu prends **un ticket** de `docs/tickets.md`, dans l'ordre des dépendances. Tu ne regroupes pas plusieurs tickets dans une branche.
2. Tu relis la correction correspondante dans IC-01 / IC-01-R1 avant d'écrire une ligne.
3. Serveur d'abord : tu écris le test qui échoue, puis le code, puis tu vérifies que le test passe et que `check_lexique` passe.
4. Écrans ensuite, en consommant l'API livrée. Tu n'anticipes jamais un calcul serveur par une valeur locale.
5. Tu ouvres une demande de fusion avec : le ticket, les clients touchés (M5), la preuve en base (M4), les captures avant/après.
6. Tu ne déploies pas. Le déploiement OTA est déclenché par un humain après recette.
7. Si le ticket est ambigu, tu poses la question dans la demande de fusion et tu t'arrêtes. Tu ne choisis pas l'interprétation « la plus complète ».

## 7. Ce que tu ne fais jamais

- Ajouter une fonction, un écran ou un champ « pendant que j'y suis ».
- Afficher un état calculé localement pour « que ça marche en démo ».
- Mettre un libellé en dur, une valeur d'énumération, un numéro de loi, un terme technique dans un texte utilisateur.
- Écrire directement un niveau, un statut « enregistré » ou « certifié » en base pour un compte de test.
- Contourner un contrôle serveur côté client.
- Fusionner sans test, sans preuve, sans relecture humaine.
