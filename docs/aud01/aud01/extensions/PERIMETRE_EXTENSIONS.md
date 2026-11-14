# Périmètre « extensions » — à sortir du noyau QAPRIL (décision de direction)

Ces modèles ne figurent ni dans le CDC ni dans les ADD-13 à ADD-29. Ils changent la
qualification juridique de la plateforme (détention de fonds, placement, intermédiation
d'assurance, courtage de données). Tant que la direction n'a pas statué, ils sont :

1. déplacés dans un schéma Prisma séparé (`prisma/extensions.prisma`, datasource
   `qapril_ext` ou `schemas = ["ext"]` avec `previewFeatures = ["multiSchema"]`) ;
2. non exposés par l'API en production (feature flag `EXT_*` = false) ;
3. exclus du périmètre d'audit du 2 décembre.

| Modèle(s) | Nature | Risque |
|---|---|---|
| `UserWalletConfig.walletBalance`, `WalletTransaction`, `WalletRechargeLink`, `WalletRechargeConfig` | Portefeuille à solde (« tirelire ») | Détention de fonds → agrément établissement de paiement (BCEAO) ; contredit ADD-13 |
| `VaultCaution`, `FloatPool` (`tauxRendement`, `partenaireBanque`, `soldeTotal`), `FloatMovement` | Placement des dépôts de garantie | Captation de rendement sur des fonds de tiers ; conflit avec `CautionBail` + consignation CDC-CI déjà modélisée |
| `Lead`, `LeadTransaction` (`prixLead`, `acheteurId`) | Vente de prospects | Loi 2013-450 : finalité non consentie |
| `InsuranceProduct`, `InsuranceSouscription` (`commissionPlateforme`) | Intermédiation d'assurance | Agrément CIMA / courtier |
| `DataLicenseContract`, `DataProcessingActivity` (volet licence) | Licence de données | Position juridique à établir avant toute table |
| `UserDiasporaProfile` (Stripe, tiers), `Syndicate` (`iban`), `ChampionProfile`, `CommissionTransaction` | Extensions commerciales | Non prioritaires ; alourdissent migrations et audit |
| Modèles vente ADD-25 (`MandatVente`, etc.) | Vente immobilière | Légitime mais hors périmètre location du 1er décembre |
| `AutomationSettings.customScripts` | Exécution de code stocké | **À supprimer** (M-13), pas à déplacer |

## Ce qui reste dans le noyau
`User`, `LegalEntity`, `IdentityDocument`, `Property*`, `Lease*`, `Receipt`, `PaymentIntent`,
`PaymentPgw`, `PgwWebhook`, `Reversal`, `Mandate`/`MandatGestion*`, `Annonce`, `Candidature`,
`LocataireProfile*`, `PasseportLocatif`, `Signalement*`, `CautionBail`, `PreavisBail`,
`TicketMaintenance`, `EtatsDesLieux`, `SignatureElectronique`, `MessagerieBail`, `RapportMensuel`,
`CrgMensuel`, tout ADD-26 (`Cnv*`, `DeclarationPaiement`, `CodeBailCourt`, `ModeleMessageCnv`),
tout ADD-28 (`CapturePosition`, `ModificationPosition`, `*MaPoste`, `TransmissionAdressage`),
tout ADD-29 (`Occupant`, `AttestationResidence`, `VerificationAttestation`), ADD-27 (vocal),
`Account`, `FeatureFlag`, `Privacy*`.
