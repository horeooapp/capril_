# Registre des Activités de Traitement (DPO)

**Application** : Qapril SaaS  
**Version du Registre** : 1.0  
**Généré le** : Août 2024  
**Responsable** : DPO Qapril

Conformément à l'Article 30 du RGPD, ce document recense les traitements de données à caractère personnel opérés par la plateforme.
L'architecture de l'application applique la norme **Privacy by Design**, les règles de conservation et de minimisation étant hardcodées dans le code (`src/lib/data-retention.ts` et `src/lib/data-minimization.ts`).

---

## 1. Gestion des Utilisateurs et Authentification
- **Finalité** : Permettre aux locataires, propriétaires et agents de se connecter et d'utiliser la plateforme.
- **Données traitées** : Nom, prénom, email, téléphone, mot de passe (haché Bcrypt), adresse IP, User-Agent, Date de naissance.
- **Personnes concernées** : Tous les utilisateurs inscrits.
- **Base légale** : Contrat (CGU).
- **Rétention** : 3 ans après inactivité. Les tokens de session expirent après 30 jours, les OTP après 24h.
- **Mesures de sécurité** : Mots de passe hachés, logs d'authentification masqués (pas de PII en clair).

## 2. Procédure KYC & Vérification d'Identité
- **Finalité** : Vérifier l'identité des utilisateurs pour lutter contre la fraude et sécuriser les baux.
- **Données traitées** : Scans de pièces d'identité (S3), Numéro de pièce, données MRZ extraites, nationalité.
- **Catégorie de données** : Données restreintes (RESTRICTED).
- **Base légale** : Obligation légale (Lutte anti-blanchiment / anti-fraude).
- **Rétention** : 1 an maximum après la vérification ou la fin du contrat.
- **Mesures de sécurité** : Chiffrement AES-256-GCM en base de données pour les champs sensibles (`docNumber`, `mrzRawData`). Accès limité aux rôles ADMIN et AGENT via le module de minimisation OWASP API3.

## 3. Gestion des Baux et Encaissements
- **Finalité** : Signer les contrats de location et tracer les paiements.
- **Données traitées** : Historique des paiements, revenus, situation professionnelle, adresse du bien.
- **Personnes concernées** : Locataires et Propriétaires.
- **Base légale** : Exécution du contrat et Obligation légale (comptabilité).
- **Rétention** : 5 ans (prescription fiscale et commerciale).
- **Mesures de sécurité** : Les journaux d'audit financiers (module PAYMENT) sont conservés 5 ans de manière scellée cryptographiquement (ProofHash).

## 4. Traçabilité, Audit et Sécurité
- **Finalité** : Détecter les accès illégitimes, tracer les actions sensibles et garantir l'intégrité du système.
- **Données traitées** : IP, User-Agent, identifiant de l'action, données modifiées (les PII sensibles sont masqués par `***MASKED***`).
- **Base légale** : Intérêt légitime (sécurité de la plateforme).
- **Rétention** : 1 an.
- **Mesures de sécurité** : Purge automatique quotidienne via Cron (`purgeExpiredAuditLogs()`). Hachage des événements pour empêcher la falsification.

## 5. Exports Analytiques et Statistiques (BI)
- **Finalité** : Améliorer le service, établir des statistiques globales d'occupation et de revenus.
- **Données traitées** : Données des utilisateurs et des paiements.
- **Base légale** : Intérêt légitime.
- **Mesures de sécurité** : Application d'un module de **Pseudonymisation** (`pseudonymization.ts`). Les identifiants (email, tel) sont remplacés par des tokens irréversibles pour les outils d'analyse (sortent du scope RGPD).

---

## 6. Exercice des Droits (Statistiques)

L'application intègre un module automatisé d'exercice des droits.
- **Droit à l'oubli** : Anonymisation des champs PII exécutable instantanément par l'utilisateur. Le DPO est notifié.
- **Droit à la portabilité** : L'API `/api/user/[id]/data-export` permet la génération d'un JSON sécurisé (signé) limité à 5 exports/jour par utilisateur pour prévenir les abus.

## Validation DPO

**L'architecture logicielle valide la conformité aux exigences Privacy by Design.**  
Les logs d'anonymisation et les consentements explicites garantissent la capacité de prouver la conformité (Principe d'Accountability - Art. 5.2 RGPD) à tout moment.
