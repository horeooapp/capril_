-- Align database schema with schema.prisma models
-- Restores nullable columns that were prematurely dropped in 20261020194000_security_hardening

ALTER TABLE "identity_documents" ADD COLUMN IF NOT EXISTS "doc_number" TEXT;
ALTER TABLE "identity_documents" ADD COLUMN IF NOT EXISTS "mrz_raw_data" TEXT;
ALTER TABLE "legal_entities" ADD COLUMN IF NOT EXISTS "bank_account" TEXT;
ALTER TABLE "leases" ADD COLUMN IF NOT EXISTS "signing_otp" TEXT;
ALTER TABLE "migration_sessions" ADD COLUMN IF NOT EXISTS "validation_token" TEXT;
ALTER TABLE "signatures_electroniques" ADD COLUMN IF NOT EXISTS "otp_utilise" TEXT;
ALTER TABLE "syndicates" ADD COLUMN IF NOT EXISTS "iban" TEXT;
ALTER TABLE "bien_acces" ADD COLUMN IF NOT EXISTS "justificatif_numero" TEXT;
ALTER TABLE "abonnements_operateurs" ADD COLUMN IF NOT EXISTS "cni_url" TEXT;
ALTER TABLE "agence_api_accesses" ADD COLUMN IF NOT EXISTS "api_key" TEXT;
ALTER TABLE "agence_api_accesses" ADD COLUMN IF NOT EXISTS "api_secret" TEXT;
ALTER TABLE "data_license_contracts" ADD COLUMN IF NOT EXISTS "api_key_client" TEXT;
ALTER TABLE "email_verification_tokens" ADD COLUMN IF NOT EXISTS "token" TEXT;
