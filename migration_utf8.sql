-- CreateEnum
CREATE TYPE "InspectionStatus" AS ENUM ('PLANIFIEE', 'EN_COURS', 'TERMINEE', 'ANNULEE');

-- CreateEnum
CREATE TYPE "CommissionStatut" AS ENUM ('EN_ATTENTE', 'VALIDE', 'PAYE', 'ANNULE');

-- AlterEnum
BEGIN;
CREATE TYPE "UtilityMode_new" AS ENUM ('INDIVIDUEL_LOCATAIRE', 'PARTAGE_PROPRIO', 'INDIVIDUEL_PROPRIO', 'MIXTE', 'NON_APPLICABLE');
ALTER TABLE "leases" ALTER COLUMN "mode_utilities" TYPE "UtilityMode_new" USING ("mode_utilities"::text::"UtilityMode_new");
ALTER TYPE "UtilityMode" RENAME TO "UtilityMode_old";
ALTER TYPE "UtilityMode_new" RENAME TO "UtilityMode";
DROP TYPE "UtilityMode_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "RepartitionModel_new" AS ENUM ('PRORATA_CHAMBRE', 'FORFAIT_FIXE', 'USAGE_DECLARE');
ALTER TABLE "leases" ALTER COLUMN "modele_repartition" TYPE "RepartitionModel_new" USING ("modele_repartition"::text::"RepartitionModel_new");
ALTER TYPE "RepartitionModel" RENAME TO "RepartitionModel_old";
ALTER TYPE "RepartitionModel_new" RENAME TO "RepartitionModel";
DROP TYPE "RepartitionModel_old";
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
BEGIN;
CREATE TYPE "MaintenanceStatus_new" AS ENUM ('EN_ATTENTE', 'PRIS_EN_CHARGE', 'RESOLU', 'CONTESTE', 'LITIGE', 'CLOTURE');
ALTER TABLE "tickets_maintenance" ALTER COLUMN "statut" TYPE "MaintenanceStatus_new" USING ("statut"::text::"MaintenanceStatus_new");
ALTER TYPE "MaintenanceStatus" RENAME TO "MaintenanceStatus_old";
ALTER TYPE "MaintenanceStatus_new" RENAME TO "MaintenanceStatus";
DROP TYPE "MaintenanceStatus_old";
COMMIT;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ReversalStatus" ADD VALUE 'NONE';
ALTER TYPE "ReversalStatus" ADD VALUE 'SUCCESS';

-- DropIndex
DROP INDEX "leases_status_idx";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "active_plan_tier",
ADD COLUMN     "active_plan_tier" "PlanTier" NOT NULL DEFAULT 'LOCATAIRE';

-- AlterTable
ALTER TABLE "properties" DROP COLUMN "area_sqm";

-- AlterTable
ALTER TABLE "leases" DROP COLUMN "alerte30j",
DROP COLUMN "alerte60j",
DROP COLUMN "alerte90j",
DROP COLUMN "draftData",
DROP COLUMN "droitsDgiCalcules",
DROP COLUMN "fraisQapril",
DROP COLUMN "loiApplicable",
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
ADD COLUMN     "draft_data" JSONB,
ADD COLUMN     "droits_dgi_calcules" DOUBLE PRECISION,
ADD COLUMN     "frais_qapril" DOUBLE PRECISION,
ADD COLUMN     "loi_applicable" TEXT NOT NULL DEFAULT 'Loi n┬░2019-576 du 26 juin 2019',
ADD COLUMN     "qr_code_url" TEXT,
ADD COLUMN     "seuil_j15" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "seuil_j3" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "seuil_j7" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "sha256_calcule_le" TIMESTAMP(3),
ADD COLUMN     "sha256_hash" TEXT,
ADD COLUMN     "statut_draft" TEXT NOT NULL DEFAULT 'ACTIF',
ADD COLUMN     "version_draft" INTEGER NOT NULL DEFAULT 1,
DROP COLUMN "mode_utilities",
ADD COLUMN     "mode_utilities" "UtilityMode" NOT NULL DEFAULT 'NON_APPLICABLE',
DROP COLUMN "modele_repartition",
ADD COLUMN     "modele_repartition" "RepartitionModel" NOT NULL DEFAULT 'PRORATA_CHAMBRE';

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
ALTER TABLE "cdc_deposits" DROP COLUMN "initiator",
ADD COLUMN     "initiator" "CDCDepositInitiator" NOT NULL DEFAULT 'OWNER';

-- AlterTable
ALTER TABLE "land_lease_info" DROP COLUMN "usage_declare",
ADD COLUMN     "usage_declare" "TerrainUsage" NOT NULL,
DROP COLUMN "periodicite_loyer",
ADD COLUMN     "periodicite_loyer" "Periodicite" NOT NULL DEFAULT 'MENSUEL';

-- AlterTable
ALTER TABLE "disputes" DROP COLUMN "status",
ADD COLUMN     "status" "DisputeStatus" NOT NULL DEFAULT 'OPEN';

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "insurance_claims" DROP COLUMN "status",
ADD COLUMN     "status" "InsuranceClaimStatus" NOT NULL DEFAULT 'OPEN';

-- AlterTable
ALTER TABLE "mediations" DROP COLUMN "status",
ADD COLUMN     "status" "MediationStatus" NOT NULL DEFAULT 'OPEN';

-- AlterTable
ALTER TABLE "fiscal_dossiers" DROP COLUMN "statut",
ADD COLUMN     "statut" "FiscalStatus" NOT NULL DEFAULT 'EN_ATTENTE_DECLARATION';

-- AlterTable
ALTER TABLE "prepayment_requests" DROP COLUMN "status",
ADD COLUMN     "status" "PrepaymentRequestStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "payments_pgw" DROP COLUMN "reversal_status",
ADD COLUMN     "reversal_status" "ReversalStatus" NOT NULL DEFAULT 'NONE';

-- AlterTable
ALTER TABLE "reversal_transactions" DROP COLUMN "status",
ADD COLUMN     "status" "ReversalStatus" NOT NULL DEFAULT 'SUCCESS';

-- AlterTable
ALTER TABLE "tickets_maintenance" DROP COLUMN "categorie_v2",
ADD COLUMN     "categorie_v2" "MaintenanceCategory" NOT NULL,
DROP COLUMN "statut",
ADD COLUMN     "statut" "MaintenanceStatus" NOT NULL DEFAULT 'EN_ATTENTE';

-- AlterTable
ALTER TABLE "prestataires" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "inspections" DROP COLUMN "status",
ADD COLUMN     "status" "InspectionStatus" NOT NULL DEFAULT 'PLANIFIEE';

-- AlterTable
ALTER TABLE "inspection_rooms" DROP COLUMN "status",
ADD COLUMN     "status" "RoomStatus" NOT NULL DEFAULT 'GOOD';

-- AlterTable
ALTER TABLE "reminder_logs" DROP COLUMN "type",
ADD COLUMN     "type" "ReminderType" NOT NULL;

-- AlterTable
ALTER TABLE "bails_declaratifs" ALTER COLUMN "hash_declaration" DROP NOT NULL;

-- AlterTable
ALTER TABLE "bdq_conversation_states" DROP COLUMN "statut",
ADD COLUMN     "statut" "BdqConvStatut" NOT NULL DEFAULT 'EN_COURS';

-- AlterTable
ALTER TABLE "notification_logs" DROP COLUMN "statut",
ADD COLUMN     "statut" "NotifStatut" NOT NULL DEFAULT 'EN_ATTENTE';

-- AlterTable
ALTER TABLE "mandats_gestion" DROP COLUMN "biens_concernes";

-- AlterTable
ALTER TABLE "agences_regularisation" DROP COLUMN "statut",
ADD COLUMN     "statut" "RegStatut" NOT NULL DEFAULT 'EN_COURS';

-- AlterTable
ALTER TABLE "sms_declarations" DROP COLUMN "statut",
ADD COLUMN     "statut" "DeclStatut" NOT NULL DEFAULT 'EN_ATTENTE';

-- AlterTable
ALTER TABLE "tarifs_negocie" DROP COLUMN "type",
ADD COLUMN     "type" "NegocieType" NOT NULL;

-- AlterTable
ALTER TABLE "signalements_locataire" DROP COLUMN "categorie",
ADD COLUMN     "categorie" "SignalCatEnum" NOT NULL,
DROP COLUMN "statut",
ADD COLUMN     "statut" "SignalStatutEnum" NOT NULL DEFAULT 'ENVOYE';

-- AlterTable
ALTER TABLE "cautions_bail" DROP COLUMN "destination",
ADD COLUMN     "destination" "CautionDestEnum" NOT NULL DEFAULT 'PROPRIETAIRE';

-- AlterTable
ALTER TABLE "preavis_bails" DROP COLUMN "statut",
ADD COLUMN     "statut" "PreavisStatutEnum" NOT NULL DEFAULT 'EMIS';

-- AlterTable
ALTER TABLE "locataire_profils_publics" DROP COLUMN "visibilite",
ADD COLUMN     "visibilite" "VisibEnum" NOT NULL DEFAULT 'INVISIBLE';

-- AlterTable
ALTER TABLE "invitations_bail" DROP COLUMN "statut",
ADD COLUMN     "statut" "InvitStatutEnum" NOT NULL DEFAULT 'ENVOYEE',
ALTER COLUMN "expire_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "champions_prospects" DROP COLUMN "statut",
ADD COLUMN     "statut" "ProspectStatut" NOT NULL DEFAULT 'A_RAPPELER';

-- AlterTable
ALTER TABLE "champions_commissions" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
DROP COLUMN "statut",
ADD COLUMN     "statut" "CommissionStatut" NOT NULL DEFAULT 'EN_ATTENTE';

-- AlterTable
ALTER TABLE "wallet_recharge_links" DROP COLUMN "declencheur",
ADD COLUMN     "declencheur" "DeclencheurEnum" NOT NULL;

-- AlterTable
ALTER TABLE "messagerie_bail" ALTER COLUMN "statut" SET DEFAULT 'ENVOYE';

-- AlterTable
ALTER TABLE "factures_utilities" DROP COLUMN "type_utility",
ADD COLUMN     "type_utility" "UtilityType" NOT NULL,
ALTER COLUMN "mois_facture" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "mandats_gestion_biens" (
    "id" TEXT NOT NULL,
    "mandat_id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,

    CONSTRAINT "mandats_gestion_biens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mandats_gestion_biens_mandat_id_property_id_key" ON "mandats_gestion_biens"("mandat_id", "property_id");

-- CreateIndex
CREATE INDEX "procedure_phases_lease_id_idx" ON "procedure_phases"("lease_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_created_at_idx" ON "notifications"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "notifications_status_idx" ON "notifications"("status");

-- CreateIndex
CREATE INDEX "fiscal_dossiers_statut_idx" ON "fiscal_dossiers"("statut");

-- CreateIndex
CREATE INDEX "prepayment_requests_status_idx" ON "prepayment_requests"("status");

-- CreateIndex
CREATE INDEX "tickets_maintenance_statut_idx" ON "tickets_maintenance"("statut");

-- CreateIndex
CREATE INDEX "notification_logs_statut_created_at_idx" ON "notification_logs"("statut", "created_at");

-- CreateIndex
CREATE INDEX "sms_declarations_statut_created_at_idx" ON "sms_declarations"("statut", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "factures_utilities_lease_id_mois_facture_type_utility_key" ON "factures_utilities"("lease_id", "mois_facture", "type_utility");

-- AddForeignKey
ALTER TABLE "mandate_history" ADD CONSTRAINT "mandate_history_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("property_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coloc_payments" ADD CONSTRAINT "coloc_payments_bail_id_fkey" FOREIGN KEY ("bail_id") REFERENCES "leases"("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mandats_gestion_biens" ADD CONSTRAINT "mandats_gestion_biens_mandat_id_fkey" FOREIGN KEY ("mandat_id") REFERENCES "mandats_gestion"("mandat_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mandats_gestion_biens" ADD CONSTRAINT "mandats_gestion_biens_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("property_id") ON DELETE RESTRICT ON UPDATE CASCADE;

