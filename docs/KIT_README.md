# Kit d'implémentation IC-01-R1 — à poser dans le dépôt QAPRIL

| Fichier | Emplacement conseillé | Rôle |
|---|---|---|
| CLAUDE.md | racine du dépôt (et copie dans .antigravity/rules si utilisé) | Règles de travail pour les agents de code : M1 à M5, vocabulaire, contrôles serveur, méthode |
| enums.json | config/enums.json | Table des libellés pour toutes les énumérations (IC-M3) ; servie par l'API, consommée par les trois apps et les gabarits |
| lexique.json | config/lexique.json | Tous les libellés utilisateur ; liste des chaînes interdites pour le script check_lexique |
| tickets.md | docs/tickets.md | 70 tickets ventilés par couche, avec dépendances, DoD et ordre d'exécution |

À joindre également : le jeu de données section 8 (archive CSV du 9 novembre) dans data/section8/, et les documents IC-01 et IC-01-R1 dans docs/spec/.
