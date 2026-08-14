# Politique de Confidentialité & Privacy by Design

Dernière mise à jour : Août 2024

Bienvenue sur la Politique de Confidentialité de Qapril. 
Cette plateforme a été construite selon les principes stricts du **Privacy by Design**, garantissant que la protection de vos données personnelles est intégrée nativement dans l'architecture même de notre logiciel.

## 1. Responsable du traitement

Le responsable du traitement des données est **Qapril SaaS**, représenté par son Délégué à la Protection des Données (DPO).  
Contact DPO : `dpo@qapril.com`

## 2. L'approche Privacy by Design chez Qapril

Nous ne considérons pas la protection des données comme une option, mais comme un prérequis technique. Voici comment cela se traduit :

- **Privacy by Default** : Tous les réglages de confidentialité sont configurés au niveau maximum par défaut. Aucun traceur marketing n'est activé sans votre action explicite.
- **Minimisation des données** : Nous ne collectons et n'affichons que les données strictement nécessaires à l'accomplissement d'une tâche.
- **Sécurité de bout en bout** : Les données ultra-sensibles (pièces d'identité, mots de passe) sont chiffrées en base de données avec des algorithmes robustes (AES-256-GCM, Bcrypt).
- **Transparence** : Ce document est généré de façon semi-automatique en lien avec notre code source (via notre registre interne de classification), garantissant qu'aucune donnée secrète n'est collectée à votre insu.

## 3. Données collectées, Finalités et Bases légales

### A. Données d'identité (Nom, Prénom, Date de naissance)
- **Finalité** : Création du compte, établissement des contrats de bail.
- **Base légale** : Exécution du contrat.
- **Durée de conservation** : 3 ans après la fin de la relation commerciale.

### B. Coordonnées (Email, Téléphone)
- **Finalité** : Connexion, envois de quittances, OTP de sécurité.
- **Base légale** : Exécution du contrat & Intérêt légitime (Sécurité).
- **Durée de conservation** : 3 ans.

### C. Documents d'identité & KYC (Pièces d'identité, MRZ)
- **Finalité** : Lutte contre la fraude, vérification légale des locataires/propriétaires.
- **Base légale** : Obligation légale.
- **Durée de conservation** : 1 an après vérification.
- **Sécurité** : Ces données sont classées "RESTRICTED", chiffrées en base de données et masquées dans les journaux d'audit.

### D. Données Financières (Salaires, Paiements)
- **Finalité** : Paiement des loyers, scoring de solvabilité.
- **Base légale** : Exécution du contrat (loyer) et Obligation légale (comptabilité).
- **Durée de conservation** : 5 ans (obligation fiscale).

## 4. Exercice de vos droits (RGPD & Loi ivoirienne)

Vous disposez des droits suivants concernant vos données, exerçables directement depuis l'application dans votre **Centre de Confidentialité** (`/dashboard/privacy`) :

- **Droit d'accès et de portabilité** : Vous pouvez générer un export complet (JSON) de toutes vos données personnelles.
- **Droit à l'effacement (Droit à l'oubli)** : Vous pouvez demander l'anonymisation irréversible de votre compte. Vos nom, email et téléphone seront remplacés par des valeurs nulles. Les factures et données comptables seront conservées anonymement pour respecter la loi fiscale.
- **Droit de rectification** : Modifiable depuis votre profil.
- **Droit au retrait du consentement** : Vous pouvez activer/désactiver les traceurs analytiques ou marketing à tout moment en un clic.

## 5. Transfert et Hébergement des Données

Vos données sont hébergées dans des centres de données hautement sécurisés. Conformément aux réglementations, Qapril garantit que les données ne sont pas transférées hors des juridictions autorisées sans les garanties contractuelles appropriées (Clauses Contractuelles Types).

## 6. Journalisation et Audit (Traçabilité)

Afin de protéger vos données contre les accès non autorisés, toute action sensible effectuée sur votre compte (connexion, accès à un document d'identité, paiement) est journalisée et scellée cryptographiquement (Proof Hash). Les accès massifs aux profils (scraping) sont bloqués automatiquement par nos pare-feux applicatifs.
