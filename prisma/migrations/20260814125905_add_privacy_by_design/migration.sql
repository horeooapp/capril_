/*
  Warnings:

  - The values [USAGE_DÉCLARÉ] on the enum `RepartitionModel` will be removed. If these variants are still used in the database, this will fail.
  - The values [CHAMPION] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - The values [PARTAGÉ_PROPRIO] on the enum `UtilityMode` will be removed. If these variants are still used in the database, this will fail.
  - The values [PAYÉE] on the enum `UtilityStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `recepissse_cdaim` on the `agences_regularisation` table. All the data in the column will be lost.
  - You are about to drop the column `recepissse_date` on the `agences_regularisation` table. All the data in the column will be lost.
  - The `statut` column on the `agences_regularisation` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `statut` column on the `bdq_conversation_states` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `destination` column on the `cautions_bail` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `initiator` column on the `cdc_deposits` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `disputes` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `statut` column on the `fiscal_dossiers` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `inspection_rooms` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `inspections` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `insurance_claims` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `statut` column on the `invitations_bail` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `periodicite_loyer` column on the `land_lease_info` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `alerte30j` on the `leases` table. All the data in the column will be lost.
  - You are about to drop the column `alerte60j` on the `leases` table. All the data in the column will be lost.
  - You are about to drop the column `alerte90j` on the `leases` table. All the data in the column will be lost.
  - You are about to drop the column `draftData` on the `leases` table. All the data in the column will be lost.
  - You are about to drop the column `droitsDgiCalcules` on the `leases` table. All the data in the column will be lost.
  - You are about to drop the column `fraisQapril` on the `leases` table. All the data in the column will be lost.
  - You are about to drop the column `loiApplicable` on the `leases` table. All the data in the column will be lost.
  - You are about to drop the column `mandate_id` on the `leases` table. All the data in the column will be lost.
  - You are about to drop the column `qrCodeUrl` on the `leases` table. All the data in the column will be lost.
  - You are about to drop the column `seuilJ15` on the `leases` table. All the data in the column will be lost.
  - You are about to drop the column `seuilJ3` on the `leases` table. All the data in the column will be lost.
  - You are about to drop the column `seuilJ7` on the `leases` table. All the data in the column will be lost.
  - You are about to drop the column `sha256CalculeLe` on the `leases` table. All the data in the column will be lost.
  - You are about to drop the column `sha256Hash` on the `leases` table. All the data in the column will be lost.
  - You are about to drop the column `statutDraft` on the `leases` table. All the data in the column will be lost.
  - You are about to drop the column `versionDraft` on the `leases` table. All the data in the column will be lost.
  - The `mode_utilities` column on the `leases` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `modele_repartition` column on the `leases` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `visibilite` column on the `locataire_profils_publics` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `biens_concernes` on the `mandats_gestion` table. All the data in the column will be lost.
  - The `status` column on the `mediations` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `statut` column on the `notification_logs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `reversal_status` column on the `payments_pgw` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `statut` column on the `preavis_bails` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `prepayment_requests` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `area_sqm` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `arcCertificationId` on the `receipts` table. All the data in the column will be lost.
  - You are about to drop the column `arcDemande` on the `receipts` table. All the data in the column will be lost.
  - You are about to drop the column `arcHorodatage` on the `receipts` table. All the data in the column will be lost.
  - You are about to drop the column `commentaireInterne` on the `receipts` table. All the data in the column will be lost.
  - You are about to drop the column `dateEncaissement` on the `receipts` table. All the data in the column will be lost.
  - You are about to drop the column `flagWebhookNonRecu` on the `receipts` table. All the data in the column will be lost.
  - You are about to drop the column `moisConcerne` on the `receipts` table. All the data in the column will be lost.
  - You are about to drop the column `preuveUrl` on the `receipts` table. All the data in the column will be lost.
  - You are about to drop the column `qrCodeUrl` on the `receipts` table. All the data in the column will be lost.
  - You are about to drop the column `sha256CalculeLe` on the `receipts` table. All the data in the column will be lost.
  - You are about to drop the column `sha256Hash` on the `receipts` table. All the data in the column will be lost.
  - The `status` column on the `reversal_transactions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `statut` column on the `signalements_locataire` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `statut` column on the `sms_declarations` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `statut` column on the `tickets_maintenance` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `active_plan_tier` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `champions_commissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `champions_profiles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `champions_prospects` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `type_utility` on the `factures_utilities` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `usage_declare` on the `land_lease_info` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `updated_at` to the `notifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `prestataires` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `reminder_logs` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `categorie` on the `signalements_locataire` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `type` on the `tarifs_negocie` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `categorie_v2` on the `tickets_maintenance` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `declencheur` on the `wallet_recharge_links` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "InspectionStatus" AS ENUM ('PLANIFIEE', 'EN_COURS', 'TERMINEE', 'ANNULEE');

-- CreateEnum
CREATE TYPE "OperateurDossierStatus" AS ENUM ('BROUILLON', 'DOSSIER_GENERE', 'SOUMIS_API', 'EN_ATTENTE_VALIDATION', 'ACTIF', 'REJETE');

-- CreateEnum
CREATE TYPE "OperateurNiveau" AS ENUM ('N1', 'N2', 'N3');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'INACTIVE', 'BANNED', 'PENDING_PROFILE', 'PENDING', 'INVITED');

-- CreateEnum
CREATE TYPE "VaultStatus" AS ENUM ('A_TRANSFERER', 'CONSIGNEE', 'TERMINE', 'RESTITUEE');

-- AlterEnum
BEGIN;
CREATE TYPE "RepartitionModel_new" AS ENUM ('PRORATA_CHAMBRE', 'FORFAIT_FIXE', 'USAGE_DECLARE');
ALTER TABLE "leases" ALTER COLUMN "modele_repartition" DROP DEFAULT;
ALTER TABLE "leases" ALTER COLUMN "modele_repartition" TYPE "RepartitionModel_new" USING ("modele_repartition"::text::"RepartitionModel_new");
ALTER TYPE "RepartitionModel" RENAME TO "RepartitionModel_old";
ALTER TYPE "RepartitionModel_new" RENAME TO "RepartitionModel";
DROP TYPE "RepartitionModel_old";
ALTER TABLE "leases" ALTER COLUMN "modele_repartition" SET DEFAULT 'PRORATA_CHAMBRE';
COMMIT;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ReversalStatus" ADD VALUE 'NONE';
ALTER TYPE "ReversalStatus" ADD VALUE 'SUCCESS';

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'ANAH_AGENT', 'CDC_AGENT', 'LANDLORD', 'LANDLORD_PRO', 'AGENCY', 'TENANT', 'NON_CERTIFIED_AGENT');
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TABLE "bien_acces" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'TENANT';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "UtilityMode_new" AS ENUM ('INDIVIDUEL_LOCATAIRE', 'PARTAGE_PROPRIO', 'INDIVIDUEL_PROPRIO', 'MIXTE', 'NON_APPLICABLE');
ALTER TABLE "leases" ALTER COLUMN "mode_utilities" DROP DEFAULT;
ALTER TABLE "leases" ALTER COLUMN "mode_utilities" TYPE "UtilityMode_new" USING ("mode_utilities"::text::"UtilityMode_new");
ALTER TYPE "UtilityMode" RENAME TO "UtilityMode_old";
ALTER TYPE "UtilityMode_new" RENAME TO "UtilityMode";
DROP TYPE "UtilityMode_old";
ALTER TABLE "leases" ALTER COLUMN "mode_utilities" SET DEFAULT 'NON_APPLICABLE';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "UtilityStatus_new" AS ENUM ('EN_COURS', 'PAYEE', 'EN_RETARD', 'PARTIELLE', 'EN_ATTENTE');
ALTER TABLE "factures_utilities" ALTER COLUMN "statut" DROP DEFAULT;
ALTER TABLE "factures_utilities" ALTER COLUMN "statut" TYPE "UtilityStatus_new" USING ("statut"::text::"UtilityStatus_new");
ALTER TYPE "UtilityStatus" RENAME TO "UtilityStatus_old";
ALTER TYPE "UtilityStatus_new" RENAME TO "UtilityStatus";
DROP TYPE "UtilityStatus_old";
ALTER TABLE "factures_utilities" ALTER COLUMN "statut" SET DEFAULT 'EN_COURS';
COMMIT;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "UtilityType" ADD VALUE 'ORANGE';
ALTER TYPE "UtilityType" ADD VALUE 'MTN';
ALTER TYPE "UtilityType" ADD VALUE 'MOOV';
ALTER TYPE "UtilityType" ADD VALUE 'CANAL_PLUS';

-- DropForeignKey
ALTER TABLE "champions_commissions" DROP CONSTRAINT "champions_commissions_champion_id_fkey";

-- DropForeignKey
ALTER TABLE "champions_profiles" DROP CONSTRAINT "champions_profiles_superviseur_id_fkey";

-- DropForeignKey
ALTER TABLE "champions_profiles" DROP CONSTRAINT "champions_profiles_user_id_fkey";

-- DropForeignKey
ALTER TABLE "champions_prospects" DROP CONSTRAINT "champions_prospects_champion_id_fkey";

-- DropForeignKey
ALTER TABLE "champions_prospects" DROP CONSTRAINT "champions_prospects_user_id_inscrit_fkey";

-- DropForeignKey
ALTER TABLE "leases" DROP CONSTRAINT "leases_mandate_id_fkey";

-- DropIndex
DROP INDEX "leases_status_idx";

-- AlterTable
ALTER TABLE "agences_regularisation" DROP COLUMN "recepissse_cdaim",
DROP COLUMN "recepissse_date",
ADD COLUMN     "recepisse_cdaim" TEXT,
ADD COLUMN     "recepisse_date" TIMESTAMP(3),
DROP COLUMN "statut",
ADD COLUMN     "statut" "RegStatut" NOT NULL DEFAULT 'EN_COURS';

-- AlterTable
ALTER TABLE "bails_declaratifs" ALTER COLUMN "hash_declaration" DROP NOT NULL;

-- AlterTable
ALTER TABLE "bdq_conversation_states" DROP COLUMN "statut",
ADD COLUMN     "statut" "BdqConvStatut" NOT NULL DEFAULT 'EN_COURS';

-- AlterTable
ALTER TABLE "cautions_bail" DROP COLUMN "destination",
ADD COLUMN     "destination" "CautionDestEnum" NOT NULL DEFAULT 'PROPRIETAIRE';

-- AlterTable
ALTER TABLE "cdc_deposits" ADD COLUMN     "float_entree_at" TIMESTAMP(3),
ADD COLUMN     "float_sortie_at" TIMESTAMP(3),
ADD COLUMN     "jours_consignes" INTEGER,
ADD COLUMN     "rendement_genere" DOUBLE PRECISION,
DROP COLUMN "initiator",
ADD COLUMN     "initiator" "CDCDepositInitiator" NOT NULL DEFAULT 'OWNER';

-- AlterTable
ALTER TABLE "disputes" ADD COLUMN     "hash_caci" TEXT,
ADD COLUMN     "is_crypto_sealed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "months_defeated" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "severity" TEXT NOT NULL DEFAULT 'NORMALE',
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'AUTRE',
DROP COLUMN "status",
ADD COLUMN     "status" "DisputeStatus" NOT NULL DEFAULT 'OPEN';

-- AlterTable
ALTER TABLE "factures_utilities" DROP COLUMN "type_utility",
ADD COLUMN     "type_utility" "UtilityType" NOT NULL,
ALTER COLUMN "mois_facture" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "fiscal_dossiers" DROP COLUMN "statut",
ADD COLUMN     "statut" "FiscalStatus" NOT NULL DEFAULT 'EN_ATTENTE_DECLARATION';

-- AlterTable
ALTER TABLE "inspection_rooms" DROP COLUMN "status",
ADD COLUMN     "status" "RoomStatus" NOT NULL DEFAULT 'GOOD';

-- AlterTable
ALTER TABLE "inspections" DROP COLUMN "status",
ADD COLUMN     "status" "InspectionStatus" NOT NULL DEFAULT 'PLANIFIEE';

-- AlterTable
ALTER TABLE "insurance_claims" ADD COLUMN     "insurance_souscription_id" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "InsuranceClaimStatus" NOT NULL DEFAULT 'OPEN';

-- AlterTable
ALTER TABLE "invitations_bail" DROP COLUMN "statut",
ADD COLUMN     "statut" "InvitStatutEnum" NOT NULL DEFAULT 'ENVOYEE',
ALTER COLUMN "expire_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "land_lease_info" DROP COLUMN "usage_declare",
ADD COLUMN     "usage_declare" "TerrainUsage" NOT NULL,
DROP COLUMN "periodicite_loyer",
ADD COLUMN     "periodicite_loyer" "Periodicite" NOT NULL DEFAULT 'MENSUEL';

-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "acheteur_at" TIMESTAMP(3),
ADD COLUMN     "acheteur_id" TEXT,
ADD COLUMN     "budget_declare" DOUBLE PRECISION,
ADD COLUMN     "commune_cible" TEXT,
ADD COLUMN     "prix_lead" DOUBLE PRECISION,
ADD COLUMN     "score_qualite" INTEGER DEFAULT 0,
ADD COLUMN     "type_bien_recherche" TEXT;

-- AlterTable
ALTER TABLE "leases" DROP COLUMN "alerte30j",
DROP COLUMN "alerte60j",
DROP COLUMN "alerte90j",
DROP COLUMN "draftData",
DROP COLUMN "droitsDgiCalcules",
DROP COLUMN "fraisQapril",
DROP COLUMN "loiApplicable",
DROP COLUMN "mandate_id",
DROP COLUMN "qrCodeUrl",
DROP COLUMN "seuilJ15",
DROP COLUMN "seuilJ3",
DROP COLUMN "seuilJ7",
DROP COLUMN "sha256CalculeLe",
DROP COLUMN "sha256Hash",
DROP COLUMN "statutDraft",
DROP COLUMN "versionDraft",
ADD COLUMN     "alerte_30j" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "alerte_60j" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "alerte_90j" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "dgi_droits_calcules" INTEGER,
ADD COLUMN     "dgi_reference" TEXT,
ADD COLUMN     "draft_data" JSONB,
ADD COLUMN     "droits_dgi_calcules" DOUBLE PRECISION,
ADD COLUMN     "frais_enreg_montant" INTEGER,
ADD COLUMN     "frais_enreg_palier" INTEGER,
ADD COLUMN     "frais_qapril" DOUBLE PRECISION,
ADD COLUMN     "loi_applicable" TEXT NOT NULL DEFAULT 'Loi n°2019-576 du 26 juin 2019',
ADD COLUMN     "mandat_gestion_id" TEXT,
ADD COLUMN     "niveau_certification" TEXT NOT NULL DEFAULT 'CERTIFIE_QAPRIL',
ADD COLUMN     "origine_bail" TEXT NOT NULL DEFAULT 'GENERE',
ADD COLUMN     "qr_code_url" TEXT,
ADD COLUMN     "scan_fichier_sha256" TEXT,
ADD COLUMN     "seuil_j15" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "seuil_j3" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "seuil_j7" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "sha256_calcule_le" TIMESTAMP(3),
ADD COLUMN     "sha256_hash" TEXT,
ADD COLUMN     "statut_dgi" TEXT NOT NULL DEFAULT 'NON_SOUMIS',
ADD COLUMN     "statut_draft" TEXT NOT NULL DEFAULT 'ACTIF',
ADD COLUMN     "version_draft" INTEGER NOT NULL DEFAULT 1,
DROP COLUMN "mode_utilities",
ADD COLUMN     "mode_utilities" "UtilityMode" NOT NULL DEFAULT 'NON_APPLICABLE',
DROP COLUMN "modele_repartition",
ADD COLUMN     "modele_repartition" "RepartitionModel" NOT NULL DEFAULT 'PRORATA_CHAMBRE';

-- AlterTable
ALTER TABLE "locataire_profils_publics" DROP COLUMN "visibilite",
ADD COLUMN     "visibilite" "VisibEnum" NOT NULL DEFAULT 'INVISIBLE';

-- AlterTable
ALTER TABLE "mandats_gestion" DROP COLUMN "biens_concernes";

-- AlterTable
ALTER TABLE "mediations" DROP COLUMN "status",
ADD COLUMN     "status" "MediationStatus" NOT NULL DEFAULT 'OPEN';

-- AlterTable
ALTER TABLE "messagerie_bail" ALTER COLUMN "statut" SET DEFAULT 'ENVOYE';

-- AlterTable
ALTER TABLE "notification_logs" DROP COLUMN "statut",
ADD COLUMN     "statut" "NotifStatut" NOT NULL DEFAULT 'EN_ATTENTE';

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "offres_abonnements" ADD COLUMN     "is_freemium" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "payments_pgw" DROP COLUMN "reversal_status",
ADD COLUMN     "reversal_status" "ReversalStatus" NOT NULL DEFAULT 'NONE';

-- AlterTable
ALTER TABLE "preavis_bails" DROP COLUMN "statut",
ADD COLUMN     "statut" "PreavisStatutEnum" NOT NULL DEFAULT 'EMIS';

-- AlterTable
ALTER TABLE "prepayment_requests" DROP COLUMN "status",
ADD COLUMN     "status" "PrepaymentRequestStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "prestataires" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "properties" DROP COLUMN "area_sqm",
ADD COLUMN     "syndicate_id" TEXT;

-- AlterTable
ALTER TABLE "receipts" DROP COLUMN "arcCertificationId",
DROP COLUMN "arcDemande",
DROP COLUMN "arcHorodatage",
DROP COLUMN "commentaireInterne",
DROP COLUMN "dateEncaissement",
DROP COLUMN "flagWebhookNonRecu",
DROP COLUMN "moisConcerne",
DROP COLUMN "preuveUrl",
DROP COLUMN "qrCodeUrl",
DROP COLUMN "sha256CalculeLe",
DROP COLUMN "sha256Hash",
ADD COLUMN     "arc_certification_id" TEXT,
ADD COLUMN     "arc_demande" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "arc_horodatage" TIMESTAMP(3),
ADD COLUMN     "commentaire_interne" TEXT,
ADD COLUMN     "date_encaissement" TIMESTAMP(3),
ADD COLUMN     "flag_webhook_non_recu" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mois_concerne" TEXT,
ADD COLUMN     "preuve_url" TEXT,
ADD COLUMN     "qr_code_url" TEXT,
ADD COLUMN     "sha256_calcule_le" TIMESTAMP(3),
ADD COLUMN     "sha256_hash" TEXT;

-- AlterTable
ALTER TABLE "reminder_logs" DROP COLUMN "type",
ADD COLUMN     "type" "ReminderType" NOT NULL;

-- AlterTable
ALTER TABLE "reversal_transactions" DROP COLUMN "status",
ADD COLUMN     "status" "ReversalStatus" NOT NULL DEFAULT 'SUCCESS';

-- AlterTable
ALTER TABLE "signalements_locataire" DROP COLUMN "categorie",
ADD COLUMN     "categorie" "SignalCatEnum" NOT NULL,
DROP COLUMN "statut",
ADD COLUMN     "statut" "SignalStatutEnum" NOT NULL DEFAULT 'ENVOYE';

-- AlterTable
ALTER TABLE "sms_declarations" DROP COLUMN "statut",
ADD COLUMN     "statut" "DeclStatut" NOT NULL DEFAULT 'EN_ATTENTE';

-- AlterTable
ALTER TABLE "tarifs_negocie" DROP COLUMN "type",
ADD COLUMN     "type" "NegocieType" NOT NULL;

-- AlterTable
ALTER TABLE "tickets_maintenance" DROP COLUMN "categorie_v2",
ADD COLUMN     "categorie_v2" "MaintenanceCategory" NOT NULL,
DROP COLUMN "statut",
ADD COLUMN     "statut" "MaintenanceStatus" NOT NULL DEFAULT 'EN_ATTENTE';

-- AlterTable
ALTER TABLE "user_diaspora_profiles" ADD COLUMN     "abonnement_statut" TEXT DEFAULT 'INACTIF',
ADD COLUMN     "diaspora_tier" TEXT DEFAULT 'FREE',
ADD COLUMN     "montant_mensuel_eur" DOUBLE PRECISION,
ADD COLUMN     "prochain_paiement_at" TIMESTAMP(3),
ADD COLUMN     "stripe_customer_id" TEXT,
ADD COLUMN     "stripe_price_id" TEXT,
ADD COLUMN     "stripe_subscription_id" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "anonymized_at" TIMESTAMP(3),
ADD COLUMN     "beneficiaire_designation_at" TIMESTAMP(3),
ADD COLUMN     "beneficiaire_lien" TEXT,
ADD COLUMN     "beneficiaire_nom" TEXT,
ADD COLUMN     "beneficiaire_phone" TEXT,
ADD COLUMN     "consent_data_scoring_at" TIMESTAMP(3),
ADD COLUMN     "data_sharing_consent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "email_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "email_verified_at" TIMESTAMP(3),
ADD COLUMN     "freemium_since" TIMESTAMP(3),
ADD COLUMN     "is_chat_online" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "is_freemium_override" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "marketing_consent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "profile_visibility" TEXT NOT NULL DEFAULT 'PRIVATE',
DROP COLUMN "status",
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
DROP COLUMN "active_plan_tier",
ADD COLUMN     "active_plan_tier" "PlanTier" NOT NULL DEFAULT 'LOCATAIRE';

-- AlterTable
ALTER TABLE "wallet_recharge_links" DROP COLUMN "declencheur",
ADD COLUMN     "declencheur" "DeclencheurEnum" NOT NULL;

-- AlterTable
ALTER TABLE "wallet_transactions" ADD COLUMN     "motif" TEXT,
ADD COLUMN     "referenceId" TEXT;

-- DropTable
DROP TABLE "champions_commissions";

-- DropTable
DROP TABLE "champions_profiles";

-- DropTable
DROP TABLE "champions_prospects";

-- DropEnum
DROP TYPE "CommType";

-- DropEnum
DROP TYPE "ProspectStatut";

-- CreateTable
CREATE TABLE "annuaire_urgences" (
    "contact_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "location" TEXT,
    "hours" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "icon_name" TEXT DEFAULT 'Phone',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "annuaire_urgences_pkey" PRIMARY KEY ("contact_id")
);

-- CreateTable
CREATE TABLE "mandats_gestion_biens" (
    "id" TEXT NOT NULL,
    "mandat_id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,

    CONSTRAINT "mandats_gestion_biens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation_settings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "auto_relance" BOOLEAN NOT NULL DEFAULT true,
    "auto_quittance" BOOLEAN NOT NULL DEFAULT true,
    "auto_assurance" BOOLEAN NOT NULL DEFAULT false,
    "custom_scripts" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automation_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "successions" (
    "id" TEXT NOT NULL,
    "deceased_name" TEXT NOT NULL,
    "claimant_name" TEXT NOT NULL,
    "relation" TEXT NOT NULL,
    "property_info" TEXT NOT NULL,
    "notaire" TEXT,
    "status" TEXT NOT NULL DEFAULT 'EN_ATTENTE_ATTESTATION',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "successions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vault_cautions" (
    "id" TEXT NOT NULL,
    "tenant_name" TEXT NOT NULL,
    "property_info" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "hash" TEXT NOT NULL,
    "date_consignation" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "property_id" TEXT,
    "tenant_id" TEXT,
    "status" "VaultStatus" NOT NULL DEFAULT 'A_TRANSFERER',
    "float_pool_id" TEXT,
    "rendement_genere" DOUBLE PRECISION,

    CONSTRAINT "vault_cautions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "syndicates" (
    "id" TEXT NOT NULL,
    "residence_name" TEXT NOT NULL,
    "total_lots" INTEGER NOT NULL,
    "treasury_balance" INTEGER NOT NULL,
    "ag_state" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "iban" TEXT,
    "montant_par_lot" DOUBLE PRECISION NOT NULL DEFAULT 750,
    "prochain_ag_at" TIMESTAMP(3),
    "statut" TEXT NOT NULL DEFAULT 'ACTIF',
    "syndic_user_id" TEXT,

    CONSTRAINT "syndicates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_reports" (
    "id" TEXT NOT NULL,
    "owner_name" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "properties_count" INTEGER NOT NULL DEFAULT 1,
    "total_gross" INTEGER NOT NULL,
    "agency_fee" INTEGER NOT NULL,
    "tva" INTEGER NOT NULL DEFAULT 0,
    "repair_costs" INTEGER NOT NULL DEFAULT 0,
    "net_payout" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_verification_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_verification_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "abonnements_operateurs" (
    "id" TEXT NOT NULL,
    "locataire_id" TEXT NOT NULL,
    "lease_id" TEXT NOT NULL,
    "operateur" "UtilityType" NOT NULL,
    "niveau_integration" "OperateurNiveau" NOT NULL DEFAULT 'N1',
    "statut" "OperateurDossierStatus" NOT NULL DEFAULT 'BROUILLON',
    "dossier_pdf_url" TEXT,
    "cni_url" TEXT,
    "contrat_bail_url" TEXT,
    "reference_dossier" TEXT,
    "numero_abonnement" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "abonnements_operateurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commission_configs" (
    "id" TEXT NOT NULL,
    "profileType" "ProfileType" NOT NULL,
    "paymentCanal" "PaymentCanal",
    "tauxPourcent" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "montantMin" DOUBLE PRECISION DEFAULT 0,
    "montantMax" DOUBLE PRECISION,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commission_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commission_transactions" (
    "id" TEXT NOT NULL,
    "payment_pgw_id" TEXT NOT NULL,
    "lease_id" TEXT NOT NULL,
    "montant_brut" DOUBLE PRECISION NOT NULL,
    "taux_applique" DOUBLE PRECISION NOT NULL,
    "montant_comm" DOUBLE PRECISION NOT NULL,
    "montant_net" DOUBLE PRECISION NOT NULL,
    "canal" "PaymentCanal" NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'DEDUITE',
    "reversal_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commission_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "float_pools" (
    "id" TEXT NOT NULL,
    "compte_ref" TEXT NOT NULL,
    "partenaire_banque" TEXT NOT NULL,
    "solde_total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "solde_disponible" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taux_rendement" DOUBLE PRECISION NOT NULL DEFAULT 4.5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "float_pools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "float_movements" (
    "id" TEXT NOT NULL,
    "pool_id" TEXT NOT NULL,
    "source_type" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "solde_apres" DOUBLE PRECISION NOT NULL,
    "date_valeur" TIMESTAMP(3) NOT NULL,
    "rendement_estime" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "float_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insurance_products" (
    "id" TEXT NOT NULL,
    "assureur_nom" TEXT NOT NULL,
    "code_produit" TEXT NOT NULL,
    "taux_prime" DOUBLE PRECISION NOT NULL,
    "taux_commission" DOUBLE PRECISION NOT NULL,
    "plafond_garantie" DOUBLE PRECISION NOT NULL,
    "nb_mois_couvert" INTEGER NOT NULL DEFAULT 3,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "insurance_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insurance_souscriptions" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "lease_id" TEXT NOT NULL,
    "landlord_id" TEXT NOT NULL,
    "scoring_snapshot" JSONB NOT NULL,
    "montant_prime_annuelle" DOUBLE PRECISION NOT NULL,
    "commission_plateforme" DOUBLE PRECISION NOT NULL,
    "statut" "InsuranceStatus" NOT NULL DEFAULT 'ACTIVE',
    "date_debut" TIMESTAMP(3) NOT NULL,
    "date_fin" TIMESTAMP(3) NOT NULL,
    "reference_assureur" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "insurance_souscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_scoring_history" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "nb_loyers_payes" INTEGER NOT NULL,
    "nb_retards" INTEGER NOT NULL,
    "nb_impayes" INTEGER NOT NULL,
    "nb_mediation" INTEGER NOT NULL,
    "nb_contestations" INTEGER NOT NULL,
    "score_final" INTEGER NOT NULL,
    "tranche" TEXT NOT NULL,
    "computed_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_scoring_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_transactions" (
    "id" TEXT NOT NULL,
    "lead_id" TEXT NOT NULL,
    "agence_id" TEXT NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "canal" "PaymentCanal",
    "statut" TEXT NOT NULL DEFAULT 'COMPLETE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lead_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agence_api_accesses" (
    "id" TEXT NOT NULL,
    "agence_id" TEXT NOT NULL,
    "tier" TEXT NOT NULL DEFAULT 'BASIC',
    "api_key" TEXT NOT NULL,
    "api_secret" TEXT NOT NULL,
    "requests_per_day" INTEGER NOT NULL DEFAULT 100,
    "montant_mensuel" DOUBLE PRECISION NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "last_used_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agence_api_accesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diaspora_payment_history" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "stripe_invoice_id" TEXT NOT NULL,
    "montant_eur" DOUBLE PRECISION NOT NULL,
    "montant_fcfa" DOUBLE PRECISION NOT NULL,
    "taux_change" DOUBLE PRECISION NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'PAID',
    "period_debut" TIMESTAMP(3) NOT NULL,
    "period_fin" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "diaspora_payment_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "syndic_factures" (
    "id" TEXT NOT NULL,
    "syndicate_id" TEXT NOT NULL,
    "periode" TEXT NOT NULL,
    "nb_lots" INTEGER NOT NULL,
    "montant_par_lot" DOUBLE PRECISION NOT NULL,
    "montant_total" DOUBLE PRECISION NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "payment_pgw_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "syndic_factures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "syndic_ags" (
    "id" TEXT NOT NULL,
    "syndicate_id" TEXT NOT NULL,
    "date_ag" TIMESTAMP(3) NOT NULL,
    "ordre_du_jour" TEXT NOT NULL,
    "compte_rendu" TEXT,
    "montant_facture" DOUBLE PRECISION,
    "statut" TEXT NOT NULL DEFAULT 'PLANIFIEE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "syndic_ags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_license_contracts" (
    "id" TEXT NOT NULL,
    "client_nom" TEXT NOT NULL,
    "client_type" TEXT NOT NULL,
    "type_acces" TEXT NOT NULL,
    "montant_annuel" DOUBLE PRECISION NOT NULL,
    "api_key_client" TEXT NOT NULL,
    "quota_requetes" INTEGER NOT NULL DEFAULT 1000,
    "date_debut" TIMESTAMP(3) NOT NULL,
    "date_fin" TIMESTAMP(3) NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'ACTIF',
    "clauses_json" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "data_license_contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_api_calls" (
    "id" TEXT NOT NULL,
    "contract_id" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "parametres" JSONB,
    "response_code" INTEGER NOT NULL,
    "latence_ms" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "data_api_calls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market_reports" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "commune" TEXT,
    "periode" TEXT NOT NULL,
    "type_rapport" TEXT NOT NULL,
    "contenu_json" JSONB NOT NULL,
    "pdf_url" TEXT,
    "prix_fcfa" DOUBLE PRECISION NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "market_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "revenue_snapshots" (
    "id" TEXT NOT NULL,
    "periode" TEXT NOT NULL,
    "rev_commissions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rev_float" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rev_assurance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rev_leads" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rev_diaspora" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rev_syndic" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rev_data" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_fcfa" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "revenue_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_consents" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "typeConsentement" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "granted" BOOLEAN NOT NULL DEFAULT false,
    "granted_at" TIMESTAMP(3),
    "revoked_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "ip_address" TEXT,
    "user_agent" TEXT,
    "source" TEXT DEFAULT 'WEB',
    "legal_basis" TEXT DEFAULT 'CONSENT',
    "donnees" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_consents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scan_extractions" (
    "scan_id" TEXT NOT NULL,
    "bail_id" TEXT,
    "fichier_url" TEXT NOT NULL,
    "ocr_texte_brut" TEXT,
    "champs_extraits" JSONB,
    "champs_valides" JSONB,
    "statut_pipeline" TEXT NOT NULL DEFAULT 'DEPOSE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scan_extractions_pkey" PRIMARY KEY ("scan_id")
);

-- CreateTable
CREATE TABLE "ventilation_frais" (
    "vent_id" TEXT NOT NULL,
    "bail_id" TEXT,
    "montant_total" INTEGER NOT NULL,
    "part_habiteax" INTEGER NOT NULL,
    "part_cpraima" INTEGER NOT NULL,
    "part_reserve" INTEGER NOT NULL,
    "collecteur" TEXT NOT NULL DEFAULT 'CPRAIMA_CI',
    "reverse_at" TIMESTAMP(3),
    "webhook_ref" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ventilation_frais_pkey" PRIMARY KEY ("vent_id")
);

-- CreateTable
CREATE TABLE "wa_sessions" (
    "session_id" TEXT NOT NULL,
    "numero_wa" TEXT NOT NULL,
    "etat" TEXT NOT NULL DEFAULT 'COLLECTE',
    "pages" JSONB DEFAULT '[]',
    "champs" JSONB DEFAULT '{}',
    "champ_courant" TEXT,
    "dernier_msg_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wa_sessions_pkey" PRIMARY KEY ("session_id")
);

-- CreateTable
CREATE TABLE "wa_message_logs" (
    "log_id" TEXT NOT NULL,
    "wamid" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wa_message_logs_pkey" PRIMARY KEY ("log_id")
);

-- CreateTable
CREATE TABLE "data_processing_activities" (
    "activity_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "legal_basis" TEXT NOT NULL,
    "data_categories" TEXT[],
    "recipients" TEXT[],
    "retention_period" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "dpo_reviewed_at" TIMESTAMP(3),
    "risk_level" TEXT NOT NULL DEFAULT 'LOW',
    "dpia_required" BOOLEAN NOT NULL DEFAULT false,
    "dpia_completed_at" TIMESTAMP(3),
    "cross_border_transfer" BOOLEAN NOT NULL DEFAULT false,
    "cross_border_countries" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "data_processing_activities_pkey" PRIMARY KEY ("activity_id")
);

-- CreateTable
CREATE TABLE "privacy_requests" (
    "request_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "description" TEXT,
    "admin_notes" TEXT,
    "rejection_reason" TEXT,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "due_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "export_url" TEXT,
    "export_expires_at" TIMESTAMP(3),
    "ip_address" TEXT,

    CONSTRAINT "privacy_requests_pkey" PRIMARY KEY ("request_id")
);

-- CreateTable
CREATE TABLE "privacy_event_logs" (
    "log_id" TEXT NOT NULL,
    "user_id" TEXT,
    "event_type" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'INFO',
    "resource" TEXT,
    "details" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "privacy_event_logs_pkey" PRIMARY KEY ("log_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mandats_gestion_biens_mandat_id_property_id_key" ON "mandats_gestion_biens"("mandat_id", "property_id");

-- CreateIndex
CREATE UNIQUE INDEX "automation_settings_user_id_key" ON "automation_settings"("user_id");

-- CreateIndex
CREATE INDEX "vault_cautions_tenant_id_idx" ON "vault_cautions"("tenant_id");

-- CreateIndex
CREATE INDEX "vault_cautions_property_id_idx" ON "vault_cautions"("property_id");

-- CreateIndex
CREATE UNIQUE INDEX "email_verification_tokens_token_key" ON "email_verification_tokens"("token");

-- CreateIndex
CREATE INDEX "email_verification_tokens_user_id_idx" ON "email_verification_tokens"("user_id");

-- CreateIndex
CREATE INDEX "email_verification_tokens_token_idx" ON "email_verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "commission_transactions_payment_pgw_id_key" ON "commission_transactions"("payment_pgw_id");

-- CreateIndex
CREATE INDEX "commission_transactions_lease_id_idx" ON "commission_transactions"("lease_id");

-- CreateIndex
CREATE INDEX "commission_transactions_payment_pgw_id_idx" ON "commission_transactions"("payment_pgw_id");

-- CreateIndex
CREATE INDEX "float_movements_pool_id_idx" ON "float_movements"("pool_id");

-- CreateIndex
CREATE INDEX "float_movements_source_type_source_id_idx" ON "float_movements"("source_type", "source_id");

-- CreateIndex
CREATE UNIQUE INDEX "insurance_products_code_produit_key" ON "insurance_products"("code_produit");

-- CreateIndex
CREATE INDEX "insurance_souscriptions_lease_id_idx" ON "insurance_souscriptions"("lease_id");

-- CreateIndex
CREATE INDEX "tenant_scoring_history_tenant_id_computed_at_idx" ON "tenant_scoring_history"("tenant_id", "computed_at");

-- CreateIndex
CREATE INDEX "lead_transactions_agence_id_idx" ON "lead_transactions"("agence_id");

-- CreateIndex
CREATE UNIQUE INDEX "agence_api_accesses_agence_id_key" ON "agence_api_accesses"("agence_id");

-- CreateIndex
CREATE UNIQUE INDEX "agence_api_accesses_api_key_key" ON "agence_api_accesses"("api_key");

-- CreateIndex
CREATE INDEX "diaspora_payment_history_user_id_idx" ON "diaspora_payment_history"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "syndic_factures_syndicate_id_periode_key" ON "syndic_factures"("syndicate_id", "periode");

-- CreateIndex
CREATE UNIQUE INDEX "data_license_contracts_api_key_client_key" ON "data_license_contracts"("api_key_client");

-- CreateIndex
CREATE INDEX "data_api_calls_contract_id_createdAt_idx" ON "data_api_calls"("contract_id", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "revenue_snapshots_periode_key" ON "revenue_snapshots"("periode");

-- CreateIndex
CREATE INDEX "user_consents_user_id_idx" ON "user_consents"("user_id");

-- CreateIndex
CREATE INDEX "user_consents_typeConsentement_idx" ON "user_consents"("typeConsentement");

-- CreateIndex
CREATE INDEX "user_consents_granted_idx" ON "user_consents"("granted");

-- CreateIndex
CREATE INDEX "wa_sessions_numero_wa_idx" ON "wa_sessions"("numero_wa");

-- CreateIndex
CREATE UNIQUE INDEX "wa_message_logs_wamid_key" ON "wa_message_logs"("wamid");

-- CreateIndex
CREATE INDEX "data_processing_activities_legal_basis_idx" ON "data_processing_activities"("legal_basis");

-- CreateIndex
CREATE INDEX "data_processing_activities_risk_level_idx" ON "data_processing_activities"("risk_level");

-- CreateIndex
CREATE INDEX "data_processing_activities_is_active_idx" ON "data_processing_activities"("is_active");

-- CreateIndex
CREATE INDEX "privacy_requests_user_id_idx" ON "privacy_requests"("user_id");

-- CreateIndex
CREATE INDEX "privacy_requests_status_idx" ON "privacy_requests"("status");

-- CreateIndex
CREATE INDEX "privacy_requests_type_idx" ON "privacy_requests"("type");

-- CreateIndex
CREATE INDEX "privacy_requests_due_at_idx" ON "privacy_requests"("due_at");

-- CreateIndex
CREATE INDEX "privacy_event_logs_user_id_idx" ON "privacy_event_logs"("user_id");

-- CreateIndex
CREATE INDEX "privacy_event_logs_event_type_idx" ON "privacy_event_logs"("event_type");

-- CreateIndex
CREATE INDEX "privacy_event_logs_severity_idx" ON "privacy_event_logs"("severity");

-- CreateIndex
CREATE INDEX "privacy_event_logs_created_at_idx" ON "privacy_event_logs"("created_at");

-- CreateIndex
CREATE INDEX "audit_log_user_id_idx" ON "audit_log"("user_id");

-- CreateIndex
CREATE INDEX "audit_log_entity_id_idx" ON "audit_log"("entity_id");

-- CreateIndex
CREATE INDEX "audit_log_created_at_idx" ON "audit_log"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "factures_utilities_lease_id_mois_facture_type_utility_key" ON "factures_utilities"("lease_id", "mois_facture", "type_utility");

-- CreateIndex
CREATE INDEX "fiscal_dossiers_statut_idx" ON "fiscal_dossiers"("statut");

-- CreateIndex
CREATE INDEX "mandates_agent_id_status_idx" ON "mandates"("agent_id", "status");

-- CreateIndex
CREATE INDEX "mandates_property_id_idx" ON "mandates"("property_id");

-- CreateIndex
CREATE INDEX "notification_logs_statut_created_at_idx" ON "notification_logs"("statut", "created_at");

-- CreateIndex
CREATE INDEX "notifications_user_id_created_at_idx" ON "notifications"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "notifications_status_idx" ON "notifications"("status");

-- CreateIndex
CREATE INDEX "prepayment_requests_status_idx" ON "prepayment_requests"("status");

-- CreateIndex
CREATE INDEX "procedure_phases_lease_id_idx" ON "procedure_phases"("lease_id");

-- CreateIndex
CREATE INDEX "sms_declarations_statut_created_at_idx" ON "sms_declarations"("statut", "created_at");

-- CreateIndex
CREATE INDEX "tickets_maintenance_statut_idx" ON "tickets_maintenance"("statut");

-- CreateIndex
CREATE INDEX "webhook_events_operator_event_type_idx" ON "webhook_events"("operator", "event_type");

-- CreateIndex
CREATE INDEX "webhook_events_created_at_idx" ON "webhook_events"("created_at");

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_syndicate_id_fkey" FOREIGN KEY ("syndicate_id") REFERENCES "syndicates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leases" ADD CONSTRAINT "leases_mandat_gestion_id_fkey" FOREIGN KEY ("mandat_gestion_id") REFERENCES "mandats_gestion"("mandat_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mandate_history" ADD CONSTRAINT "mandate_history_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("property_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coloc_payments" ADD CONSTRAINT "coloc_payments_bail_id_fkey" FOREIGN KEY ("bail_id") REFERENCES "leases"("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insurance_claims" ADD CONSTRAINT "insurance_claims_insurance_souscription_id_fkey" FOREIGN KEY ("insurance_souscription_id") REFERENCES "insurance_souscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mandats_gestion_biens" ADD CONSTRAINT "mandats_gestion_biens_mandat_id_fkey" FOREIGN KEY ("mandat_id") REFERENCES "mandats_gestion"("mandat_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mandats_gestion_biens" ADD CONSTRAINT "mandats_gestion_biens_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("property_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_settings" ADD CONSTRAINT "automation_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vault_cautions" ADD CONSTRAINT "vault_cautions_float_pool_id_fkey" FOREIGN KEY ("float_pool_id") REFERENCES "float_pools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vault_cautions" ADD CONSTRAINT "vault_cautions_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("property_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vault_cautions" ADD CONSTRAINT "vault_cautions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "syndicates" ADD CONSTRAINT "syndicates_syndic_user_id_fkey" FOREIGN KEY ("syndic_user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_verification_tokens" ADD CONSTRAINT "email_verification_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "abonnements_operateurs" ADD CONSTRAINT "abonnements_operateurs_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases"("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "abonnements_operateurs" ADD CONSTRAINT "abonnements_operateurs_locataire_id_fkey" FOREIGN KEY ("locataire_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commission_transactions" ADD CONSTRAINT "commission_transactions_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases"("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commission_transactions" ADD CONSTRAINT "commission_transactions_payment_pgw_id_fkey" FOREIGN KEY ("payment_pgw_id") REFERENCES "payments_pgw"("payment_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "float_movements" ADD CONSTRAINT "float_movements_pool_id_fkey" FOREIGN KEY ("pool_id") REFERENCES "float_pools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insurance_souscriptions" ADD CONSTRAINT "insurance_souscriptions_landlord_id_fkey" FOREIGN KEY ("landlord_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insurance_souscriptions" ADD CONSTRAINT "insurance_souscriptions_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases"("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insurance_souscriptions" ADD CONSTRAINT "insurance_souscriptions_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "insurance_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_scoring_history" ADD CONSTRAINT "tenant_scoring_history_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_transactions" ADD CONSTRAINT "lead_transactions_agence_id_fkey" FOREIGN KEY ("agence_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_transactions" ADD CONSTRAINT "lead_transactions_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("lead_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agence_api_accesses" ADD CONSTRAINT "agence_api_accesses_agence_id_fkey" FOREIGN KEY ("agence_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diaspora_payment_history" ADD CONSTRAINT "diaspora_payment_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "syndic_factures" ADD CONSTRAINT "syndic_factures_syndicate_id_fkey" FOREIGN KEY ("syndicate_id") REFERENCES "syndicates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "syndic_ags" ADD CONSTRAINT "syndic_ags_syndicate_id_fkey" FOREIGN KEY ("syndicate_id") REFERENCES "syndicates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_api_calls" ADD CONSTRAINT "data_api_calls_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "data_license_contracts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_consents" ADD CONSTRAINT "user_consents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scan_extractions" ADD CONSTRAINT "scan_extractions_bail_id_fkey" FOREIGN KEY ("bail_id") REFERENCES "leases"("lease_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventilation_frais" ADD CONSTRAINT "ventilation_frais_bail_id_fkey" FOREIGN KEY ("bail_id") REFERENCES "leases"("lease_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "privacy_requests" ADD CONSTRAINT "privacy_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "privacy_event_logs" ADD CONSTRAINT "privacy_event_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
