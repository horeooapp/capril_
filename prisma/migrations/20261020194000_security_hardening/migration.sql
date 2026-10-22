-- CreateEnum BienRole (if not exists)
DO $$ BEGIN
    CREATE TYPE "BienRole" AS ENUM ('OWNER', 'INTERMEDIAIRE', 'AGENCE', 'FIELD_AGENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

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
BEGIN;
CREATE TYPE "UtilityMode_new" AS ENUM ('INDIVIDUEL_LOCATAIRE', 'PARTAGE_PROPRIO', 'INDIVIDUEL_PROPRIO', 'MIXTE', 'NON_APPLICABLE');
ALTER TABLE "leases" ALTER COLUMN "mode_utilities" DROP DEFAULT;
ALTER TABLE "leases" ALTER COLUMN "mode_utilities" TYPE "UtilityMode_new" USING ("mode_utilities"::text::"UtilityMode_new");
ALTER TYPE "UtilityMode" RENAME TO "UtilityMode_old";
ALTER TYPE "UtilityMode_new" RENAME TO "UtilityMode";
DROP TYPE "UtilityMode_old";
ALTER TABLE "leases" ALTER COLUMN "mode_utilities" SET DEFAULT 'NON_APPLICABLE';
COMMIT;

-- DropForeignKey
ALTER TABLE "agence_profiles" DROP CONSTRAINT "agence_profiles_user_id_fkey";

-- DropForeignKey
ALTER TABLE "sms_declarations" DROP CONSTRAINT "sms_declarations_bail_id_fkey";

-- DropForeignKey
ALTER TABLE "sms_declarations" DROP CONSTRAINT "sms_declarations_locataire_id_fkey";

-- DropIndex
DROP INDEX "agence_api_accesses_api_key_key";

-- DropIndex
DROP INDEX "data_license_contracts_api_key_client_key";

-- DropIndex
DROP INDEX "email_verification_tokens_token_idx";

-- DropIndex
DROP INDEX "email_verification_tokens_token_key";

-- DropIndex
DROP INDEX "migration_sessions_validation_token_key";

-- AlterTable
ALTER TABLE "abonnements_operateurs" DROP COLUMN "cni_url",
ADD COLUMN     "cni_s3_key" TEXT;

-- AlterTable
ALTER TABLE "agence_api_accesses" DROP COLUMN "api_key",
DROP COLUMN "api_secret",
ADD COLUMN     "allowed_ips" TEXT[],
ADD COLUMN     "api_key_hash" TEXT NOT NULL,
ADD COLUMN     "api_key_prefix" TEXT,
ADD COLUMN     "api_secret_hash" TEXT NOT NULL,
ADD COLUMN     "expires_at" TIMESTAMP(3),
ADD COLUMN     "revoked_at" TIMESTAMP(3),
ADD COLUMN     "scopes" TEXT[];

-- AlterTable
ALTER TABLE "bien_acces" DROP COLUMN "justificatif_numero",
ADD COLUMN     "justificatif_numero_enc" TEXT,
DROP COLUMN "role",
ADD COLUMN     "role" "BienRole" NOT NULL;

-- AlterTable
ALTER TABLE "commission_transactions" ALTER COLUMN "montant_brut" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "montant_comm" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "montant_net" SET DATA TYPE DECIMAL(18,2);

-- AlterTable
ALTER TABLE "data_license_contracts" DROP COLUMN "api_key_client",
ADD COLUMN     "api_key_client_hash" TEXT NOT NULL,
ADD COLUMN     "api_key_prefix" TEXT;

-- AlterTable
ALTER TABLE "email_verification_tokens" DROP COLUMN "token",
ADD COLUMN     "token_hash" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "float_movements" ALTER COLUMN "montant" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "solde_apres" SET DATA TYPE DECIMAL(18,2);

-- AlterTable
ALTER TABLE "float_pools" ALTER COLUMN "solde_total" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "solde_disponible" SET DATA TYPE DECIMAL(18,2);

-- AlterTable
ALTER TABLE "identity_documents" DROP COLUMN "doc_number",
DROP COLUMN "mrz_raw_data",
ADD COLUMN     "doc_number_enc" TEXT NOT NULL,
ADD COLUMN     "mrz_raw_data_enc" TEXT;

-- AlterTable
ALTER TABLE "lead_transactions" ALTER COLUMN "montant" SET DATA TYPE DECIMAL(18,2);

-- AlterTable
ALTER TABLE "leases" DROP COLUMN "signing_otp",
ADD COLUMN     "signing_otp_attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "signing_otp_expires_at" TIMESTAMP(3),
ADD COLUMN     "signing_otp_hash" TEXT;

-- AlterTable
ALTER TABLE "legal_entities" DROP COLUMN "bank_account",
ADD COLUMN     "bank_account_enc" TEXT;

-- AlterTable
ALTER TABLE "migration_sessions" DROP COLUMN "validation_token",
ADD COLUMN     "validation_token_hash" TEXT;

-- AlterTable
ALTER TABLE "payments_pgw" ALTER COLUMN "montant" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "honoraires_agence" SET DATA TYPE DECIMAL(18,2);

-- AlterTable
ALTER TABLE "pgw_webhooks" ADD COLUMN     "event_id" TEXT;

-- AlterTable
ALTER TABLE "reversal_transactions" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(18,2);

-- AlterTable
ALTER TABLE "signatures_electroniques" DROP COLUMN "otp_utilise",
ADD COLUMN     "otp_attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "otp_hash" TEXT;

-- AlterTable
ALTER TABLE "syndicates" DROP COLUMN "iban",
ADD COLUMN     "iban_enc" TEXT;

-- AlterTable
ALTER TABLE "tva_transactions" ALTER COLUMN "montant_ht" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "montant_tva" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "montant_ttc" SET DATA TYPE DECIMAL(18,2);

-- AlterTable
ALTER TABLE "user_wallet_configs" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "tax_id",
ADD COLUMN     "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "last_login_at" TIMESTAMP(3),
ADD COLUMN     "locked_until" TIMESTAMP(3),
ADD COLUMN     "password_changed_at" TIMESTAMP(3),
ADD COLUMN     "tax_id_enc" TEXT,
ADD COLUMN     "token_version" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "wallet_transactions" ADD COLUMN     "idempotency_key" TEXT;

-- AlterTable
ALTER TABLE "webhook_events" ADD COLUMN     "external_event_id" TEXT;

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "family_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_family_id_idx" ON "refresh_tokens"("family_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_expires_at_idx" ON "refresh_tokens"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_hash_key" ON "password_reset_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_user_id_idx" ON "password_reset_tokens"("user_id");

-- CreateIndex
CREATE INDEX "password_reset_tokens_expires_at_idx" ON "password_reset_tokens"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "agence_api_accesses_api_key_hash_key" ON "agence_api_accesses"("api_key_hash");

-- CreateIndex
CREATE INDEX "agence_api_accesses_api_key_prefix_idx" ON "agence_api_accesses"("api_key_prefix");

-- CreateIndex
CREATE INDEX "agenda_evenements_agence_id_idx" ON "agenda_evenements"("agence_id");

-- CreateIndex
CREATE INDEX "annonces_agence_id_idx" ON "annonces"("agence_id");

-- CreateIndex
CREATE INDEX "bien_acces_user_id_idx" ON "bien_acces"("user_id");

-- CreateIndex
CREATE INDEX "candidatures_logement_id_idx" ON "candidatures"("logement_id");

-- CreateIndex
CREATE INDEX "candidatures_candidat_id_idx" ON "candidatures"("candidat_id");

-- CreateIndex
CREATE UNIQUE INDEX "data_license_contracts_api_key_client_hash_key" ON "data_license_contracts"("api_key_client_hash");

-- CreateIndex
CREATE INDEX "disputes_lease_id_idx" ON "disputes"("lease_id");

-- CreateIndex
CREATE UNIQUE INDEX "email_verification_tokens_token_hash_key" ON "email_verification_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "leases_landlord_id_idx" ON "leases"("landlord_id");

-- CreateIndex
CREATE INDEX "leases_agent_id_idx" ON "leases"("agent_id");

-- CreateIndex
CREATE INDEX "mandats_gestion_proprietaire_id_idx" ON "mandats_gestion"("proprietaire_id");

-- CreateIndex
CREATE INDEX "mandats_gestion_intermediaire_id_idx" ON "mandats_gestion"("intermediaire_id");

-- CreateIndex
CREATE UNIQUE INDEX "migration_sessions_validation_token_hash_key" ON "migration_sessions"("validation_token_hash");

-- CreateIndex
CREATE INDEX "payment_intents_lease_id_idx" ON "payment_intents"("lease_id");

-- CreateIndex
CREATE INDEX "payment_intents_status_idx" ON "payment_intents"("status");

-- CreateIndex
CREATE INDEX "payments_pgw_payeur_id_idx" ON "payments_pgw"("payeur_id");

-- CreateIndex
CREATE UNIQUE INDEX "pgw_webhooks_canal_event_id_key" ON "pgw_webhooks"("canal", "event_id");

-- CreateIndex
CREATE INDEX "preavis_bails_bail_id_idx" ON "preavis_bails"("bail_id");

-- CreateIndex
CREATE INDEX "preavis_bails_locataire_id_idx" ON "preavis_bails"("locataire_id");

-- CreateIndex
CREATE INDEX "properties_managed_by_idx" ON "properties"("managed_by");

-- CreateIndex
CREATE INDEX "reversal_transactions_recipient_id_idx" ON "reversal_transactions"("recipient_id");

-- CreateIndex
CREATE UNIQUE INDEX "reversal_transactions_payment_id_type_key" ON "reversal_transactions"("payment_id", "type");

-- CreateIndex
CREATE INDEX "signatures_electroniques_signataire_id_idx" ON "signatures_electroniques"("signataire_id");

-- CreateIndex
CREATE INDEX "signatures_electroniques_document_type_document_id_idx" ON "signatures_electroniques"("document_type", "document_id");

-- CreateIndex
CREATE INDEX "tickets_maintenance_locataire_id_idx" ON "tickets_maintenance"("locataire_id");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_transactions_idempotency_key_key" ON "wallet_transactions"("idempotency_key");

-- CreateIndex
CREATE UNIQUE INDEX "webhook_events_operator_external_event_id_key" ON "webhook_events"("operator", "external_event_id");

-- AddForeignKey
ALTER TABLE "agence_profiles" ADD CONSTRAINT "agence_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sms_declarations" ADD CONSTRAINT "sms_declarations_bail_id_fkey" FOREIGN KEY ("bail_id") REFERENCES "leases"("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sms_declarations" ADD CONSTRAINT "sms_declarations_locataire_id_fkey" FOREIGN KEY ("locataire_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- =============================================================================
-- security_hardening.sql: Contraintes CHECK & Journaux append-only
-- =============================================================================

-- 1) Contraintes CHECK
ALTER TABLE users                ADD CONSTRAINT chk_users_failed_logins   CHECK (failed_login_attempts >= 0);
ALTER TABLE user_wallet_configs  ADD CONSTRAINT chk_wallet_balance_pos    CHECK (wallet_balance >= 0);
ALTER TABLE wallet_transactions  ADD CONSTRAINT chk_wallet_tx_amount      CHECK (amount <> 0);
ALTER TABLE payments_pgw         ADD CONSTRAINT chk_pgw_montant_pos       CHECK (montant > 0);
ALTER TABLE payment_intents      ADD CONSTRAINT chk_intent_amount_pos     CHECK (amount > 0);
ALTER TABLE reversal_transactions ADD CONSTRAINT chk_reversal_amount_pos  CHECK (amount > 0);
ALTER TABLE leases               ADD CONSTRAINT chk_lease_rent_pos        CHECK (rent_amount >= 0 AND charges_amount >= 0 AND deposit_amount >= 0);
ALTER TABLE leases               ADD CONSTRAINT chk_lease_payment_day     CHECK (payment_day BETWEEN 1 AND 31);
ALTER TABLE commission_configs   ADD CONSTRAINT chk_comm_rate            CHECK ("tauxPourcent" >= 0 AND "tauxPourcent" <= 100);
ALTER TABLE float_pools          ADD CONSTRAINT chk_float_solde           CHECK (solde_disponible >= 0 AND solde_disponible <= solde_total);

-- 2) Journaux append-only (audit, vie privée, tarifs)
CREATE OR REPLACE FUNCTION forbid_log_mutation() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND (to_jsonb(NEW) - 'user_id') = (to_jsonb(OLD) - 'user_id') THEN
    RETURN NEW;
  END IF;
  RAISE EXCEPTION 'Table % is append-only (% refusé)', TG_TABLE_NAME, TG_OP;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS audit_log_immutable ON audit_log;
CREATE TRIGGER audit_log_immutable          BEFORE UPDATE OR DELETE ON audit_log          FOR EACH ROW EXECUTE FUNCTION forbid_log_mutation();

DROP TRIGGER IF EXISTS privacy_event_logs_immutable ON privacy_event_logs;
CREATE TRIGGER privacy_event_logs_immutable BEFORE UPDATE OR DELETE ON privacy_event_logs FOR EACH ROW EXECUTE FUNCTION forbid_log_mutation();

DROP TRIGGER IF EXISTS config_tarifs_audit_immutable ON config_tarifs_audit;
CREATE TRIGGER config_tarifs_audit_immutable BEFORE UPDATE OR DELETE ON config_tarifs_audit FOR EACH ROW EXECUTE FUNCTION forbid_log_mutation();

