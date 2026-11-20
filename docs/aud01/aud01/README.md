# QAPRIL — AUD-01 — Correctif du schéma de données (14/11/2026)

Réf. QAPRIL/CDC/003/2026-IC-01-R1 — complément « base de données ».
S'applique au fichier `schema.prisma` transmis par le CTO le 14/11 (185 modèles, 73 enums).

## Contenu
- `prisma/corrections/00_enums_IC-01-R1.prisma.txt` — 18 énumérations à ajouter.
- `prisma/corrections/01_modeles_corriges.prisma.txt` — modèles modifiés, lignes marquées `[M-xx]`.
- `prisma/migrations/M-01 … M-13.sql` — migrations PostgreSQL, une par point, dans l'ordre.
- `extensions/PERIMETRE_EXTENSIONS.md` — modèles à sortir du noyau (décision de direction).

## Ordre d'exécution
| Jalon | Migrations | Condition |
|---|---|---|
| **P0 — lundi 17/11 8h** | M-01, M-02, M-03, M-04 (partie P0), M-06, M-13 | Sans elles, les écrans P0 (fiche annonce, candidature unique, enums traduits) ne sont pas recevables |
| **P1 — 28/11** | M-04 (reste), M-05, M-07, M-08, M-09, M-10, M-11, M-12 | Recette volet A/B |
| **Go/No-go 1er déc.** | Séparation `extensions.prisma` | Après décision de direction |

## Méthode imposée (IC-M4 — recevabilité en base)
1. `prisma migrate diff` avant/après, joint au PV.
2. Chaque migration est jouée sur une copie de la base de préprod ; le script SQL et sa sortie sont archivés dans `QAPRIL_AUDIT_2026-12/03_migrations/`.
3. Toute valeur hors domaine détectée en M-04 est listée et arbitrée, jamais écrasée silencieusement.
4. Pas de `prisma db push` en production.

## Tests de recette associés
| Migration | Test |
|---|---|
| M-01 | 2e candidature ENVOYEE sur la même annonce → 409 `CANDIDATURE_EXISTANTE` ; après RETIREE, une nouvelle est acceptée |
| M-02 | `\d leases` ne montre plus `signing_otp` ; signature OTP fonctionne toujours |
| M-03 | Bail DRAFT → `NON_CERTIFIE` ; `certifie_at` non nul uniquement après certification |
| M-04 | `INSERT ... statut='pendng'` → erreur 22P02 ; écran n'affiche aucune valeur brute |
| M-06 | Bailleur particulier publie une annonce ; agence sans mandat → erreur `ck_annonce_agence_mandat` ; API publique sans `address`/`gps` |
| M-07 | Dépôt 3 mois → erreur ; 2e mandat ACTIF sur un bien → erreur ; bail sous mandat → `bailleur_masque = true` même si l'API envoie `false` |
| M-08 | Bail sans durée accepté ; un bail ACTIVE peut porter `IMPAYE` sans changer de statut |
| M-11 | `DELETE FROM leases` avec attestation → erreur 23503 |
