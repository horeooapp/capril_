# QAPRIL - Quittancement Autonome et Plateforme des Ressources Immobilières Locatives

## RÉFÉRENTIEL DES RÈGLES DE GESTION
**Version finale consolidée — Toutes règles métier, tous modules**

- **Référence** : QAPRIL/REG/2026-001
- **Version** : 1.0 finale — Mars 2026
- **Auteur** : Soumahoro Frédéric — Fondateur QAPRIL Technologies SA
- **Périmètre** : Locataire · Propriétaire · Agence · Intermédiaire · Diaspora
- **Statut** : VALIDÉ — Document de référence contractuel

Ce document recense l'intégralité des règles métier de QAPRIL. Il fait référence pour toute implémentation, toute déviation doit être approuvée par le Fondateur.
 
---

## 1. Acteurs et profils utilisateurs
QAPRIL reconnaît 5 types d'acteurs distincts. Chaque acteur dispose d'une interface dédiée et de droits strictement délimités.

| Acteur | Description | Interface |
|---|---|---|
| **Locataire** | Occupant d'un bien QAPRIL. Accès à ses quittances, droits, paiements. | `qapril-locataire-v2.jsx` |
| **Propriétaire** | Bailleur individuel. Gère son patrimoine immobilier. | `qapril-proprio-v4.jsx` |
| **Agence agréée** | Agence professionnelle mandatée. Substitution totale exclusive côté locataire. | `qapril-agence-responsive.jsx` |
| **Intermédiaire** | Gestionnaire individuel mandaté par un ou plusieurs propriétaires. | `qapril-intermediaire.jsx` |
| **Diaspora** | Propriétaire absentéiste résidant à l'étranger. Interface double devise. | `qapril-diaspora.jsx` |

---

## 2. Règle MM-04b — Visibilité du bailleur côté locataire
**RÈGLE CRITIQUE — MM-04b**
C'est la règle la plus critique du système. Elle détermine ce que le locataire voit concernant son propriétaire. Toute déviation est une anomalie bloquante.

### 2.1 Logique d'affichage
| Cas | Type de gestion | bailleurMasque | Ce que voit le locataire |
|---|---|---|---|
| 1 | AGENCE AGRÉÉE | N/A | Code opaque (BAI-042) + Nom agence — JAMAIS le nom du propriétaire — SANS EXCEPTION — pas de choix possible |
| 2 | Agence NON agréée | `true` → masqué | Code opaque (BAI-042) — le propriétaire a choisi de masquer son identité |
| 3 | Agence NON agréée | `false` → visible | Nom réel du propriétaire — le propriétaire a choisi de rendre son identité visible |
| 4 | Gestion DIRECTE | `true` → masqué | Code opaque (BAI-042) — le propriétaire a choisi de masquer son identité |
| 5 | Gestion DIRECTE | `false` → visible | Nom réel du propriétaire — gestion directe, identité visible |

### 2.2 Règle côté agence — masquage collaborateurs
- Le chef d'agence peut masquer le nom du propriétaire **PAR BIEN**.
- Les collaborateurs de l'agence voient le code opaque `BAI-XXX`.
- Le chef d'agence voit toujours le nom réel.
- L'agence agréée bénéficie de la *substitution totale exclusive* : elle est l'unique interlocuteur du locataire.

### 2.3 Champs API concernés
- `typeGestion` : `"agreee" | "non_agreee" | "directe"`
- `bailleurMasque` : `boolean` — pertinent uniquement si `typeGestion ≠ "agreee"`
- `bailleurNom` : `string` — nom réel — **NE JAMAIS** afficher si masqué
- `bailleurCode` : `string` — code opaque ex: `"BAI-042"` — affiché si masqué

---

## 3. Score ICL — Indice de Confiance Locataire
### 3.1 Règles de calcul
| Événement | Impact score | Résultat exemple |
|---|---|---|
| Inscription QAPRIL — tout nouveau locataire | Score de départ : 750 | 750 pts garanti |
| KYC complet (CNI + photo + justificatif domicile + OTP téléphone) | +50 pts → 800 | 750 + 50 = 800 |
| Loyer payé à temps | +2 pts / mois | 800 + 2 + 2 = 804… |
| Retard de paiement (quel que soit le nombre de jours) | −10 pts | 804 − 10 = 794 |
| Ticket RCL non traité par le bailleur à 144h | −2 pts BAILLEUR uniquement — 0 pt locataire | Score locataire inchangé |
| Ticket RCL non traité par agence ou intermédiaire | −2 pts agence/intermédiaire | Score locataire inchangé |
| 24 mois consécutifs sans retard (bonus fidélité) | +20 pts bonus | Bonus unique, non cumulable |

### 3.2 Règle ICL-CONSENT-01 — Partage du score
**ICL-CONSENT-01**
Le locataire est **SEUL** propriétaire de son score ICL. Il peut le consulter librement dans son propre espace. Pour le partager à un tiers (bailleur, banque, agence, employeur), il doit donner une autorisation **EXPLICITE**. Chaque consultation par un tiers est journalisée en base.

| Acteur | Accès au score ICL |
|---|---|
| Locataire lui-même | ✓ Visible librement — historique + détail des critères |
| Agence — module M-CAND | Masqué par défaut (🔒) — visible uniquement si autorisation accordée par le candidat |
| Propriétaire / Bailleur | Masqué par défaut — visible uniquement si autorisation accordée par le locataire |
| Banque / Employeur | Visible uniquement via lien partageable généré par le locataire — valide 30 jours |

### 3.3 Étapes KYC et points associés
| Étape KYC | Points |
|---|---|
| Compte créé (inscription) | Score de base : **750** |
| CNI ivoirienne renseignée | +20 pts |
| Photo d'identité uploadée | +15 pts |
| Justificatif de domicile | +10 pts |
| Téléphone vérifié OTP | +5 pts → **Total KYC : +50 pts → 800** |

---

## 4. Tickets RCL — Réclamations locataires
### 4.1 Règle de clôture automatique
**RÈGLE DÉLAI 144H — CLÔTURE AUTOMATIQUE**
Le bailleur (ou gestionnaire) dispose de **144 heures (6 jours calendaires)** pour répondre à tout ticket RCL. Sans réponse à 144h : ticket fermé **AUTOMATIQUEMENT** en faveur du locataire. Sanction : **−2 points du score QAPRIL du bailleur/gestionnaire**. Cette règle s'applique à TOUS les types RCL sans exception.

### 4.2 Types de réclamations
| Code | Libellé | Description | Délai |
|---|---|---|---|
| **RCL-01** | Quittance incorrecte | Montant, période ou nom erroné | 144h |
| **RCL-02** | Paiement sans quittance | Preuve Mobile Money + aucune quittance émise | 144h |
| **RCL-03** | Charges non contractuelles | Facturation d'un montant hors bail enregistré | 144h |
| **RCL-04** | Harcèlement ou pression | Tentative d'expulsion informelle ou pressions | 144h + CACI si besoin |
| **RCL-05** | Demande de travaux | Réparation urgente · entretien · mise en conformité. | 144h |

### 4.3 Types de travaux (RCL-05)
- **Types disponibles** : Fuite d'eau/Plomberie, Électricité défectueuse, Peinture/Humidité/Moisissures, Menuiserie (portes, fenêtres), Climatisation/Ventilation, Nuisibles/Désinsectisation, Autre.
- **Case Urgence** : Case à cocher obligatoire si risque sécurité (fuite active, électricité dangereuse, insalubrité grave) → traitement prioritaire.

### 4.4 Flux complet d'un ticket RCL
1. Le locataire choisit le type (RCL-01 à RCL-05) et décrit la situation.
2. Pour RCL-05 : sélection du type de travaux (obligatoire) + case Urgence.
3. Ticket créé — numéro `TKT-XXX` généré.
4. Bailleur/gestionnaire notifié : SMS + WhatsApp + Dashboard QAPRIL.
5. Countdown 144h visible dans l'interface locataire (onglet Mes droits).
6. **a)** Bailleur répond dans les 144h → action corrective → ticket résolu → notif SMS + WhatsApp locataire.
   **b)** Bailleur silencieux à 144h → ticket fermé auto en faveur du locataire → −2 pts score bailleur → SMS+WA.
7. Ticket archivé dans l'historique avec timeline complète horodatée.

---

## 5. Règle MRL-01 — Modification de loyer
**MRL-01 — CONSENTEMENT LOCATAIRE OBLIGATOIRE**
Toute modification de loyer requiert le consentement **EXPLICITE** du locataire. La modification n'est **JAMAIS** effective sans réponse positive du locataire. Sans réponse à **J+5**, la modification est automatiquement **SUSPENDUE**.
(L'intermédiaire et l'agence NE PEUVENT PAS modifier le loyer).

---

## 6. Règle M07 — Gestion des impayés
**M07 — ZÉRO RÉSILIATION AUTOMATIQUE**
QAPRIL ne résilie **JAMAIS** automatiquement un bail. La résiliation requiert un accord amiable ou une décision de justice.

### 6.1 Phase 5 — Clémence M07
| Option | Description | Durée |
|---|---|---|
| Délai de paiement | Accorder entre 7 et 30 j supp. Aucune pénalité si respecté. | 7 à 30 jours |
| Échéancier | Diviser le montant dû en 2 à 4 versements. | 2 à 4 versements |
| Médiation CACI | Orienter vers la Chambre Arbitrale de Côte d'Ivoire. | Selon CACI |

---

## 7. Mobile Money — Paiement des loyers
- **Opérateurs supportés** : Orange Money 🟠, Wave 🔵, MTN MoMo 🟡, Moov Money 🟢
- **Sécurité webhook** : Chaque notification est vérifiée par signature **HMAC-SHA256**. L'argent est envoyé sur le numéro direct du bailleur. Un paiement non signé ou mal signé est rejeté. `Secret: HMAC_SECRET`.

## 8. Certification SHA-256 et quittances
- Toute quittance émise par QAPRIL doit être certifiée SHA-256.
- Formule : `hash = SHA256(ref | mois | montant | bienId | emetteurId | timestamp)`
- **Interdiction** : Le locataire ne peut pas émettre ses propres quittances.

---

## 9. Notifications — Règles de canal
**RÈGLE NOTIFICATION** : Toute notification QAPRIL doit utiliser SIMULTANÉMENT **SMS + WhatsApp**. Un SMS seul n'est pas conforme.

### 9.2 Règles spécifiques Diaspora
- Notifications Diaspora : **WhatsApp + Email**.
- Fuseaux horaires supportés (convertis) : `Europe/Paris`, `Europe/London`, `America/Montreal`, `America/New_York`, `Africa/Abidjan`.

---

## 10. Intermédiaire de gestion — Droits RBAC
- L'intermédiaire ne peut faire des actions **que sur ses mandats actifs**.
- Ce qu'il ne peut **PAS** faire : Modifier un loyer (MRL-01), Résilier un bail, Configurer un Mobile Money, Consigner une caution CDC.

## 11. Module Diaspora — Règles spécifiques
- **Taux de change fixe** : `1 EUR = 655,957 FCFA`. Invariable (traité international).
- **Abonnement** : 7 EUR / mois payé par CB internationale (`CinetPay CREDIT_CARD`).

## 12. Modèle tarifaire
Ex: Bail complet de Cour Entière = 10 000 FCFA TTC, Quittance déclarative = 200 FCFA TTC.

---

*(Les sections techniques et de sécurisation API sont calquées sur NestJS/NextJS. Fin du référentiel QAPRIL/REG/2026-001).*
