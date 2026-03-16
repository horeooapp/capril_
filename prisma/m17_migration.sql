-- 1. Create Enums if they don't exist
DO $$ BEGIN
    CREATE TYPE "public"."FiscalStatus" AS ENUM (
        'EN_ATTENTE_DECLARATION', 'NOTIFIE', 'EN_COURS_PAIEMENT', 
        'PAYE_CONFIRME', 'ENREGISTRE', 'ECHEC_PAIEMENT', 
        'PAIEMENT_PARTIEL', 'DECLARATION_EN_RETARD', 
        'IGNORE_PAR_BAILLEUR', 'RENOUVELE'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create fiscal_dossiers table
CREATE TABLE IF NOT EXISTS "public"."fiscal_dossiers" (
    "fiscal_id" TEXT NOT NULL,
    "bail_id" TEXT NOT NULL,
    "loyer_mensuel" INTEGER NOT NULL,
    "duree_bail_mois" INTEGER NOT NULL,
    "duree_retenue_mois" INTEGER NOT NULL,
    "base_calcul" INTEGER NOT NULL,
    "taux_applique" DECIMAL(5,4) NOT NULL DEFAULT 0.0250,
    "droits_enregistrement" INTEGER NOT NULL,
    "frais_timbre" INTEGER NOT NULL DEFAULT 1000,
    "frais_qapril" INTEGER NOT NULL,
    "total_dgi" INTEGER NOT NULL,
    "total_bailleur" INTEGER NOT NULL,
    "penalty_amount" INTEGER NOT NULL DEFAULT 0,
    "exonere" BOOLEAN NOT NULL DEFAULT false,
    "statut" "public"."FiscalStatus" NOT NULL DEFAULT 'EN_ATTENTE_DECLARATION',
    "date_limite_legale" TIMESTAMP(3) NOT NULL,
    "cinetpay_transaction_id" TEXT,
    "cinetpay_payment_url" TEXT,
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fiscal_dossiers_pkey" PRIMARY KEY ("fiscal_id")
);

-- 3. Create certificats_fiscaux table
CREATE TABLE IF NOT EXISTS "public"."certificats_fiscaux" (
    "certificat_id" TEXT NOT NULL,
    "fiscal_id" TEXT NOT NULL,
    "numero_certificat" TEXT NOT NULL,
    "qr_token" TEXT NOT NULL,
    "pdf_path" TEXT NOT NULL,
    "hash_sha256" TEXT NOT NULL,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'VALIDE',

    CONSTRAINT "certificats_fiscaux_pkey" PRIMARY KEY ("certificat_id")
);

-- 4. Unique constraints and indexes
CREATE UNIQUE INDEX IF NOT EXISTS "certificats_fiscaux_fiscal_id_key" ON "public"."certificats_fiscaux"("fiscal_id");
CREATE UNIQUE INDEX IF NOT EXISTS "certificats_fiscaux_numero_certificat_key" ON "public"."certificats_fiscaux"("numero_certificat");
CREATE UNIQUE INDEX IF NOT EXISTS "certificats_fiscaux_qr_token_key" ON "public"."certificats_fiscaux"("qr_token");
CREATE INDEX IF NOT EXISTS "fiscal_dossiers_bail_id_idx" ON "public"."fiscal_dossiers"("bail_id");
CREATE INDEX IF NOT EXISTS "fiscal_dossiers_statut_idx" ON "public"."fiscal_dossiers"("statut");

-- 5. Foreign keys
ALTER TABLE "public"."fiscal_dossiers" ADD CONSTRAINT "fiscal_dossiers_bail_id_fkey" FOREIGN KEY ("bail_id") REFERENCES "public"."leases"("lease_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."certificats_fiscaux" ADD CONSTRAINT "certificats_fiscaux_fiscal_id_fkey" FOREIGN KEY ("fiscal_id") REFERENCES "public"."fiscal_dossiers"("fiscal_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 6. Grant permissions to qapril_user
GRANT ALL PRIVILEGES ON TABLE "public"."fiscal_dossiers" TO "qapril_user";
GRANT ALL PRIVILEGES ON TABLE "public"."certificats_fiscaux" TO "qapril_user";
-- Note: Enum permissions are usually global in public schema, but just in case
-- NO special command for enum perms needed in simple pg setup

-- 7. Trigger for updated_at on fiscal_dossiers
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_fiscal_dossiers_updated_at') THEN
        CREATE TRIGGER update_fiscal_dossiers_updated_at
            BEFORE UPDATE ON "public"."fiscal_dossiers"
            FOR EACH ROW
            EXECUTE PROCEDURE update_updated_at_column();
    END IF;
END $$;
