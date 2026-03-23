# Infrastructure Technique QAPRIL v3.0 — Référentiel Définitif (Mars 2026)

## 1. Vision et Contexte Institutionnel (ADN / ONG)
QAPRIL (Quittancement Autonome et Plateforme des Ressources Immobilières Locatives) est une infrastructure numérique portée par l'ONG internationale **ADN (Aider Donner Nourrir)**. Elle vise à formaliser le marché locatif ivoirien (960 000 ménages à Abidjan) par la traçabilité et la preuve certifiée.

## 2. Socle Technologique et Architecture (Parties 3 & 26)
L'architecture est de type **Full-Stack JavaScript/TypeScript** avec une persistance distribuée :
- **Backend Core** : Node.js 20 LTS (Express.js / Edge Runtime).
- **Frontend** : Next.js 15 (SSR, SEO, PWA) & React Native (Expo SDK 50+).
- **Base de Données** : PostgreSQL 16 (ACID, JSONB) & Redis 7 (USSD Sessions, Queue Management).
- **Stockage & Documents** : AWS S3 (Documents KYC, Certificats PDF).
- **Moteur PDF** : Puppeteer 21+ & pdf-lib pour la signature électronique.

## 3. Écosystème de Communication Cross-Canal (Parties 18, 19, 20)
QAPRIL assure une délivrance 100% garantie via une chaîne de fallback intelligente :
- **WhatsApp Cloud API** : Canal de prédilection pour l'envoi des quittances et le "Bail Déclaratif" conversationnel.
- **USSD (*144#)** : Accès sans internet pour consultation de solde et paiement via n'importe quel mobile (Orange CI).
- **MaPoste (La Poste CI)** : Impression et livraison physique des mises en demeure et certificats légaux.
- **SMS Transactionnel** : OTP (6 chiffres, validité 5 min) et alertes critiques (Relance J+1).

## 4. Ingénierie Financière et Modèle Flottant (Parties 9, 10, 30)
- **Hybride Payments** : Orange Money, MTN, Moov, Wave, Digicash (Webhooks HMAC-SHA256).
- **Modèle Flottant CDC-CI** : Agrégation des cautions (Dépôts de garantie) investies via la CDC-CI dans des bons du Trésor.
- **Wallet QAPRIL** : Micro-porte-monnaie interne pour couvrir les frais de service (75 FCFA TTC / quittance).
- **Bail Déclaratif (BDQ)** : Inscription gratuite pour les cours communes, favorisant l'inclusion financière.

## 5. Registre, Baux et Hiérarchie (Parties 6, 7, 8, 12, 22)
- **Structure Data 5 Niveaux** : Agence → Propriétaire → Mandat (Logique MM-01/05) → Entité (HAB/COM) → Unité.
- **Bail Commercial OHADA** : Moteur d'indexation automatique basé sur l'IPC.
- **Multi-Mandat** : Capacité pour un propriétaire de piloter N biens via M agences simultanément avec vue consolidée.

## 6. Intelligence Opérationnelle et Score (Parties 11, 13, 14, 15)
- **Indice ICL (Confiance Locatif)** : Score 300-1000 (750 initial) basé sur 6 critères (Paiement, KYC, Stabilité, Litiges).
- **Dossier Arrears 10 Phases** : Automatisation des relances de J+1 à J+90 (Mise en demeure, Médiation ANAH).
- **Certificat CNL & Passport Logement** : Documentation portable et infalsifiable de l'historique du locataire et du bien.

## 7. Catalogue API et Hub de Partenaires (Partie 18, Catalogue 1.0)
Architecture REST documentée Open API 3.0 avec 87 endpoints répartis sur 12 domaines :
- **Endpoints Institutionnels** : DGI (Fiscalité M17), ANAH (Observatoire), CDC-CI (Consignation), La Poste (Logistique).
- **Authentification** : JWT RS256 (Bearer Token) + rotation de Refresh Token.
- **Webhooks** : Validation HMAC-SHA256 pour tous les flux entrants Mobile Money.

## 8. Sécurité, Preuve et Conformité (Parties 21, 23)
- **Certification SHA-256** : Hash unique généré pour chaque document légal.
- **QR Code de Vérification** : Portail public universel pour l'audit d'authenticité.
- **Conformité ARTCI** : Protection des données à caractère personnel (Loi 2013-450).

---
*Document certifié par le Directoire Technique QAPRIL Technologies SA — Mars 2026.*
